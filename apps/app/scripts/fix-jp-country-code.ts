/**
 * Fix corrupted "J" country code → "JP" (Japan)
 *
 * Root cause: bytes8ToCountryCode used /0+$/ which stripped the trailing '0'
 * from 'P' (0x50) when decoding the bytes8 for "JP", producing "J" instead.
 *
 * This script merges the "J" rows into "JP" across all affected tables:
 *   - country_stats        (PK is countryCode — needs upsert/merge)
 *   - qualification_votes  (FK countryCode — simple update)
 *   - group_standings      (countryCode column — simple update)
 *
 * Usage (from apps/app):
 *   npx tsx scripts/fix-jp-country-code.ts
 *   npx tsx scripts/fix-jp-country-code.ts --dry-run
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes("--dry-run")

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes written)" : "LIVE"}`)

  // 1. Check what exists
  const badStats = await prisma.countryStats.findUnique({ where: { countryCode: "J" } })
  const goodStats = await prisma.countryStats.findUnique({ where: { countryCode: "JP" } })

  console.log("\n--- country_stats ---")
  console.log("J  row:", badStats ?? "not found")
  console.log("JP row:", goodStats ?? "not found")

  const badVotes = await prisma.qualificationVote.count({ where: { countryCode: "J" } })
  console.log(`\n--- qualification_votes ---`)
  console.log(`Rows with countryCode = "J": ${badVotes}`)

  // group_standings is not in Prisma schema by name — use $queryRaw
  const badStandings: { id: string; country_code: string }[] = await prisma.$queryRaw`
    SELECT id, country_code FROM group_standings WHERE country_code = 'J'
  `
  console.log(`\n--- group_standings ---`)
  console.log(`Rows with country_code = "J": ${badStandings.length}`)

  if (DRY_RUN) {
    console.log("\nDry run complete — no changes made.")
    return
  }

  if (!badStats && badVotes === 0 && badStandings.length === 0) {
    console.log('\nNothing to fix — no "J" rows found.')
    return
  }

  await prisma.$transaction(async (tx) => {
    // --- qualification_votes: straightforward update ---
    if (badVotes > 0) {
      const updated = await tx.qualificationVote.updateMany({
        where: { countryCode: "J" },
        data: { countryCode: "JP" },
      })
      console.log(`\nUpdated ${updated.count} qualification_votes rows: "J" -> "JP"`)
    }

    // --- group_standings: raw update (model is GroupStanding in Prisma) ---
    if (badStandings.length > 0) {
      await tx.$executeRaw`
        UPDATE group_standings SET country_code = 'JP' WHERE country_code = 'J'
      `
      console.log(`Updated ${badStandings.length} group_standings rows: "J" -> "JP"`)
    }

    // --- country_stats: PK is countryCode so we can't just update ---
    if (badStats) {
      if (goodStats) {
        // JP row already exists — merge votes and ETH into it, then delete J
        const mergedVotes = goodStats.totalVotes + badStats.totalVotes
        const mergedEth = (parseFloat(goodStats.totalEth) + parseFloat(badStats.totalEth)).toString()

        await tx.countryStats.update({
          where: { countryCode: "JP" },
          data: {
            totalVotes: mergedVotes,
            totalEth: mergedEth,
            qualified: goodStats.qualified || badStats.qualified,
          },
        })
        await tx.countryStats.delete({ where: { countryCode: "J" } })
        console.log(`\nMerged "J" into existing "JP" row (votes: ${mergedVotes}, ETH: ${mergedEth})`)
      } else {
        // No JP row yet — rename J -> JP by recreating it
        await tx.countryStats.create({
          data: {
            countryCode: "JP",
            totalVotes: badStats.totalVotes,
            totalEth: badStats.totalEth,
            qualified: badStats.qualified,
            createdAt: badStats.createdAt,
          },
        })
        await tx.countryStats.delete({ where: { countryCode: "J" } })
        console.log(`\nRenamed "J" -> "JP" in country_stats`)
      }
    }
  })

  console.log("\nDone. Run the indexer or trigger a sync to rebuild tournament groups.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
