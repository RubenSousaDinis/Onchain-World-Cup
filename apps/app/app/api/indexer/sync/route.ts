import { NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { indexEvents } from "@/lib/indexer/event-indexer"
import { processEvents, upgradePendingTransactions } from "@/lib/indexer/transaction-processor"
import { prisma } from "@/lib/prisma"
import { jsonResponse, handleOptions, applyRateLimit, requireAuth } from "@/lib/api-utils"
import { RATE_LIMITS } from "@/lib/rate-limit"

/**
 * OPTIONS /api/indexer/sync
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handleOptions()
}

/**
 * POST /api/indexer/sync
 * Trigger blockchain event indexing and database updates
 *
 * PROTECTED: Requires API key authentication
 * RATE LIMITED: 5 requests per minute
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
 * - Can be triggered on-demand via API call with valid API key
 * - Can be called by Vercel cron job (bypasses auth in localhost)
 * - Can be called by external monitoring service with API key
 *
 * Authentication:
 * - Include API key in Authorization header: "Bearer YOUR_API_KEY"
 * - Or include in X-API-Key header
 * - Authentication bypassed in development (localhost)
 */
export async function POST(request: NextRequest) {
  // Check authentication (bypassed in development)
  const authError = requireAuth(request)
  if (authError) return authError

  // Check rate limit (5 requests per minute)
  const rateLimitError = applyRateLimit(request, RATE_LIMITS.WRITE)
  if (rateLimitError) return rateLimitError

  try {
    const body = await request.json()
    const { chainId } = body

    // Validate chainId
    if (!chainId || (chainId !== 84532 && chainId !== 8453)) {
      return jsonResponse(
        {
          error: "Invalid chainId. Must be 84532 (Base Sepolia) or 8453 (Base Mainnet)",
        },
        400
      )
    }

    console.log(`[Indexer API] Starting sync for chain ${chainId}`)

    // Step 1: Fetch events from blockchain
    const eventsData = await indexEvents(chainId)

    // Step 2: Process events and update database
    const processResult = await processEvents(eventsData)

    // Step 3: Upgrade any pending immediate-index transactions that are missing block numbers
    const upgradeResult = await upgradePendingTransactions(chainId)

    console.log(`[Indexer API] Sync completed successfully`)

    // Invalidate cached API responses so the next fetch returns fresh data
    revalidateTag("qualification-countries", {})
    revalidateTag("qualification-summary", {})
    revalidateTag("qualification-votes", {})

    return jsonResponse({
      success: true,
      chainId,
      blockRange: {
        from: eventsData.fromBlock.toString(),
        to: eventsData.toBlock.toString(),
      },
      processed: processResult.processed,
      pendingUpgraded: upgradeResult.upgraded,
      message: `Successfully indexed ${
        processResult.processed.votes +
        processResult.processed.qualifications +
        processResult.processed.claims +
        processResult.processed.countries
      } events`,
    })
  } catch (error: any) {
    console.error("[Indexer API] Sync failed:", error)
    return jsonResponse(
      {
        error: "Failed to sync blockchain events",
        details: error.message,
      },
      500
    )
  }
}

/**
 * GET /api/indexer/sync
 * Get indexer status and last synced block
 *
 * RATE LIMITED: 20 requests per minute
 *
 * Query params:
 *   - chainId: number (optional, defaults to 84532)
 */
export async function GET(request: NextRequest) {
  // Check rate limit (20 requests per minute)
  const rateLimitError = applyRateLimit(request, RATE_LIMITS.EXPENSIVE_READ)
  if (rateLimitError) return rateLimitError

  try {
    const { searchParams } = new URL(request.url)
    const chainId = parseInt(searchParams.get("chainId") || "84532")

    if (chainId !== 84532 && chainId !== 8453) {
      return jsonResponse(
        {
          error: "Invalid chainId. Must be 84532 (Base Sepolia) or 8453 (Base Mainnet)",
        },
        400
      )
    }

    // Get indexer state from database
    const indexerState = await prisma.indexerState.findUnique({
      where: { chainId },
    })

    if (!indexerState) {
      return jsonResponse({
        chainId,
        lastIndexedBlock: null,
        lastIndexedAt: null,
        status: "not_initialized",
        message: "Indexer has not been initialized yet. Call POST /api/indexer/sync to start indexing.",
      })
    }

    return jsonResponse({
      chainId,
      lastIndexedBlock: indexerState.lastIndexedBlock.toString(),
      lastIndexedAt: indexerState.lastIndexedAt.toISOString(),
      status: "ready",
      message: "Indexer is ready. Call POST /api/indexer/sync to sync new events.",
    })
  } catch (error: any) {
    console.error("[Indexer API] Status check failed:", error)
    return jsonResponse(
      {
        error: "Failed to get indexer status",
        details: error.message,
      },
      500
    )
  }
}
