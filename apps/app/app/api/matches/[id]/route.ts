import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import countriesData from '@/data/countries.json'
import { isAuthenticated } from '@/lib/api-auth'

const countryByCode = new Map(countriesData.map(c => [c.code, c]))

function enrichTeam(code: string) {
  const info = countryByCode.get(code)
  return { code, name: info?.name ?? code, flag_emoji: info?.flagEmoji ?? '🏳️' }
}

/**
 * GET /api/matches/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const match = await prisma.match.findUnique({ where: { id } })
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: match.id,
      team1: enrichTeam(match.team1Code),
      team2: enrichTeam(match.team2Code),
      contract_address: match.contractAddress,
      match_start_time: match.matchStartTime,
      voting_end_time:  match.votingEndTime,
      match_end_time:   match.matchEndTime,
      status:       match.status,
      match_type:   match.matchType,
      winning_team: match.winningTeam,
      team1_score:  match.team1Score,
      team2_score:  match.team2Score,
      team1_votes:  0,
      team2_votes:  0,
      recent_votes: [],
    })
  } catch (error) {
    console.error('Error in GET /api/matches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/matches/[id] — update status/scores (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, winning_team, team1_score, team2_score } = body

    const data = await prisma.match.update({
      where: { id },
      data: {
        ...(status       !== undefined ? { status }                          : {}),
        ...(winning_team !== undefined ? { winningTeam: winning_team }       : {}),
        ...(team1_score  !== undefined ? { team1Score:  team1_score }        : {}),
        ...(team2_score  !== undefined ? { team2Score:  team2_score }        : {}),
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/matches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
