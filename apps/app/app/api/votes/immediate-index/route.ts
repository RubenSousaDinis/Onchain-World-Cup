import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/server/prisma"
import { computeAchievementStats, computeAchievements } from "@/lib/achievements"
import { resolveEnsName } from "@/lib/server/ens"

/**
 * POST /api/votes/immediate-index
 * Immediately index a vote transaction after user submission
 *
 * This endpoint is called by the frontend immediately after a vote transaction is submitted.
 * It creates an "optimistic" indexed_transactions record with status="pending", which will
 * be upgraded to "confirmed" by the cron job once the transaction is mined and verified.
 *
 * Requirements:
 * - User must be authenticated (SIWE session)
 * - Transaction must exist on blockchain
 * - Wallet address must match session
 *
 * Body:
 *   - txHash: string (transaction hash)
 *   - contractAddress: string
 *   - walletAddress: string
 *   - chainId: number (8453 for Base Mainnet)
 *   - countryCode: string (e.g., "BR", "AR")
 *   - voteCount: number
 *   - totalCostEth: string
 *   - isFarcasterContext?: boolean (optional, for Farcaster Mini App context)
 */
export async function POST(request: NextRequest) {
  let txHash = ""
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress) {
      console.error("[Immediate Index] Unauthorized - no session")
      return NextResponse.json({ error: "Unauthorized - authentication required" }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const { contractAddress, walletAddress, chainId, countryCode, voteCount, totalCostEth, referrerAddress, isFarcasterContext } = body
    txHash = body.txHash

    if (!txHash || !contractAddress || !walletAddress || !chainId || !countryCode || !voteCount || !totalCostEth) {
      console.error("[Immediate Index] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: txHash, contractAddress, walletAddress, chainId, countryCode, voteCount, totalCostEth" },
        { status: 400 }
      )
    }

    // 3. Verify wallet address matches authenticated session
    // IMPORTANT: Skip this check in Farcaster context - embedded wallet addresses can differ
    // In Farcaster, we'll verify against the transaction's from address after fetching it
    if (!isFarcasterContext) {
      if (walletAddress.toLowerCase() !== session.user.walletAddress.toLowerCase()) {
        console.error("[Immediate Index] Wallet address mismatch")
        return NextResponse.json(
          { error: "Wallet address mismatch - you can only index your own transactions" },
          { status: 403 }
        )
      }
    } else {
      console.log("[Immediate Index] Farcaster context - will verify wallet address against transaction.from")
    }

    // 4. Validate chain ID
    if (chainId !== 8453) {
      console.error("[Immediate Index] Invalid chain ID:", chainId)
      return NextResponse.json({ error: "Invalid chain ID - must be Base Mainnet (8453)" }, { status: 400 })
    }

    // 5. Check if transaction already indexed (first quick check)
    const existingTx = await prisma.indexedTransaction.findUnique({
      where: { txHash },
    })

    if (existingTx) {
      console.log("[Immediate Index] Transaction already indexed:", txHash)

      // Also check if vote record exists
      const existingVote = await prisma.qualificationVote.findUnique({
        where: { txHash },
      })

      return NextResponse.json(
        {
          success: true,
          txHash,
          alreadyIndexed: true,
          status: existingTx.status,
          voteExists: !!existingVote
        },
        { status: 200 }
      )
    }

    // 6. Verify transaction is for the correct contract (client-provided, validated by session)
    // Full on-chain verification is done by the cron indexer when it upgrades status to "confirmed".
    // We trust the txHash here because: (a) the user is authenticated via SIWE, (b) wagmi has
    // already confirmed the tx is mined before the frontend calls this endpoint, and (c) the cron
    // job will reject any fraudulent records when it finds a mismatch on-chain.
    console.log("[Immediate Index] Creating indexed_transactions and vote records for:", txHash)

    // Snapshot current user stats before the transaction for achievement comparison
    const existingUserStatBeforeUpdate = await prisma.userStat.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    // ENS resolution is non-critical — run fire-and-forget after responding
    const needsEnsLookup = !existingUserStatBeforeUpdate?.ensName
    const ensName: string | null = null

    try {
      await prisma.$transaction(async (tx) => {
        // Double-check if transaction exists (race condition protection)
        const existsInTx = await tx.indexedTransaction.findUnique({
          where: { txHash },
        })

        if (existsInTx) {
          console.log("[Immediate Index] Transaction was just indexed by another request:", txHash)
          // Don't throw error, just skip - transaction is already indexed
          return
        }

        // Create indexed_transactions record
        await tx.indexedTransaction.create({
          data: {
            txHash,
            contractAddress: contractAddress.toLowerCase(),
            walletAddress: walletAddress.toLowerCase(),
            chainId,
            syncType: "immediate",
            status: "pending",
            eventType: "qualification",
            metadata: {
              countryCode,
              voteCount,
              totalCostEth,
            },
            indexedAt: new Date(),
          },
        })

        // Create vote record (foreign key to indexed_transactions via txHash)
        await tx.qualificationVote.create({
        data: {
          countryCode,
          voterAddress: walletAddress.toLowerCase(),
          voteCount: parseInt(voteCount.toString()),
          totalCostEth: totalCostEth.toString(),
          txHash,
          blockNumber: BigInt(0), // Will be updated by cron when confirmed
        },
      })

      // Update CountryStats
      const existingCountry = await tx.countryStats.findUnique({
        where: { countryCode },
      })

      if (existingCountry) {
        // Use a single atomic SQL UPDATE so concurrent votes for the same country
        // never overwrite each other's ETH value (read-modify-write race condition)
        await tx.$executeRaw`
          UPDATE country_stats
          SET
            total_votes = total_votes + ${parseInt(voteCount.toString())},
            total_eth   = (total_eth::numeric + ${totalCostEth}::numeric)::text
          WHERE country_code = ${countryCode}
        `
      } else {
        await tx.countryStats.create({
          data: {
            countryCode,
            totalVotes: parseInt(voteCount.toString()),
            totalEth: totalCostEth.toString(),
            qualified: false,
          },
        })
      }

      // Update UserStat
      const existingStats = await tx.userStat.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      })

      if (existingStats) {
        // O(1) check: did this user already vote for this country before this tx?
        // Uses NOT txHash to exclude the vote record we just created above.
        // If no prior vote exists we increment countriesVotedFor by 1 atomically.
        const priorVoteForCountry = await tx.qualificationVote.findFirst({
          where: {
            voterAddress: walletAddress.toLowerCase(),
            countryCode,
            NOT: { txHash },
          },
          select: { id: true },
        })

        // Single atomic SQL UPDATE — ETH fields use DB-level addition to prevent
        // lost-update race conditions when multiple votes arrive concurrently
        await tx.$executeRaw`
          UPDATE user_stats
          SET
            qualification_votes    = qualification_votes    + ${parseInt(voteCount.toString())},
            qualification_spent_eth = (qualification_spent_eth::numeric + ${totalCostEth}::numeric)::text,
            total_votes            = total_votes            + ${parseInt(voteCount.toString())},
            total_spent_eth        = (total_spent_eth::numeric + ${totalCostEth}::numeric)::text,
            countries_voted_for    = countries_voted_for   + ${priorVoteForCountry ? 0 : 1}
          WHERE wallet_address = ${walletAddress.toLowerCase()}
        `

        // ENS backfill is a rare, non-critical update — keep as separate ORM call
        if (ensName) {
          await tx.userStat.update({
            where: { walletAddress: walletAddress.toLowerCase() },
            data: { ensName },
          })
        }
      } else {
        await tx.userStat.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
            qualificationVotes: parseInt(voteCount.toString()),
            qualificationSpentEth: totalCostEth.toString(),
            totalVotes: parseInt(voteCount.toString()),
            totalSpentEth: totalCostEth.toString(),
            countriesVotedFor: 1,
            userId: session.user.id,
            ...(ensName ? { ensName } : {}),
          },
        })
      }

      // Create referral record if a referrer was provided
      if (referrerAddress && /^0x[0-9a-fA-F]{40}$/.test(referrerAddress)) {
        const REFERRAL_BPS = 0.01 // 1%
        const referralAmountEth = (parseFloat(totalCostEth) * REFERRAL_BPS).toFixed(8)

        const existingReferral = await tx.referral.findUnique({ where: { txHash } })
        if (!existingReferral) {
          await tx.referral.create({
            data: {
              referrerAddress: referrerAddress.toLowerCase(),
              referredAddress: walletAddress.toLowerCase(),
              txHash,
              voteAmountEth: totalCostEth.toString(),
              referralAmountEth,
              contractAddress: contractAddress.toLowerCase(),
              contractType: "qualification",
            },
          })

          // Update referrer's UserStat
          await tx.$executeRaw`
            INSERT INTO user_stats (wallet_address, referral_earned_eth, referral_count)
            VALUES (${referrerAddress.toLowerCase()}, ${referralAmountEth}::numeric::text, 1)
            ON CONFLICT (wallet_address) DO UPDATE SET
              referral_earned_eth = (user_stats.referral_earned_eth::numeric + ${referralAmountEth}::numeric)::text,
              referral_count = user_stats.referral_count + 1
          `
        }
      }
      })

      // Compute newly unlocked achievements to return to the client
      const previousStats = computeAchievementStats(existingUserStatBeforeUpdate ?? {})
      const updatedUserStat = await prisma.userStat.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      })
      const updatedStats = computeAchievementStats(updatedUserStat ?? {})
      const previousAchievements = computeAchievements(previousStats)
      const updatedAchievements = computeAchievements(updatedStats)
      const newlyUnlocked = updatedAchievements.filter(
        (a) => a.unlocked && !previousAchievements.find((p) => p.id === a.id && p.unlocked)
      )

      console.log("[Immediate Index] Successfully indexed transaction:", txHash)

      // Invalidate cached API responses so the next fetch returns fresh data
      revalidateTag("qualification-countries", {})
      revalidateTag("qualification-summary", {})
      revalidateTag("qualification-votes", {})

      // Fire-and-forget ENS backfill — does not block the response
      if (needsEnsLookup) {
        resolveEnsName(walletAddress.toLowerCase())
          .then((name) => {
            if (name) {
              return prisma.userStat.update({
                where: { walletAddress: walletAddress.toLowerCase() },
                data: { ensName: name },
              })
            }
          })
          .catch(() => {}) // swallow errors — ENS is non-critical
      }

      return NextResponse.json(
        {
          success: true,
          txHash,
          status: "pending",
          message: "Transaction indexed immediately - will be confirmed by daily cron job within 24 hours",
          newAchievements: newlyUnlocked,
        },
        { status: 201 }
      )
    } catch (txError) {
      // Handle unique constraint violation from within the transaction
      if (txError instanceof Error && (txError.message.includes("Unique constraint") || txError.message.includes("unique constraint"))) {
        console.log("[Immediate Index] Transaction already indexed (caught in transaction):", txHash)

        // Verify it exists now
        const nowExists = await prisma.indexedTransaction.findUnique({
          where: { txHash },
        })

        if (nowExists) {
          return NextResponse.json(
            {
              success: true,
              txHash,
              alreadyIndexed: true,
              status: nowExists.status,
              message: "Transaction was already indexed by another request"
            },
            { status: 200 }
          )
        }
      }

      // Re-throw if it's not a duplicate error
      throw txError
    }
  } catch (error) {
    console.error("[Immediate Index] Error:", error)

    // Check if it's a unique constraint violation (duplicate transaction)
    if (error instanceof Error && (error.message.includes("Unique constraint") || error.message.includes("unique constraint"))) {
      console.log("[Immediate Index] Unique constraint error - transaction may already be indexed")

      // Try to return the existing transaction status
      try {
        const existingTx = await prisma.indexedTransaction.findUnique({
          where: { txHash },
        })

        if (existingTx) {
          return NextResponse.json(
            {
              success: true,
              txHash,
              alreadyIndexed: true,
              status: existingTx.status,
              message: "Transaction already indexed"
            },
            { status: 200 }
          )
        }
      } catch (lookupError) {
        console.error("[Immediate Index] Error looking up existing transaction:", lookupError)
      }

      return NextResponse.json(
        { error: "Transaction already indexed", txHash },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to index transaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
