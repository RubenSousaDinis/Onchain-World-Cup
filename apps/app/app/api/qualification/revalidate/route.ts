import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * POST /api/qualification/revalidate
 * Bust all qualification cache tags so the next request fetches fresh data.
 */
export async function POST() {
  revalidateTag('qualification-summary')
  revalidateTag('qualification-countries')
  revalidateTag('qualification-votes')
  revalidateTag('qualification-leaderboard')
  return NextResponse.json({ success: true })
}
