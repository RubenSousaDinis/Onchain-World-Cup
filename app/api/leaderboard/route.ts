import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/leaderboard
 * Fetch leaderboard of top users
 *
 * Query params:
 *   - limit: number (default: 100)
 *   - offset: number (default: 0)
 *   - sort_by: 'total_won_eth' | 'total_votes' | 'matches_won' (default: 'total_won_eth')
 *
 * Caching: 15 minutes (updates only when matches complete)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort_by') || 'total_won_eth'

    // Validate sort_by parameter
    const validSortFields = ['total_won_eth', 'total_votes', 'matches_won']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'total_won_eth'

    // Create cached function for fetching leaderboard
    const getLeaderboard = unstable_cache(
      async () => {
        const supabase = getSupabaseClient()

        // Fetch leaderboard
        const { data, error, count } = await supabase
          .from('user_stats')
          .select('*', { count: 'exact' })
          .order(sortField, { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Failed to fetch leaderboard: ${error.message}`)
        }

        // Calculate ranks based on current sort field
        const rankedData = data?.map((user, index) => ({
          ...user,
          rank: offset + index + 1,
        }))

        return {
          data: rankedData,
          count,
          limit,
          offset,
          sort_by: sortField,
        }
      },
      ['leaderboard', sortField, String(limit), String(offset)],
      {
        revalidate: 900, // 15 minutes
        tags: ['leaderboard'],
      }
    )

    const result = await getLeaderboard()

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
