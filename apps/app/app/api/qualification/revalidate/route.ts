import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/api-utils'

/**
 * POST /api/qualification/revalidate
 * Bust all qualification cache tags so the next request fetches fresh data.
 */
export async function POST(request: NextRequest) {
  const authError = requireAuth(request)
  if (authError) return authError

  revalidateTag('qualification-summary', 'default')
  revalidateTag('qualification-countries', 'default')
  revalidateTag('qualification-votes', 'default')
  revalidateTag('qualification-leaderboard', 'default')
  return NextResponse.json({ success: true })
}
