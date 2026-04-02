/**
 * Seed real World Cup 2026 match schedule into the matches table.
 *
 * - Reads fixtures from public/data/worldcup-2026.json
 * - Looks up countries by name or FIFA code; creates missing ones
 * - Sets contract_address to zero address (placeholder until contracts are deployed)
 * - Idempotent: skips matches that already exist
 *
 * Uses Prisma raw SQL (DIRECT_URL) to bypass PostgREST schema cache issues.
 *
 * Usage: npm run seed:wc-matches
 */

import dotenv from 'dotenv'
import * as path from 'path'

// Load env before any DB imports
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

// Maps openfootball team names → { code, flag_emoji }
const TEAM_META: Record<string, { code: string; flag_emoji: string }> = {
  'Mexico':                  { code: 'MEX', flag_emoji: '🇲🇽' },
  'USA':                     { code: 'USA', flag_emoji: '🇺🇸' },
  'United States':           { code: 'USA', flag_emoji: '🇺🇸' },
  'Canada':                  { code: 'CAN', flag_emoji: '🇨🇦' },
  'Argentina':               { code: 'ARG', flag_emoji: '🇦🇷' },
  'France':                  { code: 'FRA', flag_emoji: '🇫🇷' },
  'Spain':                   { code: 'ESP', flag_emoji: '🇪🇸' },
  'England':                 { code: 'ENG', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'Brazil':                  { code: 'BRA', flag_emoji: '🇧🇷' },
  'Belgium':                 { code: 'BEL', flag_emoji: '🇧🇪' },
  'Netherlands':             { code: 'NED', flag_emoji: '🇳🇱' },
  'Portugal':                { code: 'POR', flag_emoji: '🇵🇹' },
  'Colombia':                { code: 'COL', flag_emoji: '🇨🇴' },
  'Italy':                   { code: 'ITA', flag_emoji: '🇮🇹' },
  'Uruguay':                 { code: 'URU', flag_emoji: '🇺🇾' },
  'Croatia':                 { code: 'CRO', flag_emoji: '🇭🇷' },
  'Germany':                 { code: 'GER', flag_emoji: '🇩🇪' },
  'Morocco':                 { code: 'MAR', flag_emoji: '🇲🇦' },
  'Switzerland':             { code: 'SUI', flag_emoji: '🇨🇭' },
  'Japan':                   { code: 'JPN', flag_emoji: '🇯🇵' },
  'Senegal':                 { code: 'SEN', flag_emoji: '🇸🇳' },
  'Denmark':                 { code: 'DEN', flag_emoji: '🇩🇰' },
  'South Korea':             { code: 'KOR', flag_emoji: '🇰🇷' },
  'Australia':               { code: 'AUS', flag_emoji: '🇦🇺' },
  'Poland':                  { code: 'POL', flag_emoji: '🇵🇱' },
  'Austria':                 { code: 'AUT', flag_emoji: '🇦🇹' },
  'Ukraine':                 { code: 'UKR', flag_emoji: '🇺🇦' },
  'Sweden':                  { code: 'SWE', flag_emoji: '🇸🇪' },
  'Turkey':                  { code: 'TUR', flag_emoji: '🇹🇷' },
  'Serbia':                  { code: 'SRB', flag_emoji: '🇷🇸' },
  'Wales':                   { code: 'WAL', flag_emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  'Czech Republic':          { code: 'CZE', flag_emoji: '🇨🇿' },
  'Scotland':                { code: 'SCO', flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'Ecuador':                 { code: 'ECU', flag_emoji: '🇪🇨' },
  'Peru':                    { code: 'PER', flag_emoji: '🇵🇪' },
  'Chile':                   { code: 'CHI', flag_emoji: '🇨🇱' },
  'Nigeria':                 { code: 'NGA', flag_emoji: '🇳🇬' },
  'Tunisia':                 { code: 'TUN', flag_emoji: '🇹🇳' },
  'Cameroon':                { code: 'CMR', flag_emoji: '🇨🇲' },
  'Egypt':                   { code: 'EGY', flag_emoji: '🇪🇬' },
  'Algeria':                 { code: 'ALG', flag_emoji: '🇩🇿' },
  "Ivory Coast":             { code: 'CIV', flag_emoji: '🇨🇮' },
  "Côte d'Ivoire":           { code: 'CIV', flag_emoji: '🇨🇮' },
  'Ghana':                   { code: 'GHA', flag_emoji: '🇬🇭' },
  'Mali':                    { code: 'MLI', flag_emoji: '🇲🇱' },
  'South Africa':            { code: 'RSA', flag_emoji: '🇿🇦' },
  'Iran':                    { code: 'IRN', flag_emoji: '🇮🇷' },
  'Saudi Arabia':            { code: 'KSA', flag_emoji: '🇸🇦' },
  'Qatar':                   { code: 'QAT', flag_emoji: '🇶🇦' },
  'Iraq':                    { code: 'IRQ', flag_emoji: '🇮🇶' },
  'Costa Rica':              { code: 'CRC', flag_emoji: '🇨🇷' },
  'Jamaica':                 { code: 'JAM', flag_emoji: '🇯🇲' },
  'Panama':                  { code: 'PAN', flag_emoji: '🇵🇦' },
  'New Zealand':             { code: 'NZL', flag_emoji: '🇳🇿' },
  'Honduras':                { code: 'HON', flag_emoji: '🇭🇳' },
  'Venezuela':               { code: 'VEN', flag_emoji: '🇻🇪' },
  'Paraguay':                { code: 'PAR', flag_emoji: '🇵🇾' },
  'Bolivia':                 { code: 'BOL', flag_emoji: '🇧🇴' },
  'Greece':                  { code: 'GRE', flag_emoji: '🇬🇷' },
  'Hungary':                 { code: 'HUN', flag_emoji: '🇭🇺' },
  'Romania':                 { code: 'ROU', flag_emoji: '🇷🇴' },
  'Slovakia':                { code: 'SVK', flag_emoji: '🇸🇰' },
  'Slovenia':                { code: 'SVN', flag_emoji: '🇸🇮' },
  'Albania':                 { code: 'ALB', flag_emoji: '🇦🇱' },
  'Georgia':                 { code: 'GEO', flag_emoji: '🇬🇪' },
  'Norway':                  { code: 'NOR', flag_emoji: '🇳🇴' },
  'Uzbekistan':              { code: 'UZB', flag_emoji: '🇺🇿' },
  'Indonesia':               { code: 'IDN', flag_emoji: '🇮🇩' },
  'Bosnia & Herzegovina':    { code: 'BIH', flag_emoji: '🇧🇦' },
  'Bosnia and Herzegovina':  { code: 'BIH', flag_emoji: '🇧🇦' },
  'Haiti':                   { code: 'HAI', flag_emoji: '🇭🇹' },
  'Guatemala':               { code: 'GUA', flag_emoji: '🇬🇹' },
  'El Salvador':             { code: 'SLV', flag_emoji: '🇸🇻' },
  'Trinidad and Tobago':     { code: 'TRI', flag_emoji: '🇹🇹' },
  'DR Congo':                { code: 'COD', flag_emoji: '🇨🇩' },
  'Congo':                   { code: 'CGO', flag_emoji: '🇨🇬' },
  'Zambia':                  { code: 'ZAM', flag_emoji: '🇿🇲' },
  'Zimbabwe':                { code: 'ZIM', flag_emoji: '🇿🇼' },
  'Kenya':                   { code: 'KEN', flag_emoji: '🇰🇪' },
  'Tanzania':                { code: 'TAN', flag_emoji: '🇹🇿' },
  'Mozambique':              { code: 'MOZ', flag_emoji: '🇲🇿' },
  'Angola':                  { code: 'ANG', flag_emoji: '🇦🇴' },
  'Uzbekistan':              { code: 'UZB', flag_emoji: '🇺🇿' },
  'Thailand':                { code: 'THA', flag_emoji: '🇹🇭' },
  'Vietnam':                 { code: 'VIE', flag_emoji: '🇻🇳' },
  'Oman':                    { code: 'OMA', flag_emoji: '🇴🇲' },
  'Jordan':                  { code: 'JOR', flag_emoji: '🇯🇴' },
  'Bahrain':                 { code: 'BHR', flag_emoji: '🇧🇭' },
  'Kuwait':                  { code: 'KUW', flag_emoji: '🇰🇼' },
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
  const countryCache = new Map<string, string>()

  async function getOrCreateCountry(name: string): Promise<string> {
    if (countryCache.has(name)) return countryCache.get(name)!

    // 1. Find by exact name (case-insensitive)
    const byName = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id::text FROM countries WHERE lower(name) = lower(${name}) LIMIT 1
    `
    if (byName.length > 0) {
      countryCache.set(name, byName[0].id)
      return byName[0].id
    }

    // 2. Find by FIFA code (handles "USA" → finds "United States")
    const meta = TEAM_META[name]
    if (meta?.code) {
      const byCode = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id::text FROM countries WHERE code = ${meta.code} LIMIT 1
      `
      if (byCode.length > 0) {
        countryCache.set(name, byCode[0].id)
        return byCode[0].id
      }
    }

    // 3. Create new country record
    const code = meta?.code ?? name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
    const flagEmoji = meta?.flag_emoji ?? '🏳️'

    const created = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO countries (name, code, flag_emoji, qualified)
      VALUES (${name}, ${code}, ${flagEmoji}, true)
      RETURNING id::text
    `
    console.log(`  ✚ Created country: ${name} (${code} ${flagEmoji})`)
    countryCache.set(name, created[0].id)
    return created[0].id
  }

  console.log('⚽  Seeding real World Cup 2026 matches...\n')

  const jsonPath = path.join(__dirname, '../public/data/worldcup-2026.json')
  const schedule: WCScheduleData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  console.log(`📅  ${schedule.matches.length} fixtures found in schedule\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const match of schedule.matches) {
    const matchStart = parseMatchTime(match.date, match.time)
    const votingEnd = new Date(matchStart.getTime() + 24 * 60 * 60 * 1000)
    const matchEnd = new Date(matchStart.getTime() + 26 * 60 * 60 * 1000)

    let team1Id: string
    let team2Id: string

    try {
      team1Id = await getOrCreateCountry(match.team1)
      team2Id = await getOrCreateCountry(match.team2)
    } catch (err) {
      console.error(`  ✗ Country error for "${match.team1}" vs "${match.team2}": ${(err as Error).message}`)
      failed++
      continue
    }

    // Idempotency: skip if this exact fixture already exists
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id::text FROM matches
      WHERE team1_id = ${team1Id}::uuid
      AND team2_id = ${team2Id}::uuid
      AND match_start_time = ${matchStart}::timestamptz
      LIMIT 1
    `
    if (existing.length > 0) {
      skipped++
      continue
    }

    try {
      await prisma.$executeRaw`
        INSERT INTO matches (team1_id, team2_id, contract_address, match_start_time, voting_end_time, match_end_time, status, is_qualification)
        VALUES (
          ${team1Id}::uuid,
          ${team2Id}::uuid,
          ${'0x0000000000000000000000000000000000000000'},
          ${matchStart}::timestamptz,
          ${votingEnd}::timestamptz,
          ${matchEnd}::timestamptz,
          'upcoming',
          false
        )
      `
      console.log(`  ✔  ${match.team1} vs ${match.team2}  ·  ${match.date}  ·  ${match.group ?? match.round}`)
      created++
    } catch (err) {
      console.error(`  ✗ ${match.team1} vs ${match.team2} (${match.date}): ${(err as Error).message}`)
      failed++
    }
  }

  await prisma.$disconnect()

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Created: ${created}`)
  if (skipped > 0) console.log(`⏭️   Skipped: ${skipped} (already in DB)`)
  if (failed > 0)  console.log(`❌  Failed:  ${failed}`)
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
