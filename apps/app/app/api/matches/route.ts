import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getSupabaseClient } from '@/lib/server/supabase'
import { isAuthenticated } from '@/lib/api-auth'

/**
 * GET /api/matches
 * Fetch all matches with team information
 *
 * Query params:
 *   - status: 'upcoming' | 'voting' | 'completed' (optional)
 *   - limit: number (default: 50)
 *   - offset: number (default: 0)
 *
 * Caching: 1 hour (live results queried onchain, API data is static)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Create cached function for fetching matches
    const getMatches = unstable_cache(
      async () => {
        const supabase = getSupabaseClient()

        // Build query
        let query = supabase
          .from('matches')
          .select(`
            *,
            team1:countries!matches_team1_id_fkey(id, name, code, flag_emoji),
            team2:countries!matches_team2_id_fkey(id, name, code, flag_emoji)
          `, { count: 'exact' })
          .order('match_start_time', { ascending: true })
          .range(offset, offset + limit - 1)

        // Apply status filter if provided
        if (status && ['upcoming', 'voting', 'completed'].includes(status)) {
          query = query.eq('status', status)
        }

        const { data, error, count } = await query

        if (error) {
          throw new Error(`Failed to fetch matches: ${error.message}`)
        }

        return {
          data,
          count,
          limit,
          offset,
        }
      },
      ['matches', status || 'all', String(limit), String(offset)],
      {
        revalidate: 3600, // 1 hour
        tags: ['matches'],
      }
    )

    const result = await getMatches()

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/matches
 * Create a new match (admin only - add auth check)
 *
 * Body:
 *   - team1_id: string
 *   - team2_id: string
 *   - contract_address: string
 *   - match_start_time: ISO string
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    const body = await request.json()

    // Validate required fields
    const { team1_id, team2_id, contract_address, match_start_time } = body

    if (!team1_id || !team2_id || !contract_address || !match_start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: team1_id, team2_id, contract_address, match_start_time' },
        { status: 400 }
      )
    }

    // Calculate voting_end_time and match_end_time based on contract logic
    const startTime = new Date(match_start_time)
    const votingEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // +24 hours
    const matchEndTime = new Date(startTime.getTime() + 26 * 60 * 60 * 1000) // +26 hours

    const { data, error } = await supabase
      .from('matches')
      .insert({
        team1_id,
        team2_id,
        contract_address,
        match_start_time: startTime.toISOString(),
        voting_end_time: votingEndTime.toISOString(),
        match_end_time: matchEndTime.toISOString(),
        status: 'upcoming',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating match:', error)
      return NextResponse.json(
        { error: 'Failed to create match', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate matches cache
    const { revalidateTag } = await import('next/cache')
    revalidateTag('matches', 'default')

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
