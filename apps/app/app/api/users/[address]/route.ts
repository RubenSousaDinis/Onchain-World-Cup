import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[address]
 * Fetch user statistics and voting history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const normalizedAddress = address.toLowerCase()

    // Fetch user stats
    const stats = await prisma.userStat.findUnique({
      where: {
        walletAddress: normalizedAddress,
      },
    })

    // If user doesn't exist yet, return default stats
    if (!stats) {
      return NextResponse.json({
        data: {
          wallet_address: normalizedAddress,
          total_votes: 0,
          total_spent_eth: '0',
          total_won_eth: '0',
          matches_participated: 0,
          matches_won: 0,
          rank: null,
          votes: [],
        },
      })
    }

    // Fetch user's recent votes with match and team information
    const votes = await prisma.vote.findMany({
      where: {
        voterAddress: normalizedAddress,
      },
      include: {
        match: {
          include: {
            team1: {
              select: {
                name: true,
                code: true,
                flagEmoji: true,
              },
            },
            team2: {
              select: {
                name: true,
                code: true,
                flagEmoji: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // Transform votes to match the expected format
    const formattedVotes = votes.map((vote) => ({
      id: vote.id,
      match_id: vote.matchId,
      voter_address: vote.voterAddress,
      team_index: vote.teamIndex,
      vote_count: vote.voteCount,
      total_cost_eth: vote.totalCostEth,
      tx_hash: vote.txHash,
      block_number: Number(vote.blockNumber), // Convert BigInt to number for JSON
      created_at: vote.createdAt.toISOString(),
      match: vote.match
        ? {
            id: vote.match.id,
            status: vote.match.status,
            team1: {
              name: vote.match.team1.name,
              code: vote.match.team1.code,
              flag_emoji: vote.match.team1.flagEmoji,
            },
            team2: {
              name: vote.match.team2.name,
              code: vote.match.team2.code,
              flag_emoji: vote.match.team2.flagEmoji,
            },
          }
        : null,
    }))

    // Transform stats to match the expected format
    const formattedStats = {
      id: stats.id,
      wallet_address: stats.walletAddress,
      total_votes: stats.totalVotes,
      total_spent_eth: stats.totalSpentEth,
      total_won_eth: stats.totalWonEth,
      matches_participated: stats.matchesParticipated,
      matches_won: stats.matchesWon,
      rank: stats.rank,
      onboarding_completed_at: stats.onboardingCompletedAt?.toISOString() || null,
      created_at: stats.createdAt.toISOString(),
      updated_at: stats.updatedAt.toISOString(),
    }

    return NextResponse.json({
      data: {
        ...formattedStats,
        votes: formattedVotes,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/users/[address]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[address]
 * Update user information (e.g., onboarding completion)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const normalizedAddress = address.toLowerCase()
    const body = await request.json()

    // Validate that the address is provided
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: {
      onboardingCompletedAt?: Date | null
    } = {}

    if (body.onboarding_completed !== undefined) {
      updateData.onboardingCompletedAt = body.onboarding_completed
        ? new Date()
        : null
    }

    // Retry logic for connection errors
    const maxRetries = 3
    let result: any = null
    let lastError: any = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Use transaction to ensure atomicity and better connection handling
        result = await prisma.$transaction(
          async (tx) => {
            // Check if user exists
            const existingUser = await tx.userStat.findUnique({
              where: {
                walletAddress: normalizedAddress,
              },
            })

            if (!existingUser) {
              // Create new user record
              try {
                return await tx.userStat.create({
                  data: {
                    walletAddress: normalizedAddress,
                    onboardingCompletedAt: updateData.onboardingCompletedAt,
                  },
                })
              } catch (error: any) {
                // Handle race condition: user might have been created between findUnique and create
                if (error.code === 'P2002') {
                  // Unique constraint violation - fetch and update instead
                  return await tx.userStat.update({
                    where: {
                      walletAddress: normalizedAddress,
                    },
                    data: updateData,
                  })
                }
                throw error
              }
            } else {
              // Update existing user
              return await tx.userStat.update({
                where: {
                  walletAddress: normalizedAddress,
                },
                data: updateData,
              })
            }
          },
          {
            maxWait: 5000, // Maximum time to wait for a transaction slot
            timeout: 10000, // Maximum time the transaction can run
          }
        )

        // Success - break out of retry loop
        break
      } catch (error: any) {
        lastError = error
        // Check if it's a connection error that we should retry
        const isConnectionError =
          error.message?.includes('insufficient data left in message') ||
          error.message?.includes('connection') ||
          error.code === '08P01'

        if (isConnectionError && attempt < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)))
          continue
        }

        // Not a retryable error or max retries reached
        throw error
      }
    }

    if (!result) {
      throw lastError || new Error('Failed to create or update user after retries')
    }

    // Transform to match expected format
    const formattedResult = {
      id: result.id,
      wallet_address: result.walletAddress,
      total_votes: result.totalVotes,
      total_spent_eth: result.totalSpentEth,
      total_won_eth: result.totalWonEth,
      matches_participated: result.matchesParticipated,
      matches_won: result.matchesWon,
      rank: result.rank,
      onboarding_completed_at: result.onboardingCompletedAt?.toISOString() || null,
      created_at: result.createdAt.toISOString(),
      updated_at: result.updatedAt.toISOString(),
    }

    return NextResponse.json({ data: formattedResult })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/users/[address]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
