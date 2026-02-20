import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isAdminAddress } from "@/lib/admin"
import { getSupabaseClient } from "@/lib/server/supabase"
import { revalidateTag } from "next/cache"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    const { id } = await params
    const body = await request.json()

    const allowedFields = ["status", "winning_team"] as const
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error updating match:", error)
      return NextResponse.json({ error: "Failed to update match", details: error.message }, { status: 500 })
    }

    revalidateTag("matches", "default")

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Unexpected error in PATCH /api/admin/matches/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
