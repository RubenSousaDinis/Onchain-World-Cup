import { PrismaClient } from "@prisma/client"

/**
 * Server-only Prisma Client instance
 * Uses connection pooling and singleton pattern to prevent connection exhaustion
 *
 * IMPORTANT: Only import this in API routes and server components
 * Never import in client components or browser code
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Append connection pooling parameters to the database URL for serverless environments.
 *
 * DATABASE_URL should point to Supabase's pgbouncer pooler (port 6543), not the direct
 * PostgreSQL connection (port 5432). pgbouncer sits in front of PostgreSQL and multiplexes
 * all Vercel function instances into a small fixed pool of actual DB connections.
 *
 * With pgbouncer in the chain, connection_limit=1 is correct: each serverless instance
 * holds just 1 connection slot and pgbouncer does the real pooling server-side.
 * Without pgbouncer, every Vercel instance × its pool size = total PostgreSQL connections,
 * which can easily exhaust Supabase's max_connections under load.
 *
 * DATABASE_URL (queries) → port 6543 (pgbouncer) → PostgreSQL
 * DIRECT_URL  (migrations) → port 5432 (direct)  → PostgreSQL
 */
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.includes("connection_limit")) return url
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}connection_limit=1&pool_timeout=20`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: buildDatasourceUrl(),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
