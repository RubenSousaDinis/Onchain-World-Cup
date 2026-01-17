import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/groups/[id]/standings
 * Fetch standings for a specific group
 *
 * Caching: 15 minutes (standings update only when matches complete)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    // Create cached function for fetching group standings
    const getGroupStandings = unstable_cache(
      async () => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('group_standings')
          .select(`
            *,
            country:countries(id, name, code, flag_emoji, fifa_rank),
            group:groups(id, name, display_name, tournament_id)
          `)
          .eq('group_id', groupId)
          .order('position', { ascending: true })

        if (error) {
          throw new Error(`Failed to fetch standings: ${error.message}`)
        }

        return data
      },
      ['group-standings', groupId],
      {
        revalidate: 900, // 15 minutes
        tags: ['group-standings', `group-${groupId}`],
      }
    )

    const data = await getGroupStandings()

    const response = NextResponse.json({ data })
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/groups/[id]/standings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/groups/[id]/standings
 * Add a team to a group (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    const supabase = getSupabaseClient()
    const { id: groupId } = await params
    const body = await request.json()

    const { country_id } = body

    if (!country_id) {
      return NextResponse.json(
        { error: 'Missing required field: country_id' },
        { status: 400 }
      )
    }

    // Check if group is full
    const { count } = await supabase
      .from('group_standings')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)

    const { data: groupData } = await supabase
      .from('groups')
      .select('max_teams')
      .eq('id', groupId)
      .single()

    if (count && groupData && count >= groupData.max_teams) {
      return NextResponse.json(
        { error: 'Group is full' },
        { status: 400 }
      )
    }

    // Check if country already in this group
    const { data: existing } = await supabase
      .from('group_standings')
      .select('id')
      .eq('group_id', groupId)
      .eq('country_id', country_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Country already in this group' },
        { status: 409 }
      )
    }

    // Add country to group
    const { data, error } = await supabase
      .from('group_standings')
      .insert({
        group_id: groupId,
        country_id,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        votes_for: 0,
        votes_against: 0,
        points: 0,
      })
      .select(`
        *,
        country:countries(id, name, code, flag_emoji)
      `)
      .single()

    if (error) {
      console.error('Supabase error adding team to group:', error)
      return NextResponse.json(
        { error: 'Failed to add team to group', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/groups/[id]/standings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/groups/[id]/standings
 * Recalculate standings for a group (admin only)
 *
 * Invalidates cache after recalculation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    const supabase = getSupabaseClient()
    const { id: groupId } = await params

    // Call the stored procedure to recalculate standings
    const { error } = await supabase.rpc('calculate_group_standings', {
      p_group_id: groupId,
    })

    if (error) {
      console.error('Supabase error recalculating standings:', error)
      return NextResponse.json(
        { error: 'Failed to recalculate standings', details: error.message },
        { status: 500 }
      )
    }

    // Invalidate cache for this group and tournament groups
    revalidateTag('group-standings')
    revalidateTag(`group-${groupId}`)
    revalidateTag('tournament-groups')

    // Fetch updated standings
    const { data, error: fetchError } = await supabase
      .from('group_standings')
      .select(`
        *,
        country:countries(id, name, code, flag_emoji)
      `)
      .eq('group_id', groupId)
      .order('position', { ascending: true })

    if (fetchError) {
      console.error('Supabase error fetching updated standings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated standings', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in PUT /api/groups/[id]/standings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
