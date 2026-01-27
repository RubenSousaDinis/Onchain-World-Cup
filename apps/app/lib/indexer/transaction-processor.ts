/**
 * TRANSACTION PROCESSOR
 *
 * Processes blockchain events and updates the database accordingly.
 * Updates:
 * - CountryStats: Aggregated voting statistics per country
 * - QualificationVote: Individual vote records
 * - UserStat: User statistics and rankings
 *
 * This runs server-side only and uses Prisma for database access.
 */

import { prisma } from "@/lib/server/prisma"
import { type Log } from "viem"
import { formatEther } from "viem"
import { bytes8ToCountryCode } from "./event-indexer"

/**
 * Process VotePlaced events and update database
 */
export async function processVotePlacedEvents(events: Log[]) {
  console.log(`[Processor] Processing ${events.length} VotePlaced events`)

  for (const event of events) {
    try {
      const { voter, country, votes, cost, timestamp: _timestamp } = event.args as {
        voter: string
        country: string
        votes: bigint
        cost: bigint
        timestamp: bigint
      }

      const countryCode = bytes8ToCountryCode(country)
      const voterAddress = voter.toLowerCase()
      const voteCount = Number(votes)
      const totalCostEth = formatEther(cost)
      const txHash = event.transactionHash!
      const blockNumber = event.blockNumber!

      console.log(`[Processor] Vote: ${voterAddress} voted ${voteCount} for ${countryCode} (${totalCostEth} ETH)`)

      // Check if this transaction is already indexed
      const existingIndexedTx = await prisma.indexedTransaction.findUnique({
        where: { txHash },
      })

      if (existingIndexedTx) {
        // Transaction already indexed - check if we need to upgrade from pending to confirmed
        if (existingIndexedTx.status === "pending" && existingIndexedTx.syncType === "immediate") {
          console.log(`[Processor] Upgrading transaction ${txHash} from pending to confirmed`)

          await prisma.$transaction(async (tx) => {
            // Upgrade indexed_transactions status
            await tx.indexedTransaction.update({
              where: { txHash },
              data: {
                status: "confirmed",
                blockNumber,
                confirmedAt: new Date(),
              },
            })

            // Update vote blockNumber (was set to 0 by immediate indexing)
            await tx.qualificationVote.update({
              where: { txHash },
              data: { blockNumber },
            })
          })

          console.log(`[Processor] Successfully upgraded transaction ${txHash} to confirmed`)
        } else {
          console.log(`[Processor] Transaction ${txHash} already indexed with status=${existingIndexedTx.status}, skipping`)
        }
        continue
      }

      // New transaction - create indexed_transactions and vote records
      console.log(`[Processor] Creating new transaction and vote records for ${txHash}`)

      // Use a transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // 1. Create indexed_transactions record (cron-based indexing)
        await tx.indexedTransaction.create({
          data: {
            txHash,
            contractAddress: event.address.toLowerCase(),
            walletAddress: voterAddress,
            chainId: event.blockNumber! > 0n ? (event.blockNumber! > 10000000n ? 8453 : 84532) : 84532, // Heuristic: Base Mainnet has higher block numbers
            syncType: "cron",
            status: "confirmed",
            blockNumber,
            eventType: "qualification",
            metadata: {
              countryCode,
              voteCount,
              totalCostEth,
            },
            indexedAt: new Date(),
            confirmedAt: new Date(),
          },
        })

        // 2. Create the vote record (foreign key to indexed_transactions)
        await tx.qualificationVote.create({
          data: {
            countryCode,
            voterAddress,
            voteCount,
            totalCostEth,
            txHash,
            blockNumber,
          },
        })

        // 3. Update or create country stats (only for NEW transactions)
        const existingCountryStats = await tx.countryStats.findUnique({
          where: { countryCode },
        })

        if (existingCountryStats) {
          await tx.countryStats.update({
            where: { countryCode },
            data: {
              totalVotes: { increment: voteCount },
              totalEth: (parseFloat(existingCountryStats.totalEth) + parseFloat(totalCostEth)).toString(),
            },
          })
        } else {
          await tx.countryStats.create({
            data: {
              countryCode,
              totalVotes: voteCount,
              totalEth: totalCostEth,
              qualified: false,
            },
          })
        }

        // 4. Update or create user stats (only for NEW transactions)
        const existingUserStats = await tx.userStat.findUnique({
          where: { walletAddress: voterAddress },
        })

        if (existingUserStats) {
          // Check if this is a new country for this user
          const userVotesForCountry = await tx.qualificationVote.findMany({
            where: {
              voterAddress,
              countryCode,
            },
          })

          const isNewCountry = userVotesForCountry.length === 1 // This is the first vote for this country

          await tx.userStat.update({
            where: { walletAddress: voterAddress },
            data: {
              qualificationVotes: { increment: voteCount },
              qualificationSpentEth: (
                parseFloat(existingUserStats.qualificationSpentEth) + parseFloat(totalCostEth)
              ).toString(),
              totalVotes: { increment: voteCount },
              totalSpentEth: (parseFloat(existingUserStats.totalSpentEth) + parseFloat(totalCostEth)).toString(),
              countriesVotedFor: isNewCountry
                ? { increment: 1 }
                : existingUserStats.countriesVotedFor,
            },
          })
        } else {
          // Create new user stats
          await tx.userStat.create({
            data: {
              walletAddress: voterAddress,
              qualificationVotes: voteCount,
              qualificationSpentEth: totalCostEth,
              totalVotes: voteCount,
              totalSpentEth: totalCostEth,
              countriesVotedFor: 1,
            },
          })
        }
      })

      console.log(`[Processor] Successfully processed vote ${txHash}`)
    } catch (error) {
      console.error(`[Processor] Error processing VotePlaced event:`, error)
      // Continue processing other events even if one fails
    }
  }
}

/**
 * Process QualificationFinalized events
 */
export async function processQualificationFinalizedEvents(events: Log[]) {
  console.log(`[Processor] Processing ${events.length} QualificationFinalized events`)

  for (const event of events) {
    try {
      const { qualifiedCountries } = event.args as {
        qualifiedCountries: string[]
      }

      console.log(`[Processor] Qualification finalized with ${qualifiedCountries.length} countries`)

      // Update qualified status for all countries
      await prisma.$transaction(async (tx) => {
        for (const countryBytes of qualifiedCountries) {
          const countryCode = bytes8ToCountryCode(countryBytes)

          await tx.countryStats.upsert({
            where: { countryCode },
            update: { qualified: true },
            create: {
              countryCode,
              totalVotes: 0,
              totalEth: "0",
              qualified: true,
            },
          })

          console.log(`[Processor] Marked ${countryCode} as qualified`)
        }
      })

      console.log(`[Processor] Successfully processed QualificationFinalized event`)
    } catch (error) {
      console.error(`[Processor] Error processing QualificationFinalized event:`, error)
    }
  }
}

/**
 * Process WinningsClaimed events
 */
export async function processWinningsClaimedEvents(events: Log[]) {
  console.log(`[Processor] Processing ${events.length} WinningsClaimed events`)

  for (const event of events) {
    try {
      const { user, amount } = event.args as {
        user: string
        amount: bigint
      }

      const userAddress = user.toLowerCase()
      const wonEth = formatEther(amount)

      console.log(`[Processor] Winnings claimed: ${userAddress} claimed ${wonEth} ETH`)

      // Update user stats
      const existingUserStats = await prisma.userStat.findUnique({
        where: { walletAddress: userAddress },
      })

      if (existingUserStats) {
        await prisma.userStat.update({
          where: { walletAddress: userAddress },
          data: {
            qualificationWonEth: (parseFloat(existingUserStats.qualificationWonEth) + parseFloat(wonEth)).toString(),
            totalWonEth: (parseFloat(existingUserStats.totalWonEth) + parseFloat(wonEth)).toString(),
          },
        })
      } else {
        // User doesn't exist in database yet - create with winnings
        await prisma.userStat.create({
          data: {
            walletAddress: userAddress,
            qualificationWonEth: wonEth,
            totalWonEth: wonEth,
          },
        })
      }

      console.log(`[Processor] Successfully processed WinningsClaimed event for ${userAddress}`)
    } catch (error) {
      console.error(`[Processor] Error processing WinningsClaimed event:`, error)
    }
  }
}

/**
 * Process CountryAdded events
 */
export async function processCountryAddedEvents(events: Log[]) {
  console.log(`[Processor] Processing ${events.length} CountryAdded events`)

  for (const event of events) {
    try {
      const { country } = event.args as {
        country: string
      }

      const countryCode = bytes8ToCountryCode(country)

      console.log(`[Processor] Country added: ${countryCode}`)

      // Create country stats if it doesn't exist
      await prisma.countryStats.upsert({
        where: { countryCode },
        update: {}, // No update needed if it exists
        create: {
          countryCode,
          totalVotes: 0,
          totalEth: "0",
          qualified: false,
        },
      })

      console.log(`[Processor] Successfully processed CountryAdded event for ${countryCode}`)
    } catch (error) {
      console.error(`[Processor] Error processing CountryAdded event:`, error)
    }
  }
}

/**
 * Main processor function - processes all events
 */
export async function processEvents(eventsData: {
  votePlacedEvents: Log[]
  qualificationFinalizedEvents: Log[]
  winningsClaimedEvents: Log[]
  countryAddedEvents: Log[]
}) {
  console.log(`[Processor] Starting event processing`)

  try {
    // Process events in order of importance
    await processCountryAddedEvents(eventsData.countryAddedEvents)
    await processVotePlacedEvents(eventsData.votePlacedEvents)
    await processQualificationFinalizedEvents(eventsData.qualificationFinalizedEvents)
    await processWinningsClaimedEvents(eventsData.winningsClaimedEvents)

    console.log(`[Processor] Event processing completed successfully`)

    return {
      success: true,
      processed: {
        votes: eventsData.votePlacedEvents.length,
        qualifications: eventsData.qualificationFinalizedEvents.length,
        claims: eventsData.winningsClaimedEvents.length,
        countries: eventsData.countryAddedEvents.length,
      },
    }
  } catch (error) {
    console.error(`[Processor] Error during event processing:`, error)
    throw error
  }
}

console.log("[Transaction Processor] Service loaded")
