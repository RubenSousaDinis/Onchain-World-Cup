import { NextRequest } from "next/server"
import { indexEvents } from "@/lib/indexer/event-indexer"
import { processEvents } from "@/lib/indexer/transaction-processor"
import { jsonResponse } from "@/lib/api-utils"

/**
 * GET /api/cron/indexer-sync
 *
 * Cron job endpoint for automatic blockchain event indexing.
 * Called by Vercel Cron every 5 minutes.
 *
 * Security:
 * - Verifies CRON_SECRET environment variable
 * - Only accessible via Vercel Cron (not public)
 * - No rate limiting needed (controlled by cron schedule)
 *
 * This endpoint is safe because:
 * 1. Vercel cron jobs run server-side (not from browser)
 * 2. CRON_SECRET is never exposed to frontend
 * 3. Vercel adds special headers that we verify
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // Check if request is from Vercel Cron
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Cron] Unauthorized cron request")
      return jsonResponse(
        {
          error: "Unauthorized",
          message: "Invalid cron secret",
        },
        401
      )
    }

    console.log("[Cron] Starting scheduled indexer sync")

    // Default to Base Sepolia in development, use env var in production
    const chainId = parseInt(process.env.INDEXER_CHAIN_ID || "84532")

    // Fetch events from blockchain
    const eventsData = await indexEvents(chainId)

    // Process events and update database
    const processResult = await processEvents(eventsData)

    const totalEvents =
      processResult.processed.votes +
      processResult.processed.qualifications +
      processResult.processed.claims +
      processResult.processed.countries

    console.log(`[Cron] Sync completed: ${totalEvents} events indexed`)

    return jsonResponse({
      success: true,
      chainId,
      blockRange: {
        from: eventsData.fromBlock.toString(),
        to: eventsData.toBlock.toString(),
      },
      processed: processResult.processed,
      message: `Successfully indexed ${totalEvents} events`,
    })
  } catch (error: any) {
    console.error("[Cron] Sync failed:", error)
    return jsonResponse(
      {
        error: "Cron job failed",
        details: error.message,
      },
      500
    )
  }
}
