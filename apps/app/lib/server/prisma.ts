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
 * Vercel spawns many function instances; without a cap each opens its own pool and
 * can exhaust PostgreSQL's max_connections.
 * Supabase's pgbouncer (port 6543) should be used as the DATABASE_URL so these
 * per-instance connections are multiplexed into a bounded server-side pool.
 */
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.includes("connection_limit")) return url
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}connection_limit=5&pool_timeout=20`
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
