import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/users/[address]
 * Fetch user statistics and voting history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { address } = await params
    const normalizedAddress = address.toLowerCase()

    // Fetch user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Supabase error fetching user stats:', {
        code: statsError.code,
        message: statsError.message,
        details: statsError.details,
        hint: statsError.hint,
      })
      return NextResponse.json(
        {
          error: 'Failed to fetch user stats',
          details: statsError.message,
          code: statsError.code
        },
        { status: 500 }
      )
    }

    // If user doesn't exist yet, return default stats
    if (!stats) {
      return NextResponse.json({
        data: {
          wallet_address: normalizedAddress,
          total_votes: 0,
          total_spent_eth: '0',
          total_won_eth: '0',
          matches_participated: 0,
          matches_won: 0,
          rank: null,
          votes: [],
        },
      })
    }

    // Fetch user's recent votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        *,
        match:matches(
          id,
          status,
          team1:countries!matches_team1_id_fkey(name, code, flag_emoji),
          team2:countries!matches_team2_id_fkey(name, code, flag_emoji)
        )
      `)
      .eq('voter_address', normalizedAddress)
      .order('created_at', { ascending: false })
      .limit(20)

    if (votesError) {
      console.error('Supabase error fetching user votes:', votesError)
    }

    return NextResponse.json({
      data: {
        ...stats,
        votes: votes || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/users/[address]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[address]
 * Update user information (e.g., onboarding completion)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { address } = await params
    const normalizedAddress = address.toLowerCase()
    const body = await request.json()

    // Validate that the address is provided
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('user_stats')
      .select('id')
      .eq('wallet_address', normalizedAddress)
      .single()

    let result

    if (!existingUser) {
      // Create new user record with onboarding data
      const { data, error } = await supabase
        .from('user_stats')
        .insert({
          wallet_address: normalizedAddress,
          onboarding_completed_at: body.onboarding_completed ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating user:', error)
        return NextResponse.json(
          { error: 'Failed to create user record', details: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Update existing user
      const updateData: any = {}

      if (body.onboarding_completed !== undefined) {
        // If true, set timestamp; if false, set to null (reset)
        updateData.onboarding_completed_at = body.onboarding_completed ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('user_stats')
        .update(updateData)
        .eq('wallet_address', normalizedAddress)
        .select()
        .single()

      if (error) {
        console.error('Supabase error updating user:', error)
        return NextResponse.json(
          { error: 'Failed to update user record', details: error.message },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/users/[address]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
