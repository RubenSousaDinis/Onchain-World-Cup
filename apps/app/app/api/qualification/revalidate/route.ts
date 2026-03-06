import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * POST /api/qualification/revalidate
 * Bust all qualification cache tags so the next request fetches fresh data.
 */
export async function POST() {
  revalidateTag('qualification-summary', 'default')
  revalidateTag('qualification-countries', 'default')
  revalidateTag('qualification-votes', 'default')
  revalidateTag('qualification-leaderboard', 'default')
  return NextResponse.json({ success: true })
}
