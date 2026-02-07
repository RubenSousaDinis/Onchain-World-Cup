import { NextResponse } from 'next/server'
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
export async function GET() {
  try {
    const TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001' // Fixed tournament ID for World Cup 2026
    const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const TEAMS_PER_GROUP = 4
    const TOTAL_TEAMS = 48
    const CACHE_DURATION_HOURS = 1

    // Check if we need to recalculate (last calculated > 1 hour ago)
    const existingGroups = await prisma.group.findMany({
      where: { tournamentId: TOURNAMENT_ID },
      include: {
        standings: {
          orderBy: { qualRank: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - CACHE_DURATION_HOURS * 60 * 60 * 1000)

    // If groups exist and were calculated recently, return cached data
    if (existingGroups.length > 0 && existingGroups[0].lastCalculated) {
      if (existingGroups[0].lastCalculated > oneHourAgo) {
        return NextResponse.json({
          data: formatGroupsResponse(existingGroups),
          cached: true,
          lastCalculated: existingGroups[0].lastCalculated.toISOString(),
          nextUpdate: new Date(existingGroups[0].lastCalculated.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString()
        })
      }
    }

    // Fetch top 48 countries from qualification
    const topCountries = await prisma.countryStats.findMany({
      orderBy: { totalVotes: 'desc' },
      take: TOTAL_TEAMS,
      select: {
        countryCode: true,
        totalVotes: true,
        totalEth: true
      }
    })

    // Create rankings array with country info
    const rankings = topCountries.map((country, index) => {
      const countryInfo = countriesData.find(
        c => c.code.toUpperCase() === country.countryCode.toUpperCase()
      )

      return {
        rank: index + 1,
        countryCode: country.countryCode,
        countryName: countryInfo?.name || country.countryCode,
        flagEmoji: countryInfo?.flagEmoji || '🏳️',
        totalVotes: country.totalVotes,
        totalEth: country.totalEth
      }
    })

    // Fill with placeholder countries if less than 48
    while (rankings.length < TOTAL_TEAMS) {
      const rank = rankings.length + 1
      rankings.push({
        rank,
        countryCode: `TBD${rank}`,
        countryName: `To Be Determined`,
        flagEmoji: '⏳',
        totalVotes: 0,
        totalEth: '0'
      })
    }

    // Calculate group assignments using snake draft
    const groupAssignments: Record<string, typeof rankings> = {}
    GROUP_NAMES.forEach(name => {
      groupAssignments[name] = []
    })

    // Pot 1 (ranks 1-12): Forward
    for (let i = 0; i < 12; i++) {
      groupAssignments[GROUP_NAMES[i]].push(rankings[i])
    }

    // Pot 2 (ranks 13-24): Reverse for balance
    for (let i = 0; i < 12; i++) {
      groupAssignments[GROUP_NAMES[11 - i]].push(rankings[12 + i])
    }

    // Pot 3 (ranks 25-36): Forward
    for (let i = 0; i < 12; i++) {
      groupAssignments[GROUP_NAMES[i]].push(rankings[24 + i])
    }

    // Pot 4 (ranks 37-48): Reverse
    for (let i = 0; i < 12; i++) {
      groupAssignments[GROUP_NAMES[11 - i]].push(rankings[36 + i])
    }

    // Ensure tournament exists
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
        currentPhase: 'qualification'
      },
      update: {}
    })

    // Delete existing groups and standings for recalculation
    await prisma.groupStanding.deleteMany({
      where: {
        group: {
          tournamentId: TOURNAMENT_ID
        }
      }
    })
    await prisma.group.deleteMany({
      where: { tournamentId: TOURNAMENT_ID }
    })

    // Create groups and standings
    const createdGroups = []
    for (const groupName of GROUP_NAMES) {
      const group = await prisma.group.create({
        data: {
          tournamentId: TOURNAMENT_ID,
          name: groupName,
          displayName: `Group ${groupName}`,
          maxTeams: TEAMS_PER_GROUP,
          lastCalculated: now
        }
      })

      const teams = groupAssignments[groupName]
      const standings = await Promise.all(
        teams.map((team, position) =>
          prisma.groupStanding.create({
            data: {
              groupId: group.id,
              countryCode: team.countryCode,
              qualRank: team.rank,
              position: position + 1
            }
          })
        )
      )

      createdGroups.push({
        ...group,
        standings
      })
    }

    // Fetch and format final data
    const finalGroups = await prisma.group.findMany({
      where: { tournamentId: TOURNAMENT_ID },
      include: {
        standings: {
          orderBy: { qualRank: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      data: formatGroupsResponse(finalGroups),
      cached: false,
      lastCalculated: now.toISOString(),
      nextUpdate: new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Error calculating tournament groups:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tournament groups' },
      { status: 500 }
    )
  }
}

/**
 * Format groups data for API response
 */
function formatGroupsResponse(groups: any[]) {
  return groups.map(group => ({
    id: group.id,
    name: group.name,
    displayName: group.displayName,
    maxTeams: group.maxTeams,
    teams: group.standings.map((standing: any) => {
      const countryInfo = countriesData.find(
        c => c.code.toUpperCase() === standing.countryCode.toUpperCase()
      )

      return {
        countryCode: standing.countryCode,
        countryName: countryInfo?.name || standing.countryCode,
        flagEmoji: countryInfo?.flagEmoji ||
          (standing.countryCode.startsWith('TBD') ? '⏳' : '🏳️'),
        qualRank: standing.qualRank,
        position: standing.position,
        matchesPlayed: standing.matchesPlayed,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        points: standing.points
      }
    })
  }))
}
