/**
 * Backfill ENS names for users missing them in the database.
 *
 * Queries all UserStat rows where ensName is NULL and the user has no
 * manually-set name, resolves each address against ENS (Base L2 first,
 * then L1 mainnet), and writes the result back.
 *
 * Usage (from apps/app):
 *   npx tsx scripts/backfill-ens-names.ts
 *   npx tsx scripts/backfill-ens-names.ts --dry-run
 *   npx tsx scripts/backfill-ens-names.ts --limit 100
 *   npx tsx scripts/backfill-ens-names.ts --concurrency 3
 */

import { PrismaClient } from "@prisma/client"
import { resolveEnsName } from "../lib/server/ens"

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes("--dry-run")
const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit")
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : undefined
})()
const CONCURRENCY = (() => {
  const idx = process.argv.indexOf("--concurrency")
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 5
})()

/** Run up to `concurrency` async tasks at a time from an array. */
async function pMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function worker() {
    while (index < items.length) {
      const i = index++
      results[i] = await fn(items[i], i)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker)
  await Promise.all(workers)
  return results
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes written)" : "LIVE"}`)
  console.log(`Concurrency: ${CONCURRENCY}`)
  if (LIMIT) console.log(`Limit: ${LIMIT}`)

  // Fetch users with no ENS name and no manually-set name
  const rows = await prisma.userStat.findMany({
    where: { ensName: null },
    include: { user: { select: { name: true } } },
    ...(LIMIT ? { take: LIMIT } : {}),
    orderBy: { walletAddress: "asc" },
  })

  const candidates = rows.filter((r) => !r.user?.name)

  console.log(`\nFound ${rows.length} users without an ENS name`)
  console.log(`Skipping ${rows.length - candidates.length} with a manually-set name`)
  console.log(`Resolving ${candidates.length} addresses...\n`)

  let resolved = 0
  let skipped = 0
  let failed = 0

  await pMap(
    candidates,
    async (row, i) => {
      const { walletAddress } = row
      try {
        const name = await resolveEnsName(walletAddress)

        if (!name) {
          skipped++
          process.stdout.write(`[${i + 1}/${candidates.length}] ${walletAddress} — no ENS name\n`)
          return
        }

        process.stdout.write(
          `[${i + 1}/${candidates.length}] ${walletAddress} — found: ${name}${DRY_RUN ? " (dry run)" : ""}\n`
        )

        if (!DRY_RUN) {
          await prisma.userStat.update({
            where: { walletAddress },
            data: { ensName: name },
          })
        }

        resolved++
      } catch (err) {
        failed++
        process.stdout.write(
          `[${i + 1}/${candidates.length}] ${walletAddress} — ERROR: ${err instanceof Error ? err.message : String(err)}\n`
        )
      }
    },
    CONCURRENCY
  )

  console.log(`\n--- Summary ---`)
  console.log(`Resolved : ${resolved}`)
  console.log(`No name  : ${skipped}`)
  console.log(`Errors   : ${failed}`)
  if (DRY_RUN) console.log(`\nDry run — no changes written.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
