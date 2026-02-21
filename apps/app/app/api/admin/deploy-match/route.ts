import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isAdminAddress } from "@/lib/admin"
import { getSupabaseClient } from "@/lib/server/supabase"
import { revalidateTag } from "next/cache"
import { ethers } from "ethers"

import WorldCupMatchArtifact from "@/artifacts/contracts/WorldCupMatch.sol/WorldCupMatch.json"
import EventHubArtifact from "@/artifacts/contracts/WorldCupEventHub.sol/WorldCupEventHub.json"

/**
 * POST /api/admin/deploy-match
 *
 * Deploys a WorldCupMatch contract and authorizes it in the EventHub.
 * When `matchId` is provided, updates the existing DB record with the
 * deployed contract address. Otherwise creates a new record.
 *
 * Body (matchId mode — preferred):
 *   - matchId: string  (UUID of existing undeployed match)
 *
 * Body (create mode — legacy):
 *   - team1Code, team2Code, team1Name, team2Name, matchStartTime, groupId
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = getSupabaseClient()

    // Resolve team names and start time — either from an existing match or from the request body
    let team1Name: string
    let team2Name: string
    let matchStartTime: string
    let existingMatchId: string | null = null

    if (body.matchId) {
      // Load the existing match record
      const { data: matchRow, error: matchFetchErr } = await supabase
        .from("matches")
        .select(`
          id, match_start_time, contract_address,
          team1:countries!matches_team1_id_fkey(name),
          team2:countries!matches_team2_id_fkey(name)
        `)
        .eq("id", body.matchId)
        .single()

      if (matchFetchErr || !matchRow) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }
      if (matchRow.contract_address) {
        return NextResponse.json({ error: "Match already has a contract deployed" }, { status: 400 })
      }

      team1Name = (matchRow.team1 as unknown as { name: string } | null)?.name ?? "Team 1"
      team2Name = (matchRow.team2 as unknown as { name: string } | null)?.name ?? "Team 2"
      matchStartTime = matchRow.match_start_time
      existingMatchId = matchRow.id
    } else {
      // Legacy create mode
      const { team1Code, team2Code, team1Name: t1, team2Name: t2, matchStartTime: mst, groupId } = body
      if (!team1Code || !team2Code || !t1 || !t2 || !mst) {
        return NextResponse.json(
          { error: "Provide matchId, or team1Code+team2Code+team1Name+team2Name+matchStartTime" },
          { status: 400 }
        )
      }
      team1Name = t1
      team2Name = t2
      matchStartTime = mst
      body._legacyGroupId = groupId
      body._legacyTeam1Code = team1Code
      body._legacyTeam2Code = team2Code
    }

    // Validate env vars
    const privateKey = process.env.PRIVATE_KEY
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"
    const eventHubAddress = process.env.NEXT_PUBLIC_EVENT_HUB_ADDRESS
    const platformAddress = process.env.PLATFORM_WALLET_ADDRESS
    const platformFeeBps = parseInt(process.env.PLATFORM_FEE_BPS || "500")

    if (!privateKey) {
      return NextResponse.json({ error: "PRIVATE_KEY env var not set" }, { status: 500 })
    }
    if (!eventHubAddress) {
      return NextResponse.json({ error: "NEXT_PUBLIC_EVENT_HUB_ADDRESS env var not set" }, { status: 500 })
    }

    // Set up ethers provider + signer
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    )
    const deployerAddress = await signer.getAddress()
    const effectivePlatformAddress = platformAddress || deployerAddress

    // Deploy WorldCupMatch
    const matchFactory = new ethers.ContractFactory(
      WorldCupMatchArtifact.abi,
      WorldCupMatchArtifact.bytecode,
      signer
    )

    const deployTime = Math.floor(new Date(matchStartTime).getTime() / 1000)
    const matchContract = await matchFactory.deploy(
      team1Name,
      team2Name,
      deployTime,
      effectivePlatformAddress,
      platformFeeBps,
      eventHubAddress
    )
    await matchContract.waitForDeployment()
    const matchAddress = await matchContract.getAddress()

    // Authorize in EventHub
    const eventHub = new ethers.Contract(eventHubAddress, EventHubArtifact.abi, signer)
    const authTx = await eventHub.authorizeMatch(matchAddress)
    await authTx.wait()

    // Update or create the DB record
    let match: unknown
    if (existingMatchId) {
      const { data, error: updateErr } = await supabase
        .from("matches")
        .update({ contract_address: matchAddress })
        .eq("id", existingMatchId)
        .select()
        .single()

      if (updateErr) {
        console.error("Failed to update match with contract address:", updateErr)
        return NextResponse.json(
          { error: "Contract deployed but failed to update database record.", contractAddress: matchAddress, details: updateErr.message },
          { status: 500 }
        )
      }
      match = data
    } else {
      // Legacy create path
      const { team1Code, team2Code, groupId } = {
        team1Code: body._legacyTeam1Code,
        team2Code: body._legacyTeam2Code,
        groupId: body._legacyGroupId,
      }

      const { data: countries, error: countriesError } = await supabase
        .from("countries")
        .select("id, code")
        .in("code", [team1Code.toUpperCase(), team2Code.toUpperCase()])

      if (countriesError || !countries || countries.length < 2) {
        return NextResponse.json(
          { error: "Contract deployed but failed to find country records.", contractAddress: matchAddress },
          { status: 500 }
        )
      }

      const team1 = countries.find((c: { id: string; code: string }) => c.code.toUpperCase() === team1Code.toUpperCase())
      const team2 = countries.find((c: { id: string; code: string }) => c.code.toUpperCase() === team2Code.toUpperCase())

      if (!team1 || !team2) {
        return NextResponse.json(
          { error: "Country not found in database. Contract deployed at: " + matchAddress, contractAddress: matchAddress },
          { status: 500 }
        )
      }

      const startTime = new Date(matchStartTime)
      const { data, error: insertErr } = await supabase
        .from("matches")
        .insert({
          team1_id: team1.id,
          team2_id: team2.id,
          contract_address: matchAddress,
          match_start_time: startTime.toISOString(),
          voting_end_time: new Date(startTime.getTime() + 24 * 3600_000).toISOString(),
          match_end_time: new Date(startTime.getTime() + 26 * 3600_000).toISOString(),
          status: "upcoming",
          group_id: groupId || null,
          is_qualification: false,
        })
        .select()
        .single()

      if (insertErr) {
        return NextResponse.json(
          { error: "Contract deployed but failed to create database record.", contractAddress: matchAddress, details: insertErr.message },
          { status: 500 }
        )
      }
      match = data
    }

    revalidateTag("matches", "default")

    return NextResponse.json(
      { data: match, contractAddress: matchAddress, deployedBy: deployerAddress, eventHubAuthorized: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/deploy-match:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
