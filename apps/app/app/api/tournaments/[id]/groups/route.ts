import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/tournaments/[id]/groups
 * Fetch all groups for a tournament with standings
 *
 * Caching: 1 hour (structural data, standings update only when matches complete)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params

    // Create cached function for fetching tournament groups
    const getTournamentGroups = unstable_cache(
      async () => {
        const supabase = getSupabaseClient()

        // Fetch groups with standings
        const { data: groups, error } = await supabase
          .from('groups')
          .select(`
            *,
            standings:group_standings(
              *,
              country:countries(id, name, code, flag_emoji)
            )
          `)
          .eq('tournament_id', tournamentId)
          .order('name', { ascending: true })

        if (error) {
          throw new Error(`Failed to fetch groups: ${error.message}`)
        }

        // Sort standings by position within each group
        const groupsWithSortedStandings = groups?.map((group) => ({
          ...group,
          standings: group.standings?.sort(
            (a, b) => ((a as { position?: number }).position || 999) - ((b as { position?: number }).position || 999)
          ),
        }))

        return groupsWithSortedStandings
      },
      ['tournament-groups', tournamentId],
      {
        revalidate: 3600, // 1 hour
        tags: ['tournament-groups', `tournament-${tournamentId}`],
      }
    )

    const data = await getTournamentGroups()

    const response = NextResponse.json({ data })
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments/[id]/groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tournaments/[id]/groups
 * Create a new group for a tournament (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    const supabase = getSupabaseClient()
    const { id: tournamentId } = await params
    const body = await request.json()

    const { name, max_teams } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const displayName = `Group ${name.toUpperCase()}`

    const { data, error } = await supabase
      .from('groups')
      .insert({
        tournament_id: tournamentId,
        name: name.toUpperCase(),
        display_name: displayName,
        max_teams: max_teams || 4,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating group:', error)
      return NextResponse.json(
        { error: 'Failed to create group', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate tournament groups cache
    const { revalidateTag } = await import('next/cache')
    revalidateTag('tournament-groups')
    revalidateTag(`tournament-${tournamentId}`)

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/tournaments/[id]/groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
