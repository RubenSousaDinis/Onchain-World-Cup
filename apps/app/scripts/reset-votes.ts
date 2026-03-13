/**
 * Reset all vote-related data from the database.
 *
 * Clears: referrals, qualification_votes, country_stats, user_stats,
 *         indexed_transactions, indexer_state,
 *         group_standings, groups, tournament_phases, tournaments
 *
 * Run from apps/app:
 *   npm run reset:votes
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function deleteMany(label: string, fn: () => Promise<{ count: number }>) {
  try {
    const result = await fn()
    console.log(`   ✅ ${label}: ${result.count} deleted`)
  } catch (err) {
    console.error(`   ❌ ${label}: failed —`, err)
    throw err
  }
}

async function main() {
  console.log("⚠️  Resetting all vote-related data...\n")

  // Order matters: delete child rows before parent rows (FK constraints)
  await deleteMany("referrals", () => prisma.referral.deleteMany())
  await deleteMany("qualification_votes", () => prisma.qualificationVote.deleteMany())
  await deleteMany("country_stats", () => prisma.countryStats.deleteMany())
  await deleteMany("user_stats", () => prisma.userStat.deleteMany())
  await deleteMany("indexed_transactions", () => prisma.indexedTransaction.deleteMany())
  await deleteMany("indexer_state", () => prisma.indexerState.deleteMany())
  // group_standings and groups cascade from tournament deletion
  await deleteMany("tournaments (cascades groups + standings + phases)", () => prisma.tournament.deleteMany())

  console.log("\n✨ Database reset complete.")
  console.log("   Next: update NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET in .env.local")
}

main()
  .catch((err) => {
    console.error("\n❌ Reset failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
