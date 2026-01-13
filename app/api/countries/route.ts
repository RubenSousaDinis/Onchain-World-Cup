import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getSupabaseClient } from '@/lib/server/supabase'

/**
 * GET /api/countries
 * Fetch all countries
 *
 * Query params:
 *   - qualified: 'true' | 'false' (optional) - filter by qualification status
 *   - group: string (optional) - filter by group (e.g., 'A', 'B', 'C')
 *   - limit: number (default: 100)
 *   - offset: number (default: 0)
 *
 * Caching: 1 day (countries rarely change)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const qualified = searchParams.get('qualified') || undefined
    const group = searchParams.get('group') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Create cached function for fetching countries
    const getCountries = unstable_cache(
      async () => {
        const supabase = getSupabaseClient()

        // Build query
        let query = supabase
          .from('countries')
          .select('*', { count: 'exact' })
          .order('fifa_rank', { ascending: true, nullsFirst: false })
          .range(offset, offset + limit - 1)

        // Apply filters
        if (qualified === 'true') {
          query = query.eq('qualified', true)
        } else if (qualified === 'false') {
          query = query.eq('qualified', false)
        }

        if (group) {
          query = query.eq('group', group.toUpperCase())
        }

        const { data, error, count } = await query

        if (error) {
          throw new Error(`Failed to fetch countries: ${error.message}`)
        }

        return {
          data,
          count,
          limit,
          offset,
        }
      },
      ['countries', qualified || 'all', group || 'all', String(limit), String(offset)],
      {
        revalidate: 86400, // 1 day
        tags: ['countries'],
      }
    )

    const result = await getCountries()

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=172800')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/countries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/countries
 * Create a new country (admin only - add auth check)
 *
 * Body:
 *   - name: string
 *   - code: string (ISO 3166-1 alpha-3)
 *   - flag_emoji: string
 *   - fifa_rank: number (optional)
 *   - group: string (optional)
 *   - qualified: boolean (default: false)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check
    const supabase = getSupabaseClient()
    const body = await request.json()

    // Validate required fields
    const { name, code, flag_emoji } = body

    if (!name || !code || !flag_emoji) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code, flag_emoji' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('countries')
      .insert({
        name,
        code: code.toUpperCase(),
        flag_emoji,
        fifa_rank: body.fifa_rank || null,
        group: body.group?.toUpperCase() || null,
        qualified: body.qualified || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating country:', error)
      return NextResponse.json(
        { error: 'Failed to create country', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate countries cache
    const { revalidateTag } = await import('next/cache')
    revalidateTag('countries')

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/countries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
