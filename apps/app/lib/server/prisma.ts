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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
