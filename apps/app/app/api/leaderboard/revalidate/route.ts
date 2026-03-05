import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * POST /api/leaderboard/revalidate
 * Bust all leaderboard cache tags so the next request fetches fresh data.
 */
export async function POST() {
  revalidateTag('leaderboard')
  return NextResponse.json({ success: true })
}
