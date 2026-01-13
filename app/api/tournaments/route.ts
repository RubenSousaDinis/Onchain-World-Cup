import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/tournaments
 * Fetch all tournaments
 *
 * Query params:
 *   - status: 'upcoming' | 'qualification' | 'group_stage' | 'knockout' | 'completed'
 *   - year: number
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const year = searchParams.get('year')

    let query = supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching tournaments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tournaments', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tournaments
 * Create a new tournament (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const supabase = getSupabaseClient()
    const body = await request.json()

    const {
      name,
      year,
      host_countries,
      total_teams,
      start_date,
      end_date,
    } = body

    if (!name || !year || !total_teams || !start_date || !end_date) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, year, total_teams, start_date, end_date',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        year,
        host_countries: host_countries || [],
        total_teams,
        start_date,
        end_date,
        status: 'upcoming',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating tournament:', error)
      return NextResponse.json(
        { error: 'Failed to create tournament', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
