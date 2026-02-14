import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { computeAchievementStats, computeAchievements, computeTotalPoints } from '@/lib/achievements'

type LeaderboardCategory = 'successful' | 'largest' | 'active' | 'early' | 'achievements'

/**
 * GET /api/leaderboard
 * Fetch leaderboard of top users by category
 *
 * Query params:
 *   - category: 'successful' | 'largest' | 'active' | 'early' (default: 'successful')
 *   - limit: number (default: 100)
 *   - offset: number (default: 0)
 *
 * Categories:
 *   - successful: Top voters by total ETH spent (qualification phase)
 *   - largest: Users with biggest single vote transactions
 *   - active: Most engaged voters by total vote count
 *   - early: Early adopters (first to vote)
 *
 * Caching: 5 minutes (updates frequently during qualification)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const category = (searchParams.get('category') || 'successful') as LeaderboardCategory
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate category parameter
    const validCategories: LeaderboardCategory[] = ['successful', 'largest', 'active', 'early', 'achievements']
    const validatedCategory = validCategories.includes(category) ? category : 'successful'

    // Create cached function for fetching leaderboard
    const getLeaderboard = unstable_cache(
      async () => {
        switch (validatedCategory) {
          case 'successful': {
            // Top voters by total ETH spent in qualification
            const [users, count] = await Promise.all([
              prisma.userStat.findMany({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
                select: {
                  walletAddress: true,
                  qualificationVotes: true,
                  qualificationSpentEth: true,
                  countriesVotedFor: true,
                  rank: true,
                  ensName: true,
                  createdAt: true,
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  qualificationSpentEth: 'desc',
                },
                skip: offset,
                take: limit,
              }),
              prisma.userStat.count({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
              }),
            ])

            const rankedData = users.map((user, index) => {
              const stats = computeAchievementStats({
                qualificationVotes: user.qualificationVotes,
                qualificationSpentEth: user.qualificationSpentEth,
                countriesVotedFor: user.countriesVotedFor,
                rank: user.rank,
                createdAt: user.createdAt,
              })
              return {
                rank: offset + index + 1,
                address: user.walletAddress,
                totalVotes: user.qualificationVotes,
                totalWinnings: user.qualificationSpentEth,
                totalBets: user.countriesVotedFor,
                winRate: 0,
                achievementPoints: computeTotalPoints(computeAchievements(stats)),
                farcasterName: user.user?.name || null,
                farcasterAvatar: user.user?.image || null,
                ensName: user.ensName || null,
              }
            })

            return { data: rankedData, count, category: validatedCategory }
          }

          case 'largest': {
            // Users with largest single vote transactions
            // Fetch all votes and deduplicate by user, keeping only the largest
            const votes = await prisma.qualificationVote.findMany({
              select: {
                voterAddress: true,
                totalCostEth: true,
                voteCount: true,
                countryCode: true,
              },
              orderBy: {
                totalCostEth: 'desc',
              },
              take: limit * 3, // Get more to ensure we have enough unique users
            })

            // Deduplicate by voter_address, keeping only the largest vote per user
            const userMaxVotes = new Map()
            votes.forEach(vote => {
              const existing = userMaxVotes.get(vote.voterAddress)
              if (!existing || parseFloat(vote.totalCostEth) > parseFloat(existing.totalCostEth)) {
                userMaxVotes.set(vote.voterAddress, vote)
              }
            })

            const uniqueVotes = Array.from(userMaxVotes.values())
              .sort((a, b) => parseFloat(b.totalCostEth) - parseFloat(a.totalCostEth))
              .slice(offset, offset + limit)

            // Fetch user profile and stats data for each voter
            const voterAddresses = uniqueVotes.map(v => v.voterAddress)
            const userProfiles = await prisma.userStat.findMany({
              where: {
                walletAddress: {
                  in: voterAddresses,
                },
              },
              select: {
                walletAddress: true,
                qualificationVotes: true,
                qualificationSpentEth: true,
                countriesVotedFor: true,
                rank: true,
                ensName: true,
                createdAt: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            })

            // Create a map for quick lookup
            const profileMap = new Map(
              userProfiles.map(u => [u.walletAddress, u])
            )

            const rankedData = uniqueVotes.map((vote, index) => {
              const profile = profileMap.get(vote.voterAddress)
              const stats = profile
                ? computeAchievementStats({
                    qualificationVotes: profile.qualificationVotes,
                    qualificationSpentEth: profile.qualificationSpentEth,
                    countriesVotedFor: profile.countriesVotedFor,
                    rank: profile.rank,
                    createdAt: profile.createdAt,
                  })
                : computeAchievementStats({})
              return {
                rank: offset + index + 1,
                address: vote.voterAddress,
                largestVote: vote.totalCostEth,
                matchName: `${vote.countryCode} Qualification`,
                team: vote.countryCode,
                totalVotes: vote.voteCount,
                totalWinnings: '0',
                totalBets: 0,
                winRate: 0,
                achievementPoints: computeTotalPoints(computeAchievements(stats)),
                farcasterName: profile?.user?.name || null,
                farcasterAvatar: profile?.user?.image || null,
                ensName: profile?.ensName || null,
              }
            })

            return { data: rankedData, count: userMaxVotes.size, category: validatedCategory }
          }

          case 'active': {
            // Most engaged voters by total vote count
            const [users, count] = await Promise.all([
              prisma.userStat.findMany({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
                select: {
                  walletAddress: true,
                  qualificationVotes: true,
                  qualificationSpentEth: true,
                  countriesVotedFor: true,
                  rank: true,
                  ensName: true,
                  createdAt: true,
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  qualificationVotes: 'desc',
                },
                skip: offset,
                take: limit,
              }),
              prisma.userStat.count({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
              }),
            ])

            const rankedData = users.map((user, index) => {
              const stats = computeAchievementStats({
                qualificationVotes: user.qualificationVotes,
                qualificationSpentEth: user.qualificationSpentEth,
                countriesVotedFor: user.countriesVotedFor,
                rank: user.rank,
                createdAt: user.createdAt,
              })
              return {
                rank: offset + index + 1,
                address: user.walletAddress,
                totalVotes: user.qualificationVotes,
                totalBets: user.countriesVotedFor,
                totalWinnings: user.qualificationSpentEth,
                winRate: 0,
                achievementPoints: computeTotalPoints(computeAchievements(stats)),
                farcasterName: user.user?.name || null,
                farcasterAvatar: user.user?.image || null,
                ensName: user.ensName || null,
              }
            })

            return { data: rankedData, count, category: validatedCategory }
          }

          case 'early': {
            // Early adopters (first to vote)
            const [users, count] = await Promise.all([
              prisma.userStat.findMany({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
                select: {
                  walletAddress: true,
                  qualificationVotes: true,
                  qualificationSpentEth: true,
                  countriesVotedFor: true,
                  rank: true,
                  ensName: true,
                  createdAt: true,
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'asc',
                },
                skip: offset,
                take: limit,
              }),
              prisma.userStat.count({
                where: {
                  qualificationVotes: {
                    gt: 0,
                  },
                },
              }),
            ])

            const rankedData = users.map((user, index) => {
              const stats = computeAchievementStats({
                qualificationVotes: user.qualificationVotes,
                qualificationSpentEth: user.qualificationSpentEth,
                countriesVotedFor: user.countriesVotedFor,
                rank: user.rank,
                createdAt: user.createdAt,
              })
              return {
                rank: offset + index + 1,
                address: user.walletAddress,
                phase1Votes: user.qualificationVotes,
                totalVotes: user.qualificationVotes,
                totalWinnings: user.qualificationSpentEth,
                totalBets: 0,
                winRate: 0,
                achievementPoints: computeTotalPoints(computeAchievements(stats)),
                farcasterName: user.user?.name || null,
                farcasterAvatar: user.user?.image || null,
                ensName: user.ensName || null,
              }
            })

            return { data: rankedData, count, category: validatedCategory }
          }

          case 'achievements': {
            // Users ranked by total achievement points (computed in-process)
            const allUsers = await prisma.userStat.findMany({
              where: {
                qualificationVotes: {
                  gt: 0,
                },
              },
              select: {
                walletAddress: true,
                qualificationVotes: true,
                qualificationSpentEth: true,
                countriesVotedFor: true,
                rank: true,
                ensName: true,
                createdAt: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            })

            // Compute achievement points for each user and sort descending
            const withPoints = allUsers
              .map((user) => {
                const stats = computeAchievementStats({
                  qualificationVotes: user.qualificationVotes,
                  qualificationSpentEth: user.qualificationSpentEth,
                  countriesVotedFor: user.countriesVotedFor,
                  rank: user.rank,
                  createdAt: user.createdAt,
                })
                const achievements = computeAchievements(stats)
                const achievementPoints = computeTotalPoints(achievements)
                return { user, achievementPoints }
              })
              .sort((a, b) => b.achievementPoints - a.achievementPoints)

            const count = withPoints.length
            const paginated = withPoints.slice(offset, offset + limit)

            const rankedData = paginated.map(({ user, achievementPoints }, index) => ({
              rank: offset + index + 1,
              address: user.walletAddress,
              achievementPoints,
              totalVotes: user.qualificationVotes,
              totalWinnings: user.qualificationSpentEth,
              totalBets: user.countriesVotedFor,
              winRate: 0,
              farcasterName: user.user?.name || null,
              farcasterAvatar: user.user?.image || null,
              ensName: user.ensName || null,
            }))

            return { data: rankedData, count, category: validatedCategory }
          }

          default:
            throw new Error('Invalid category')
        }
      },
      ['leaderboard', validatedCategory, String(limit), String(offset)],
      {
        revalidate: 300, // 5 minutes
        tags: ['leaderboard', `leaderboard-${validatedCategory}`],
      }
    )

    const result = await getLeaderboard()

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
