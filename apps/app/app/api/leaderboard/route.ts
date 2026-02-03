import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

type LeaderboardCategory = 'successful' | 'largest' | 'active' | 'early'

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
    const validCategories: LeaderboardCategory[] = ['successful', 'largest', 'active', 'early']
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
                  createdAt: true,
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

            const rankedData = users.map((user, index) => ({
              rank: offset + index + 1,
              address: user.walletAddress,
              totalVotes: user.qualificationVotes,
              totalWinnings: user.qualificationSpentEth, // Using spent as proxy during qualification
              totalBets: user.countriesVotedFor,
              winRate: 0, // No winnings yet in qualification phase
              farcasterName: null,
              farcasterAvatar: null,
            }))

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

            const rankedData = uniqueVotes.map((vote, index) => ({
              rank: offset + index + 1,
              address: vote.voterAddress,
              largestVote: vote.totalCostEth,
              matchName: `${vote.countryCode} Qualification`,
              team: vote.countryCode,
              totalVotes: vote.voteCount,
              totalWinnings: '0',
              totalBets: 0,
              winRate: 0,
              farcasterName: null,
              farcasterAvatar: null,
            }))

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

            const rankedData = users.map((user, index) => ({
              rank: offset + index + 1,
              address: user.walletAddress,
              totalVotes: user.qualificationVotes,
              totalBets: user.countriesVotedFor,
              totalWinnings: user.qualificationSpentEth,
              winRate: 0,
              farcasterName: null,
              farcasterAvatar: null,
            }))

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
                  createdAt: true,
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

            const rankedData = users.map((user, index) => ({
              rank: offset + index + 1,
              address: user.walletAddress,
              phase1Votes: user.qualificationVotes, // All votes are early in qualification phase
              totalVotes: user.qualificationVotes,
              totalWinnings: user.qualificationSpentEth,
              totalBets: 0,
              winRate: 0,
              farcasterName: null,
              farcasterAvatar: null,
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
