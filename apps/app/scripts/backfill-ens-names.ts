/**
 * Backfill ENS names for users missing them in the database.
 *
 * Queries all UserStat rows where ensName is NULL and the user has no
 * manually-set name, resolves each address via the ensdata.net free API
 * (supports both ENS and Basenames), and writes the result back.
 *
 * Usage (from apps/app):
 *   npx tsx scripts/backfill-ens-names.ts
 *   npx tsx scripts/backfill-ens-names.ts --dry-run
 *   npx tsx scripts/backfill-ens-names.ts --limit 100
 *   npx tsx scripts/backfill-ens-names.ts --concurrency 3
 */

// Load .env.local so DATABASE_URL is available
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(__dirname, "../.env.local"), quiet: true })
config({ path: resolve(__dirname, "../.env"), quiet: true })

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes("--dry-run")
const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit")
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : undefined
})()
const CONCURRENCY = (() => {
  const idx = process.argv.indexOf("--concurrency")
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 3
})()

interface EnsDataResponse {
  address?: string
  name?: string           // primary ENS name (e.g. "example.eth")
  displayName?: string    // display name (includes Basenames)
}

/**
 * Resolves the best ENS/Basename for an address via ensdata.net.
 * Returns null if no name is found.
 */
async function resolveEns(address: string): Promise<{ name: string | null; error?: string }> {
  try {
    const res = await fetch(`https://ensdata.net/${address}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return { name: null, error: `HTTP ${res.status}` }
    }

    const data: EnsDataResponse = await res.json()

    // Prefer `name` (primary ENS / Basename), fall back to `displayName`
    const name = data.name || data.displayName || null

    // Filter out anything that looks like a truncated address (e.g. "0x1234...abcd")
    if (name && name.includes("...")) return { name: null }

    return { name }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { name: null, error: msg }
  }
}

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
      const { name, error } = await resolveEns(walletAddress)

      if (error) {
        failed++
        process.stdout.write(`[${i + 1}/${candidates.length}] ${walletAddress} — ERROR: ${error}\n`)
        return
      }

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
