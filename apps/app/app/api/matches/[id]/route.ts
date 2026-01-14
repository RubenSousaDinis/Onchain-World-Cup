import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/matches/[id]
 * Fetch a single match by ID with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:countries!matches_team1_id_fkey(id, name, code, flag_emoji, fifa_rank),
        team2:countries!matches_team2_id_fkey(id, name, code, flag_emoji, fifa_rank),
        votes(
          id,
          voter_address,
          team_index,
          vote_count,
          total_cost_eth,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        )
      }

      console.error('Supabase error fetching match:', error)
      return NextResponse.json(
        { error: 'Failed to fetch match', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in GET /api/matches/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/matches/[id]
 * Update a match (admin only - add auth check)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication/authorization check
    const supabase = getSupabaseClient()
    const { id } = params
    const body = await request.json()

    // Only allow updating certain fields
    const allowedFields = ['status', 'winning_team']
    const updates: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating match:', error)
      return NextResponse.json(
        { error: 'Failed to update match', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/matches/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
