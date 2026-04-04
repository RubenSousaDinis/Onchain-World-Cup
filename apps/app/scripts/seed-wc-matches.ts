/**
 * Seed real World Cup 2026 match schedule into the matches table.
 *
 * - Reads fixtures from public/data/worldcup-2026.json
 * - Resolves team names to country codes via data/countries.json
 * - Skips knockout round placeholders (e.g. "1A", "W100")
 * - Idempotent: skips matches that already exist
 *
 * Run migration first: npm run prisma:migrate
 * Usage: npm run seed:wc-matches
 */

import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

interface WCMatch {
  round: string
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
}

interface WCScheduleData {
  name: string
  matches: WCMatch[]
}

interface CountryData {
  code: string
  name: string
  flagEmoji: string
}

// Openfootball names that differ from data/countries.json
const NAME_ALIASES: Record<string, string> = {
  'USA':                  'United States',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
}

function parseMatchTime(date: string, time: string): Date {
  const m = time.match(/(\d+):(\d+)\s+UTC([+-]\d+)/)
  if (!m) return new Date(`${date}T00:00:00Z`)
  const offsetHours = parseInt(m[3])
  const sign = offsetHours >= 0 ? '+' : '-'
  const absHours = String(Math.abs(offsetHours)).padStart(2, '0')
  return new Date(`${date}T${m[1]}:${m[2]}:00${sign}${absHours}:00`)
}

async function main() {
  const prisma = new PrismaClient()

  const countriesData: CountryData[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/countries.json'), 'utf-8')
  )
  const codeByName = new Map(countriesData.map(c => [c.name.toLowerCase(), c.code]))

  function resolveCode(rawName: string): string | null {
    const name = NAME_ALIASES[rawName] ?? rawName
    return codeByName.get(name.toLowerCase()) ?? null
  }

  const schedule: WCScheduleData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/worldcup-2026.json'), 'utf-8')
  )

  console.log(`⚽  Seeding ${schedule.matches.length} fixtures...\n`)

  let created = 0, skipped = 0, placeholder = 0, failed = 0

  for (const match of schedule.matches) {
    const team1Code = resolveCode(match.team1)
    const team2Code = resolveCode(match.team2)

    if (!team1Code || !team2Code) {
      placeholder++
      continue
    }

    const matchStart = parseMatchTime(match.date, match.time)
    const votingEnd  = new Date(matchStart.getTime() + 24 * 60 * 60 * 1000)
    const matchEnd   = new Date(matchStart.getTime() + 26 * 60 * 60 * 1000)

    const existing = await prisma.match.findFirst({
      where: { team1Code, team2Code, matchStartTime: matchStart },
      select: { id: true },
    })
    if (existing) { skipped++; continue }

    try {
      await prisma.match.create({
        data: {
          team1Code,
          team2Code,
          matchStartTime: matchStart,
          votingEndTime:  votingEnd,
          matchEndTime:   matchEnd,
          status:    'upcoming',
          matchType: 'real',
        },
      })
      console.log(`  ✔  ${match.team1} vs ${match.team2}  ·  ${match.date}  ·  ${match.group ?? match.round}`)
      created++
    } catch (err) {
      console.error(`  ✗ ${match.team1} vs ${match.team2}: ${(err as Error).message}`)
      failed++
    }
  }

  await prisma.$disconnect()

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Created:     ${created}`)
  if (skipped > 0)     console.log(`⏭️   Skipped:     ${skipped} (already in DB)`)
  if (placeholder > 0) console.log(`⏳  Placeholder: ${placeholder} (knockout TBDs, skipped)`)
  if (failed > 0)      console.log(`❌  Failed:      ${failed}`)
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1) })
