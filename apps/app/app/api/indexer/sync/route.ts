import { NextRequest, NextResponse } from "next/server"
import { indexEvents } from "@/lib/indexer/event-indexer"
import { processEvents } from "@/lib/indexer/transaction-processor"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/indexer/sync
 * Trigger blockchain event indexing and database updates
 *
 * Body:
 *   - chainId: number (84532 for Base Sepolia, 8453 for Base Mainnet)
 *
 * This endpoint:
 * 1. Fetches new blockchain events from the contract
 * 2. Processes events and updates the database
 * 3. Returns statistics about indexed events
 *
 * Usage:
 * - Can be triggered on-demand via API call
 * - Can be called by Vercel cron job for automatic indexing
 * - Can be called by external monitoring service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chainId } = body

    // Validate chainId
    if (!chainId || (chainId !== 84532 && chainId !== 8453)) {
      return NextResponse.json(
        {
          error: "Invalid chainId. Must be 84532 (Base Sepolia) or 8453 (Base Mainnet)",
        },
        { status: 400 }
      )
    }

    console.log(`[Indexer API] Starting sync for chain ${chainId}`)

    // Step 1: Fetch events from blockchain
    const eventsData = await indexEvents(chainId)

    // Step 2: Process events and update database
    const processResult = await processEvents(eventsData)

    console.log(`[Indexer API] Sync completed successfully`)

    return NextResponse.json({
      success: true,
      chainId,
      blockRange: {
        from: eventsData.fromBlock.toString(),
        to: eventsData.toBlock.toString(),
      },
      processed: processResult.processed,
      message: `Successfully indexed ${
        processResult.processed.votes +
        processResult.processed.qualifications +
        processResult.processed.claims +
        processResult.processed.countries
      } events`,
    })
  } catch (error: any) {
    console.error("[Indexer API] Sync failed:", error)
    return NextResponse.json(
      {
        error: "Failed to sync blockchain events",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/indexer/sync
 * Get indexer status and last synced block
 *
 * Query params:
 *   - chainId: number (optional, defaults to 84532)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chainId = parseInt(searchParams.get("chainId") || "84532")

    if (chainId !== 84532 && chainId !== 8453) {
      return NextResponse.json(
        {
          error: "Invalid chainId. Must be 84532 (Base Sepolia) or 8453 (Base Mainnet)",
        },
        { status: 400 }
      )
    }

    // Get indexer state from database
    const indexerState = await prisma.indexerState.findUnique({
      where: { chainId },
    })

    if (!indexerState) {
      return NextResponse.json({
        chainId,
        lastIndexedBlock: null,
        lastIndexedAt: null,
        status: "not_initialized",
        message: "Indexer has not been initialized yet. Call POST /api/indexer/sync to start indexing.",
      })
    }

    return NextResponse.json({
      chainId,
      lastIndexedBlock: indexerState.lastIndexedBlock.toString(),
      lastIndexedAt: indexerState.lastIndexedAt.toISOString(),
      status: "ready",
      message: "Indexer is ready. Call POST /api/indexer/sync to sync new events.",
    })
  } catch (error: any) {
    console.error("[Indexer API] Status check failed:", error)
    return NextResponse.json(
      {
        error: "Failed to get indexer status",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
