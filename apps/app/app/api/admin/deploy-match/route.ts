import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isAdminAddress } from "@/lib/admin"
import { getSupabaseClient } from "@/lib/server/supabase"
import { revalidateTag } from "next/cache"
import { ethers } from "ethers"

// Compiled artifact bytecode + ABI
import WorldCupMatchArtifact from "@/artifacts/contracts/WorldCupMatch.sol/WorldCupMatch.json"
import EventHubArtifact from "@/artifacts/contracts/WorldCupEventHub.sol/WorldCupEventHub.json"

/**
 * POST /api/admin/deploy-match
 *
 * Deploys a new WorldCupMatch contract, authorizes it in the EventHub,
 * then creates the corresponding database record.
 *
 * Body:
 *   - team1Code: string  (ISO country code, e.g. "BR")
 *   - team2Code: string  (ISO country code, e.g. "AR")
 *   - team1Name: string  (display name, e.g. "Brazil")
 *   - team2Name: string  (display name, e.g. "Argentina")
 *   - matchStartTime: ISO string
 *   - groupId: string (optional — tournament group UUID)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { team1Code, team2Code, team1Name, team2Name, matchStartTime, groupId } = body

    if (!team1Code || !team2Code || !team1Name || !team2Name || !matchStartTime) {
      return NextResponse.json(
        { error: "Missing required fields: team1Code, team2Code, team1Name, team2Name, matchStartTime" },
        { status: 400 }
      )
    }

    if (team1Code === team2Code) {
      return NextResponse.json({ error: "Teams must be different" }, { status: 400 })
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

    // Set up provider + signer
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    )
    const deployerAddress = await signer.getAddress()

    // Effective platform address (fallback to deployer if not set)
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

    // Authorize match in EventHub
    const eventHub = new ethers.Contract(eventHubAddress, EventHubArtifact.abi, signer)
    const authTx = await eventHub.authorizeMatch(matchAddress)
    await authTx.wait()

    // Look up country UUIDs in Supabase by country code
    const supabase = getSupabaseClient()

    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, code")
      .in("code", [team1Code.toUpperCase(), team2Code.toUpperCase()])

    if (countriesError || !countries || countries.length < 2) {
      console.error("Failed to find countries:", countriesError)
      return NextResponse.json(
        {
          error: "Contract deployed but failed to find country records in database. Contract address: " + matchAddress,
          contractAddress: matchAddress,
          details: countriesError?.message,
        },
        { status: 500 }
      )
    }

    const team1 = countries.find((c) => c.code.toUpperCase() === team1Code.toUpperCase())
    const team2 = countries.find((c) => c.code.toUpperCase() === team2Code.toUpperCase())

    if (!team1 || !team2) {
      return NextResponse.json(
        {
          error: `Country not found in database. Contract deployed at: ${matchAddress}`,
          contractAddress: matchAddress,
          missingCodes: [!team1 ? team1Code : null, !team2 ? team2Code : null].filter(Boolean),
        },
        { status: 500 }
      )
    }

    // Create match record in Supabase
    const startTime = new Date(matchStartTime)
    const votingEndTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // +24h
    const matchEndTime = new Date(startTime.getTime() + 26 * 60 * 60 * 1000)  // +26h

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        team1_id: team1.id,
        team2_id: team2.id,
        contract_address: matchAddress,
        match_start_time: startTime.toISOString(),
        voting_end_time: votingEndTime.toISOString(),
        match_end_time: matchEndTime.toISOString(),
        status: "upcoming",
        group_id: groupId || null,
        is_qualification: false,
      })
      .select()
      .single()

    if (matchError) {
      console.error("Failed to create match DB record:", matchError)
      return NextResponse.json(
        {
          error: "Contract deployed and authorized but failed to create database record.",
          contractAddress: matchAddress,
          details: matchError.message,
        },
        { status: 500 }
      )
    }

    revalidateTag("matches", "default")

    return NextResponse.json(
      {
        data: match,
        contractAddress: matchAddress,
        deployedBy: deployerAddress,
        eventHubAuthorized: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/deploy-match:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
