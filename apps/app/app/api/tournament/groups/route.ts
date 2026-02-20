import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import countriesData from '@/data/countries.json'

/**
 * GET /api/tournament/groups
 *
 * Calculates and returns tournament groups based on current qualification standings.
 * Groups are recalculated on-demand and cached for 1 hour.
 *
 * Algorithm: Snake draft seeding across 12 groups of 4 teams
 * - Pot 1 (ranks 1-12): Forward assignment (A→L)
 * - Pot 2 (ranks 13-24): Reverse assignment (L→A) for balance
 * - Pot 3 (ranks 25-36): Forward assignment (A→L)
 * - Pot 4 (ranks 37-48): Reverse assignment (L→A)
 *
 * Example: Group A gets ranks 1, 24, 25, 48
 *          Group B gets ranks 2, 23, 26, 47
 */

const TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001'
const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const TEAMS_PER_GROUP = 4
const TOTAL_TEAMS = 48
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
}

export async function GET() {
  try {
    const existingGroups = await prisma.group.findMany({
      where: { tournamentId: TOURNAMENT_ID },
      include: {
        standings: { orderBy: { qualRank: 'asc' } },
      },
      orderBy: { name: 'asc' },
    })

    const now = new Date()
    const cacheExpiry = new Date(now.getTime() - CACHE_DURATION_MS)

    // Fresh cache — return immediately
    if (existingGroups.length > 0 && existingGroups[0].lastCalculated) {
      if (existingGroups[0].lastCalculated > cacheExpiry) {
        return NextResponse.json(
          {
            data: formatGroupsResponse(existingGroups),
            cached: true,
            lastCalculated: existingGroups[0].lastCalculated.toISOString(),
            nextUpdate: new Date(
              existingGroups[0].lastCalculated.getTime() + CACHE_DURATION_MS
            ).toISOString(),
          },
          { headers: CACHE_HEADERS }
        )
      }
    }

    // Stale cache — return stale data immediately, recalculate in background
    if (existingGroups.length > 0) {
      after(async () => {
        try {
          await recalculateGroups(now)
        } catch (err) {
          console.error('Background group recalculation failed:', err)
        }
      })

      const lastCalculated = existingGroups[0].lastCalculated ?? now
      return NextResponse.json(
        {
          data: formatGroupsResponse(existingGroups),
          cached: true,
          stale: true,
          lastCalculated: lastCalculated.toISOString(),
          nextUpdate: new Date(lastCalculated.getTime() + CACHE_DURATION_MS).toISOString(),
        },
        { headers: CACHE_HEADERS }
      )
    }

    // No data yet — first load, calculate synchronously
    const groups = await recalculateGroups(now)
    return NextResponse.json(
      {
        data: groups,
        cached: false,
        lastCalculated: now.toISOString(),
        nextUpdate: new Date(now.getTime() + CACHE_DURATION_MS).toISOString(),
      },
      { headers: CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error fetching tournament groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament groups' },
      { status: 500 }
    )
  }
}

/**
 * Recalculates tournament groups from current qualification standings.
 * Uses a transaction + createMany to minimise round-trips to the database.
 */
async function recalculateGroups(now: Date) {
  // Ensure tournament row exists
  await prisma.tournament.upsert({
    where: { id: TOURNAMENT_ID },
    create: {
      id: TOURNAMENT_ID,
      name: 'FIFA World Cup 2026',
      year: 2026,
      hostCountries: ['USA', 'CAN', 'MEX'],
      totalTeams: TOTAL_TEAMS,
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      status: 'qualification',
      currentPhase: 'qualification',
    },
    update: {},
  })

  // Fetch top 48 countries
  const topCountries = await prisma.countryStats.findMany({
    orderBy: { totalVotes: 'desc' },
    take: TOTAL_TEAMS,
    select: { countryCode: true, totalVotes: true, totalEth: true },
  })

  // Build rankings array, pad with TBD if fewer than 48 have votes
  const rankings = topCountries.map((country, index) => {
    const countryInfo = countriesData.find(
      (c) => c.code.toUpperCase() === country.countryCode.toUpperCase()
    )
    return {
      rank: index + 1,
      countryCode: country.countryCode,
      countryName: countryInfo?.name || country.countryCode,
      flagEmoji: countryInfo?.flagEmoji || '🏳️',
      totalVotes: country.totalVotes,
      totalEth: country.totalEth,
    }
  })

  while (rankings.length < TOTAL_TEAMS) {
    const rank = rankings.length + 1
    rankings.push({
      rank,
      countryCode: `TBD${rank}`,
      countryName: 'To Be Determined',
      flagEmoji: '⏳',
      totalVotes: 0,
      totalEth: '0',
    })
  }

  // Snake draft seeding
  const groupAssignments: Record<string, typeof rankings> = {}
  GROUP_NAMES.forEach((name) => { groupAssignments[name] = [] })

  for (let i = 0; i < 12; i++) groupAssignments[GROUP_NAMES[i]].push(rankings[i])       // Pot 1 forward
  for (let i = 0; i < 12; i++) groupAssignments[GROUP_NAMES[11 - i]].push(rankings[12 + i]) // Pot 2 reverse
  for (let i = 0; i < 12; i++) groupAssignments[GROUP_NAMES[i]].push(rankings[24 + i])   // Pot 3 forward
  for (let i = 0; i < 12; i++) groupAssignments[GROUP_NAMES[11 - i]].push(rankings[36 + i]) // Pot 4 reverse

  // Delete existing + recreate in a single transaction, using createMany for standings
  const createdGroups = await prisma.$transaction(async (tx) => {
    await tx.groupStanding.deleteMany({
      where: { group: { tournamentId: TOURNAMENT_ID } },
    })
    await tx.group.deleteMany({
      where: { tournamentId: TOURNAMENT_ID },
    })

    // Create all 12 groups in parallel
    const groups = await Promise.all(
      GROUP_NAMES.map((name) =>
        tx.group.create({
          data: {
            tournamentId: TOURNAMENT_ID,
            name,
            displayName: `Group ${name}`,
            maxTeams: TEAMS_PER_GROUP,
            lastCalculated: now,
          },
        })
      )
    )

    // Batch-create all 48 standings in one query
    const standingsData = groups.flatMap((group, i) =>
      groupAssignments[GROUP_NAMES[i]].map((team, position) => ({
        groupId: group.id,
        countryCode: team.countryCode,
        qualRank: team.rank,
        position: position + 1,
      }))
    )
    await tx.groupStanding.createMany({ data: standingsData })

    return groups
  })

  // Build response from in-memory data (no extra DB round-trip needed)
  return createdGroups.map((group, i) => ({
    id: group.id,
    name: group.name,
    displayName: group.displayName,
    maxTeams: group.maxTeams,
    teams: groupAssignments[GROUP_NAMES[i]].map((team, position) => ({
      countryCode: team.countryCode,
      countryName: team.countryName,
      flagEmoji: team.flagEmoji,
      qualRank: team.rank,
      position: position + 1,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
    })),
  }))
}

function formatGroupsResponse(groups: any[]) {
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    displayName: group.displayName,
    maxTeams: group.maxTeams,
    teams: group.standings.map((standing: any) => {
      const countryInfo = countriesData.find(
        (c) => c.code.toUpperCase() === standing.countryCode.toUpperCase()
      )
      return {
        countryCode: standing.countryCode,
        countryName: countryInfo?.name || standing.countryCode,
        flagEmoji:
          countryInfo?.flagEmoji ||
          (standing.countryCode.startsWith('TBD') ? '⏳' : '🏳️'),
        qualRank: standing.qualRank,
        position: standing.position,
        matchesPlayed: standing.matchesPlayed,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        points: standing.points,
      }
    }),
  }))
}
