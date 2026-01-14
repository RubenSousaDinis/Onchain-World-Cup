/**
 * Prisma Client Singleton
 *
 * This file exports a single Prisma Client instance to be used across the application.
 * Using a singleton prevents creating multiple instances which can exhaust database connections.
 *
 * Usage:
 *   import { prisma } from '@/lib/prisma'
 *
 *   const countries = await prisma.country.findMany()
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export PrismaClient type for use in other files
export type { PrismaClient }
