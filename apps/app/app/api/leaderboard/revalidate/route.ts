import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/api-utils'

/**
 * POST /api/leaderboard/revalidate
 * Bust all leaderboard cache tags so the next request fetches fresh data.
 */
export async function POST(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  revalidateTag('leaderboard', 'default')
  return NextResponse.json({ success: true })
}
