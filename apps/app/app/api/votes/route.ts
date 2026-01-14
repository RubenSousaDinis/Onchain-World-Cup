import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/votes
 * Fetch votes with optional filters
 *
 * Query params:
 *   - match_id: string (optional)
 *   - voter_address: string (optional)
 *   - limit: number (default: 50)
 *   - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const matchId = searchParams.get('match_id')
    const voterAddress = searchParams.get('voter_address')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('votes')
      .select(`
        *,
        match:matches(
          id,
          team1:countries!matches_team1_id_fkey(name, flag_emoji),
          team2:countries!matches_team2_id_fkey(name, flag_emoji)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (matchId) {
      query = query.eq('match_id', matchId)
    }

    if (voterAddress) {
      query = query.eq('voter_address', voterAddress.toLowerCase())
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error fetching votes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch votes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/votes
 * Record a vote event from blockchain (called by event indexer)
 *
 * Body:
 *   - match_id: string
 *   - voter_address: string
 *   - team_index: number (0 or 1)
 *   - vote_count: number
 *   - total_cost_eth: string
 *   - tx_hash: string
 *   - block_number: number
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check - only allow from trusted indexer
    const supabase = getSupabaseClient()
    const body = await request.json()

    // Validate required fields
    const {
      match_id,
      voter_address,
      team_index,
      vote_count,
      total_cost_eth,
      tx_hash,
      block_number,
    } = body

    if (
      !match_id ||
      !voter_address ||
      team_index === undefined ||
      !vote_count ||
      !total_cost_eth ||
      !tx_hash ||
      !block_number
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: match_id, voter_address, team_index, vote_count, total_cost_eth, tx_hash, block_number',
        },
        { status: 400 }
      )
    }

    // Check for duplicate transaction
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('tx_hash', tx_hash)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Vote already recorded', vote_id: existing.id },
        { status: 409 }
      )
    }

    // Insert vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        match_id,
        voter_address: voter_address.toLowerCase(),
        team_index,
        vote_count,
        total_cost_eth,
        tx_hash,
        block_number,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error recording vote:', error)
      return NextResponse.json(
        { error: 'Failed to record vote', details: error.message },
        { status: 500 }
      )
    }

    // Update user stats asynchronously (fire and forget)
    updateUserStats(voter_address, vote_count, total_cost_eth).catch((err) => {
      console.error('Failed to update user stats:', err)
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to update user statistics
 */
async function updateUserStats(
  walletAddress: string,
  voteCount: number,
  totalCostEth: string
): Promise<void> {
  const supabase = getSupabaseClient()

  // Upsert user stats
  const { data: existingStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (existingStats) {
    // Update existing stats
    await supabase
      .from('user_stats')
      .update({
        total_votes: existingStats.total_votes + voteCount,
        total_spent_eth: (
          parseFloat(existingStats.total_spent_eth) + parseFloat(totalCostEth)
        ).toString(),
        matches_participated: existingStats.matches_participated + 1,
      })
      .eq('wallet_address', walletAddress.toLowerCase())
  } else {
    // Create new stats record
    await supabase.from('user_stats').insert({
      wallet_address: walletAddress.toLowerCase(),
      total_votes: voteCount,
      total_spent_eth: totalCostEth,
      total_won_eth: '0',
      matches_participated: 1,
      matches_won: 0,
    })
  }
}
