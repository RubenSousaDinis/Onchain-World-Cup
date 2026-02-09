import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createPublicClient, http } from "viem"
import { base, baseSepolia } from "viem/chains"
import { revalidateTag } from "next/cache"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/server/prisma"

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
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress) {
      console.error("[Immediate Index] Unauthorized - no session")
      return NextResponse.json({ error: "Unauthorized - authentication required" }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const { txHash, contractAddress, walletAddress, chainId, countryCode, voteCount, totalCostEth, isFarcasterContext } = body

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
    const publicClient = createPublicClient({
      chain,
      transport: http(),
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
          blockNumber: 0n, // Will be updated by cron when confirmed
        },
      })

      // Update CountryStats
      const existingCountry = await tx.countryStats.findUnique({
        where: { countryCode },
      })

      if (existingCountry) {
        await tx.countryStats.update({
          where: { countryCode },
          data: {
            totalVotes: { increment: parseInt(voteCount.toString()) },
            totalEth: (parseFloat(existingCountry.totalEth) + parseFloat(totalCostEth)).toString(),
          },
        })
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
        // Count unique countries voted for
        const uniqueCountries = await tx.qualificationVote.findMany({
          where: { voterAddress: walletAddress.toLowerCase() },
          select: { countryCode: true },
          distinct: ["countryCode"],
        })

        await tx.userStat.update({
          where: { walletAddress: walletAddress.toLowerCase() },
          data: {
            qualificationVotes: { increment: parseInt(voteCount.toString()) },
            qualificationSpentEth: (parseFloat(existingStats.qualificationSpentEth) + parseFloat(totalCostEth)).toString(),
            totalVotes: { increment: parseInt(voteCount.toString()) },
            totalSpentEth: (parseFloat(existingStats.totalSpentEth) + parseFloat(totalCostEth)).toString(),
            countriesVotedFor: uniqueCountries.length,
          },
        })
      } else {
        // Create new user stat
        await tx.userStat.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
            qualificationVotes: parseInt(voteCount.toString()),
            qualificationSpentEth: totalCostEth.toString(),
            totalVotes: parseInt(voteCount.toString()),
            totalSpentEth: totalCostEth.toString(),
            countriesVotedFor: 1,
            userId: session.user.id,
          },
        })
      }
      })

      console.log("[Immediate Index] Successfully indexed transaction:", txHash)

      // Revalidate Next.js caches to show updated data immediately
      revalidateTag("qualification-countries")
      revalidateTag("qualification-summary")
      console.log("[Immediate Index] Cache revalidated")

      return NextResponse.json(
        {
          success: true,
          txHash,
          status: "pending",
          message: "Transaction indexed immediately - will be confirmed by daily cron job within 24 hours",
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
