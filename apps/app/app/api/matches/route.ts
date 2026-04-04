import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import countriesData from '@/data/countries.json'

const countryByCode = new Map(countriesData.map(c => [c.code, c]))

function enrichTeam(code: string) {
  const info = countryByCode.get(code)
  return { code, name: info?.name ?? code, flag_emoji: info?.flagEmoji ?? '🏳️' }
}

/**
 * GET /api/matches
 *
 * Query params:
 *   - status: 'upcoming' | 'voting' | 'completed' (optional)
 *   - type: 'real' | 'onchain' (optional)
 *   - limit: number (default: 50, max: 500)
 *   - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const type   = searchParams.get('type')   || undefined
    const limit  = Math.min(parseInt(searchParams.get('limit')  || '50'), 500)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      ...(status ? { status } : {}),
      ...(type   ? { matchType: type } : {}),
    }

    const [rows, count] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { matchStartTime: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.match.count({ where }),
    ])

    const data = rows.map(row => ({
      id:              row.id,
      team1:           enrichTeam(row.team1Code),
      team2:           enrichTeam(row.team2Code),
      contract_address: row.contractAddress,
      match_start_time: row.matchStartTime,
      voting_end_time:  row.votingEndTime,
      match_end_time:   row.matchEndTime,
      status:           row.status,
      match_type:       row.matchType,
      winning_team:     row.winningTeam,
      team1_score:      row.team1Score,
      team2_score:      row.team2Score,
    }))

    const response = NextResponse.json({ data, count, limit, offset })
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
