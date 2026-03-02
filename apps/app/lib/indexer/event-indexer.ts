/**
 * EVENT INDEXER SERVICE
 *
 * Listens to WorldCupQualification contract events and indexes them into the database.
 * This service can be triggered:
 * - On-demand via API endpoint
 * - By Vercel cron job
 * - By external monitoring service
 *
 * Events indexed:
 * - VotePlaced: User votes for a country
 * - QualificationFinalized: Qualification period ends
 * - WinningsClaimed: User claims winnings
 * - CountryAdded/CountryRemoved: Country list changes
 */

import { createPublicClient, http, type Log, parseAbiItem } from "viem"
import { base, baseSepolia } from "viem/chains"
import { getQualificationAddress } from "@/lib/contracts/qualification"
import { prisma } from "@/lib/prisma"

// Chain configuration
const CHAIN_CONFIG = {
  84532: { chain: baseSepolia, rpc: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org" },
  8453: { chain: base, rpc: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org" },
}

/**
 * Create a public client for reading blockchain data
 */
export function createIndexerClient(chainId: number) {
  const config = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpc),
  })
}

/**
 * Get the last indexed block number from database
 * If no record exists, returns a starting block (1000 blocks ago from current)
 */
export async function getLastIndexedBlock(chainId: number): Promise<bigint> {
  const indexerState = await prisma.indexerState.findUnique({
    where: { chainId },
  })

  if (indexerState) {
    console.log(`[Indexer] Found last indexed block for chain ${chainId}: ${indexerState.lastIndexedBlock}`)
    return indexerState.lastIndexedBlock
  }

  // No previous indexing - start from recent blocks to avoid indexing from genesis
  console.log(`[Indexer] No previous indexing found for chain ${chainId}. Starting from recent blocks.`)
  const client = createIndexerClient(chainId)
  const currentBlock = await client.getBlockNumber()

  // Start indexing from 1000 blocks ago (adjust as needed)
  const startBlock = currentBlock - 1000n

  // Save initial state
  await prisma.indexerState.create({
    data: {
      chainId,
      lastIndexedBlock: startBlock,
      lastIndexedAt: new Date(),
    },
  })

  return startBlock
}

/**
 * Save the last indexed block number to database
 */
export async function saveLastIndexedBlock(chainId: number, blockNumber: bigint): Promise<void> {
  await prisma.indexerState.upsert({
    where: { chainId },
    update: {
      lastIndexedBlock: blockNumber,
      lastIndexedAt: new Date(),
    },
    create: {
      chainId,
      lastIndexedBlock: blockNumber,
      lastIndexedAt: new Date(),
    },
  })

  console.log(`[Indexer] Saved last indexed block for chain ${chainId}: ${blockNumber}`)
}

/**
 * Fetch VotePlaced events from the contract
 */
export async function fetchVotePlacedEvents(
  chainId: number,
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  const client = createIndexerClient(chainId)
  const contractAddress = getQualificationAddress(chainId)

  console.log(`[Indexer] Fetching VotePlaced events from block ${fromBlock} to ${toBlock}`)

  const logs = await client.getLogs({
    address: contractAddress,
    event: parseAbiItem("event VotePlaced(address indexed voter, bytes8 indexed country, uint256 votes, uint256 cost, uint256 timestamp)"),
    fromBlock,
    toBlock,
  })

  return logs
}

/**
 * Fetch QualificationFinalized events
 */
export async function fetchQualificationFinalizedEvents(
  chainId: number,
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  const client = createIndexerClient(chainId)
  const contractAddress = getQualificationAddress(chainId)

  console.log(`[Indexer] Fetching QualificationFinalized events from block ${fromBlock} to ${toBlock}`)

  const logs = await client.getLogs({
    address: contractAddress,
    event: parseAbiItem("event QualificationFinalized(bytes8[] qualifiedCountries)"),
    fromBlock,
    toBlock,
  })

  return logs
}

/**
 * Fetch WinningsClaimed events
 */
export async function fetchWinningsClaimedEvents(
  chainId: number,
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  const client = createIndexerClient(chainId)
  const contractAddress = getQualificationAddress(chainId)

  console.log(`[Indexer] Fetching WinningsClaimed events from block ${fromBlock} to ${toBlock}`)

  const logs = await client.getLogs({
    address: contractAddress,
    event: parseAbiItem("event WinningsClaimed(address indexed user, uint256 amount)"),
    fromBlock,
    toBlock,
  })

  return logs
}

/**
 * Fetch ReferralPaid events
 */
export async function fetchReferralPaidEvents(
  chainId: number,
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  const client = createIndexerClient(chainId)
  const contractAddress = getQualificationAddress(chainId)

  console.log(`[Indexer] Fetching ReferralPaid events from block ${fromBlock} to ${toBlock}`)

  const logs = await client.getLogs({
    address: contractAddress,
    event: parseAbiItem("event ReferralPaid(address indexed referrer, address indexed voter, uint256 amount)"),
    fromBlock,
    toBlock,
  })

  return logs
}

/**
 * Fetch CountryAdded events
 */
export async function fetchCountryAddedEvents(
  chainId: number,
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  const client = createIndexerClient(chainId)
  const contractAddress = getQualificationAddress(chainId)

  console.log(`[Indexer] Fetching CountryAdded events from block ${fromBlock} to ${toBlock}`)

  const logs = await client.getLogs({
    address: contractAddress,
    event: parseAbiItem("event CountryAdded(bytes8 country)"),
    fromBlock,
    toBlock,
  })

  return logs
}

/**
 * Main indexer function - fetches all events and returns them
 */
export async function indexEvents(chainId: number) {
  const client = createIndexerClient(chainId)
  const currentBlock = await client.getBlockNumber()
  const lastIndexedBlock = await getLastIndexedBlock(chainId)

  console.log(`[Indexer] Starting indexing for chain ${chainId}`)
  console.log(`[Indexer] Current block: ${currentBlock}`)
  console.log(`[Indexer] Last indexed block: ${lastIndexedBlock}`)
  console.log(`[Indexer] Blocks to index: ${currentBlock - lastIndexedBlock}`)

  if (currentBlock <= lastIndexedBlock) {
    console.log(`[Indexer] No new blocks to index`)
    return {
      chainId,
      fromBlock: lastIndexedBlock,
      toBlock: currentBlock,
      votePlacedEvents: [],
      qualificationFinalizedEvents: [],
      winningsClaimedEvents: [],
      countryAddedEvents: [],
      referralPaidEvents: [],
    }
  }

  // Fetch all events in parallel
  const [votePlacedEvents, qualificationFinalizedEvents, winningsClaimedEvents, countryAddedEvents, referralPaidEvents] =
    await Promise.all([
      fetchVotePlacedEvents(chainId, lastIndexedBlock + 1n, currentBlock),
      fetchQualificationFinalizedEvents(chainId, lastIndexedBlock + 1n, currentBlock),
      fetchWinningsClaimedEvents(chainId, lastIndexedBlock + 1n, currentBlock),
      fetchCountryAddedEvents(chainId, lastIndexedBlock + 1n, currentBlock),
      fetchReferralPaidEvents(chainId, lastIndexedBlock + 1n, currentBlock),
    ])

  console.log(`[Indexer] Found ${votePlacedEvents.length} VotePlaced events`)
  console.log(`[Indexer] Found ${qualificationFinalizedEvents.length} QualificationFinalized events`)
  console.log(`[Indexer] Found ${winningsClaimedEvents.length} WinningsClaimed events`)
  console.log(`[Indexer] Found ${countryAddedEvents.length} CountryAdded events`)
  console.log(`[Indexer] Found ${referralPaidEvents.length} ReferralPaid events`)

  // Save the last indexed block
  await saveLastIndexedBlock(chainId, currentBlock)

  return {
    chainId,
    fromBlock: lastIndexedBlock + 1n,
    toBlock: currentBlock,
    votePlacedEvents,
    qualificationFinalizedEvents,
    winningsClaimedEvents,
    countryAddedEvents,
    referralPaidEvents,
  }
}

/**
 * Helper to convert bytes8 to string (country code)
 */
export function bytes8ToCountryCode(bytes: string): string {
  // Remove 0x prefix and trailing zeros
  const hex = bytes.replace("0x", "").replace(/0+$/, "")
  if (hex.length === 0) return ""
  return Buffer.from(hex, "hex").toString("utf8")
}

console.log("[Event Indexer] Service loaded")
