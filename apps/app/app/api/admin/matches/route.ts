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

    // Accept either UUIDs (team1_id/team2_id) or ISO country codes (team1Code/team2Code)
    const { team1_id, team2_id, team1Code, team2Code, match_start_time, group_id } = body

    if ((!team1_id || !team2_id) && (!team1Code || !team2Code)) {
      return NextResponse.json(
        { error: "Provide team1_id+team2_id or team1Code+team2Code, plus match_start_time" },
        { status: 400 }
      )
    }
    if (!match_start_time) {
      return NextResponse.json({ error: "match_start_time is required" }, { status: 400 })
    }

    let resolvedTeam1Id = team1_id
    let resolvedTeam2Id = team2_id

    if (!resolvedTeam1Id || !resolvedTeam2Id) {
      const { data: countries, error: cErr } = await supabase
        .from("countries")
        .select("id, code")
        .in("code", [team1Code.toUpperCase(), team2Code.toUpperCase()])

      if (cErr || !countries || countries.length < 2) {
        return NextResponse.json({ error: "Could not resolve country codes to DB records" }, { status: 400 })
      }
      resolvedTeam1Id = countries.find((c: { id: string; code: string }) => c.code.toUpperCase() === team1Code.toUpperCase())?.id
      resolvedTeam2Id = countries.find((c: { id: string; code: string }) => c.code.toUpperCase() === team2Code.toUpperCase())?.id

      if (!resolvedTeam1Id || !resolvedTeam2Id) {
        return NextResponse.json({ error: "One or both country codes not found" }, { status: 400 })
      }
    }

    const startTime = new Date(match_start_time)
    const votingEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000)
    const matchEndTime = new Date(startTime.getTime() + 26 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("matches")
      .insert({
        team1_id: resolvedTeam1Id,
        team2_id: resolvedTeam2Id,
        match_start_time: startTime.toISOString(),
        voting_end_time: votingEndTime.toISOString(),
        match_end_time: matchEndTime.toISOString(),
        status: "upcoming",
        group_id: group_id || null,
        is_qualification: false,
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
