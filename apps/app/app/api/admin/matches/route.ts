import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isAdminAddress } from "@/lib/admin"
import { getSupabaseClient } from "@/lib/server/supabase"
import { revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    const body = await request.json()

    const { team1_id, team2_id, contract_address, match_start_time } = body

    if (!team1_id || !team2_id || !contract_address || !match_start_time) {
      return NextResponse.json(
        { error: "Missing required fields: team1_id, team2_id, contract_address, match_start_time" },
        { status: 400 }
      )
    }

    const startTime = new Date(match_start_time)
    const votingEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000)
    const matchEndTime = new Date(startTime.getTime() + 26 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("matches")
      .insert({
        team1_id,
        team2_id,
        contract_address,
        match_start_time: startTime.toISOString(),
        voting_end_time: votingEndTime.toISOString(),
        match_end_time: matchEndTime.toISOString(),
        status: "upcoming",
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating match:", error)
      return NextResponse.json({ error: "Failed to create match", details: error.message }, { status: 500 })
    }

    revalidateTag("matches", "default")

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/matches:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
