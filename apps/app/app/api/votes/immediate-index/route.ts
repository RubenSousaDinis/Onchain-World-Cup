import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createPublicClient, http } from "viem"
import { base, baseSepolia } from "viem/chains"
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
 *   - chainId: number (8453 or 84532)
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
    const { contractAddress, walletAddress, chainId, countryCode, voteCount, totalCostEth, isFarcasterContext } = body
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
    if (chainId !== 8453 && chainId !== 84532) {
      console.error("[Immediate Index] Invalid chain ID:", chainId)
      return NextResponse.json({ error: "Invalid chain ID - must be Base (8453) or Base Sepolia (84532)" }, { status: 400 })
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

    // 6. Verify transaction exists on blockchain
    const chain = chainId === 8453 ? base : baseSepolia
    // Use the configured RPC URL to avoid rate-limits on the default public endpoint
    // under concurrent load (100 users voting simultaneously = 100 concurrent RPC calls)
    const rpcUrl = chainId === 8453
      ? process.env.BASE_MAINNET_RPC_URL
      : process.env.NEXT_PUBLIC_BASE_RPC_URL
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl || undefined),
    })

    let transaction
    try {
      transaction = await publicClient.getTransaction({ hash: txHash as `0x${string}` })
      if (!transaction) {
        console.error("[Immediate Index] Transaction not found on blockchain:", txHash)
        return NextResponse.json({ error: "Transaction not found on blockchain" }, { status: 404 })
      }
    } catch (error) {
      console.error("[Immediate Index] Error fetching transaction from blockchain:", error)
      return NextResponse.json({ error: "Failed to verify transaction on blockchain" }, { status: 500 })
    }

    // 6.5. In Farcaster context, verify wallet address matches transaction.from (on-chain verification)
    if (isFarcasterContext) {
      const transactionFrom = transaction.from?.toLowerCase()
      const requestWallet = walletAddress.toLowerCase()

      if (transactionFrom !== requestWallet) {
        console.error("[Immediate Index] Farcaster wallet mismatch - transaction.from does not match request wallet")
        console.error("[Immediate Index] Transaction from:", transactionFrom)
        console.error("[Immediate Index] Request wallet:", requestWallet)
        return NextResponse.json(
          { error: "Transaction wallet mismatch - the transaction was not sent from the specified wallet address" },
          { status: 403 }
        )
      }
      console.log("[Immediate Index] Farcaster wallet verified against transaction.from:", transactionFrom)
    }

    // 7. Verify transaction is to the correct contract
    if (transaction.to?.toLowerCase() !== contractAddress.toLowerCase()) {
      console.error("[Immediate Index] Transaction not to contract address")
      return NextResponse.json(
        { error: "Transaction is not to the specified contract address" },
        { status: 400 }
      )
    }

    // 8. Create indexed_transactions record FIRST, then vote record (foreign key relationship)
    console.log("[Immediate Index] Creating indexed_transactions and vote records for:", txHash)

    // Snapshot current user stats before the transaction for achievement comparison
    const existingUserStatBeforeUpdate = await prisma.userStat.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    // Resolve ENS before the transaction — network calls must not block DB transactions
    const ensName = (!existingUserStatBeforeUpdate?.ensName)
      ? await resolveEnsName(walletAddress.toLowerCase()).catch(() => null)
      : null

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

      // Cache revalidation intentionally removed: under concurrent load (100 votes at once)
      // firing revalidateTag on every vote triggers 100 expensive DB re-aggregations in
      // rapid succession. API routes already have a 300s TTL which is acceptable staleness.
      // The voting user receives their result immediately from this response.

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
