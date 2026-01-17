import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/tournaments/[id]/phases
 * Fetch all phases for a tournament
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id: tournamentId } = await params

    const { data, error } = await supabase
      .from('tournament_phases')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('phase_order', { ascending: true })

    if (error) {
      console.error('Supabase error fetching phases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch phases', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments/[id]/phases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tournaments/[id]/phases
 * Create a new phase for a tournament (admin only)
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

    const {
      name,
      display_name,
      phase_order,
      start_date,
      end_date,
    } = body

    if (!name || !display_name || phase_order === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, display_name, phase_order',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tournament_phases')
      .insert({
        tournament_id: tournamentId,
        name,
        display_name,
        phase_order,
        start_date,
        end_date,
        status: 'upcoming',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating phase:', error)
      return NextResponse.json(
        { error: 'Failed to create phase', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/tournaments/[id]/phases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tournaments/[id]/phases/[phaseId]
 * Update phase status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const phaseId = searchParams.get('phaseId')
    const body = await request.json()

    if (!phaseId) {
      return NextResponse.json(
        { error: 'Missing phaseId parameter' },
        { status: 400 }
      )
    }

    const { status, start_date, end_date } = body
    const updates: Record<string, unknown> = {}

    if (status) updates.status = status
    if (start_date) updates.start_date = start_date
    if (end_date) updates.end_date = end_date

    const { data, error } = await supabase
      .from('tournament_phases')
      .update(updates)
      .eq('id', phaseId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating phase:', error)
      return NextResponse.json(
        { error: 'Failed to update phase', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/tournaments/[id]/phases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
