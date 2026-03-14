import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { countries } from '@/lib/countries'
import { prisma } from '@/lib/prisma'
import { handleOptions, addCorsHeaders } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { isAdminAddress } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * OPTIONS /api/countries
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handleOptions()
}

/**
 * GET /api/countries
 * Fetch all countries with optional voting statistics
 *
 * Query params:
 *   - includeStats: 'true' | 'false' (optional) - include voting statistics from country_stats
 *   - qualified: 'true' | 'false' (optional) - filter by qualification status (requires includeStats=true)
 *   - limit: number (default: 100)
 *   - offset: number (default: 0)
 *
 * Returns static country data (code, name, flag) optionally merged with voting stats
 *
 * Caching: 1 day for static data, 5 minutes for data with stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const includeStats = searchParams.get('includeStats') === 'true'
    const qualified = searchParams.get('qualified')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let result: unknown[] = countries

    // Optionally merge with voting statistics
    if (includeStats) {
      const stats = await prisma.countryStats.findMany()
      const statsMap = new Map(stats.map((s) => [s.countryCode, s]))

      result = countries.map((country) => {
        const countryStats = statsMap.get(country.code)
        return {
          code: country.code,
          name: country.name,
          flag_emoji: country.flagEmoji,
          total_votes: countryStats?.totalVotes || 0,
          total_eth: countryStats?.totalEth || '0',
          qualified: countryStats?.qualified || false,
        }
      })

      // Apply qualified filter if requested
      if (qualified === 'true') {
        result = result.filter((c: any) => c.qualified === true)
      } else if (qualified === 'false') {
        result = result.filter((c: any) => c.qualified === false)
      }
    }

    // Apply pagination
    const paginatedData = result.slice(offset, offset + limit)

    const response = NextResponse.json({
      data: paginatedData,
      count: result.length,
      limit,
      offset,
    })

    // Cache static data for 1 day, data with stats for 5 minutes
    const cacheTime = includeStats ? 300 : 86400
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`
    )

    return addCorsHeaders(response)
  } catch (error) {
    console.error('Unexpected error in GET /api/countries:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
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
  const session = await getServerSession(authOptions)
  if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
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
    revalidateTag('countries', "default")

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/countries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
