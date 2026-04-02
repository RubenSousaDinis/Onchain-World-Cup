/**
 * Seed real World Cup 2026 match schedule into the matches table.
 *
 * - Reads fixtures from public/data/worldcup-2026.json
 * - Looks up countries by name or FIFA code; creates missing ones
 * - Sets contract_address to zero address (placeholder until contracts are deployed)
 * - Idempotent: skips matches that already exist
 *
 * Usage: npm run seed:wc-matches
 */

import dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local before importing anything that reads env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

import { getSupabaseClient } from '../lib/server/supabase'
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
// Covers all 48 real WC 2026 teams. When a team already exists in the DB
// by code (e.g. "United States" for "USA"), we reuse it rather than creating a duplicate.
const TEAM_META: Record<string, { code: string; flag_emoji: string }> = {
  'Mexico':            { code: 'MEX', flag_emoji: '🇲🇽' },
  'USA':               { code: 'USA', flag_emoji: '🇺🇸' },
  'United States':     { code: 'USA', flag_emoji: '🇺🇸' },
  'Canada':            { code: 'CAN', flag_emoji: '🇨🇦' },
  'Argentina':         { code: 'ARG', flag_emoji: '🇦🇷' },
  'France':            { code: 'FRA', flag_emoji: '🇫🇷' },
  'Spain':             { code: 'ESP', flag_emoji: '🇪🇸' },
  'England':           { code: 'ENG', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'Brazil':            { code: 'BRA', flag_emoji: '🇧🇷' },
  'Belgium':           { code: 'BEL', flag_emoji: '🇧🇪' },
  'Netherlands':       { code: 'NED', flag_emoji: '🇳🇱' },
  'Portugal':          { code: 'POR', flag_emoji: '🇵🇹' },
  'Colombia':          { code: 'COL', flag_emoji: '🇨🇴' },
  'Italy':             { code: 'ITA', flag_emoji: '🇮🇹' },
  'Uruguay':           { code: 'URU', flag_emoji: '🇺🇾' },
  'Croatia':           { code: 'CRO', flag_emoji: '🇭🇷' },
  'Germany':           { code: 'GER', flag_emoji: '🇩🇪' },
  'Morocco':           { code: 'MAR', flag_emoji: '🇲🇦' },
  'Switzerland':       { code: 'SUI', flag_emoji: '🇨🇭' },
  'Japan':             { code: 'JPN', flag_emoji: '🇯🇵' },
  'Senegal':           { code: 'SEN', flag_emoji: '🇸🇳' },
  'Denmark':           { code: 'DEN', flag_emoji: '🇩🇰' },
  'South Korea':       { code: 'KOR', flag_emoji: '🇰🇷' },
  'Australia':         { code: 'AUS', flag_emoji: '🇦🇺' },
  'Poland':            { code: 'POL', flag_emoji: '🇵🇱' },
  'Austria':           { code: 'AUT', flag_emoji: '🇦🇹' },
  'Ukraine':           { code: 'UKR', flag_emoji: '🇺🇦' },
  'Sweden':            { code: 'SWE', flag_emoji: '🇸🇪' },
  'Turkey':            { code: 'TUR', flag_emoji: '🇹🇷' },
  'Serbia':            { code: 'SRB', flag_emoji: '🇷🇸' },
  'Wales':             { code: 'WAL', flag_emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  'Czech Republic':    { code: 'CZE', flag_emoji: '🇨🇿' },
  'Scotland':          { code: 'SCO', flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'Ecuador':           { code: 'ECU', flag_emoji: '🇪🇨' },
  'Peru':              { code: 'PER', flag_emoji: '🇵🇪' },
  'Chile':             { code: 'CHI', flag_emoji: '🇨🇱' },
  'Nigeria':           { code: 'NGA', flag_emoji: '🇳🇬' },
  'Tunisia':           { code: 'TUN', flag_emoji: '🇹🇳' },
  'Cameroon':          { code: 'CMR', flag_emoji: '🇨🇲' },
  'Egypt':             { code: 'EGY', flag_emoji: '🇪🇬' },
  'Algeria':           { code: 'ALG', flag_emoji: '🇩🇿' },
  "Ivory Coast":       { code: 'CIV', flag_emoji: '🇨🇮' },
  "Côte d'Ivoire":     { code: 'CIV', flag_emoji: '🇨🇮' },
  'Ghana':             { code: 'GHA', flag_emoji: '🇬🇭' },
  'Mali':              { code: 'MLI', flag_emoji: '🇲🇱' },
  'South Africa':      { code: 'RSA', flag_emoji: '🇿🇦' },
  'Iran':              { code: 'IRN', flag_emoji: '🇮🇷' },
  'Saudi Arabia':      { code: 'KSA', flag_emoji: '🇸🇦' },
  'Qatar':             { code: 'QAT', flag_emoji: '🇶🇦' },
  'Iraq':              { code: 'IRQ', flag_emoji: '🇮🇶' },
  'Costa Rica':        { code: 'CRC', flag_emoji: '🇨🇷' },
  'Jamaica':           { code: 'JAM', flag_emoji: '🇯🇲' },
  'Panama':            { code: 'PAN', flag_emoji: '🇵🇦' },
  'New Zealand':       { code: 'NZL', flag_emoji: '🇳🇿' },
  'Honduras':          { code: 'HON', flag_emoji: '🇭🇳' },
  'Venezuela':         { code: 'VEN', flag_emoji: '🇻🇪' },
  'Paraguay':          { code: 'PAR', flag_emoji: '🇵🇾' },
  'Bolivia':           { code: 'BOL', flag_emoji: '🇧🇴' },
  'Greece':            { code: 'GRE', flag_emoji: '🇬🇷' },
  'Hungary':           { code: 'HUN', flag_emoji: '🇭🇺' },
  'Romania':           { code: 'ROU', flag_emoji: '🇷🇴' },
  'Slovakia':          { code: 'SVK', flag_emoji: '🇸🇰' },
  'Slovenia':          { code: 'SVN', flag_emoji: '🇸🇮' },
  'Albania':           { code: 'ALB', flag_emoji: '🇦🇱' },
  'Georgia':           { code: 'GEO', flag_emoji: '🇬🇪' },
  'Norway':            { code: 'NOR', flag_emoji: '🇳🇴' },
  'Uzbekistan':        { code: 'UZB', flag_emoji: '🇺🇿' },
  'Indonesia':         { code: 'IDN', flag_emoji: '🇮🇩' },
}

function parseMatchTime(date: string, time: string): Date {
  const m = time.match(/(\d+):(\d+)\s+UTC([+-]\d+)/)
  if (!m) return new Date(`${date}T00:00:00Z`)
  const offsetHours = parseInt(m[3])
  const sign = offsetHours >= 0 ? '+' : '-'
  const absHours = String(Math.abs(offsetHours)).padStart(2, '0')
  return new Date(`${date}T${m[1]}:${m[2]}:00${sign}${absHours}:00`)
}

const supabase = getSupabaseClient()
const countryCache = new Map<string, string>()

async function getOrCreateCountry(name: string): Promise<string> {
  if (countryCache.has(name)) return countryCache.get(name)!

  // 1. Try exact name match (case-insensitive)
  const { data: byName } = await supabase
    .from('countries')
    .select('id')
    .ilike('name', name)
    .maybeSingle()

  if (byName) {
    countryCache.set(name, byName.id)
    return byName.id
  }

  // 2. Try by FIFA code (handles "USA" → finds "United States" in DB)
  const meta = TEAM_META[name]
  if (meta?.code) {
    const { data: byCode } = await supabase
      .from('countries')
      .select('id')
      .eq('code', meta.code)
      .maybeSingle()

    if (byCode) {
      countryCache.set(name, byCode.id)
      return byCode.id
    }
  }

  // 3. Create new country record
  const code = meta?.code ?? name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  const flag_emoji = meta?.flag_emoji ?? '🏳️'

  const { data: created, error } = await supabase
    .from('countries')
    .insert({ name, code, flag_emoji, qualified: true })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create country "${name}": ${error.message}`)

  console.log(`  ✚ Created country: ${name} (${code} ${flag_emoji})`)
  countryCache.set(name, created.id)
  return created.id
}

async function main() {
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
      ;[team1Id, team2Id] = await Promise.all([
        getOrCreateCountry(match.team1),
        getOrCreateCountry(match.team2),
      ])
    } catch (err) {
      console.error(`  ✗ Country error for "${match.team1}" vs "${match.team2}": ${(err as Error).message}`)
      failed++
      continue
    }

    // Idempotency: skip if match already exists for these teams at this time
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .eq('team1_id', team1Id)
      .eq('team2_id', team2Id)
      .eq('match_start_time', matchStart.toISOString())
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from('matches').insert({
      team1_id: team1Id,
      team2_id: team2Id,
      // Zero address placeholder — update with real contract address after deployment
      contract_address: '0x0000000000000000000000000000000000000000',
      match_start_time: matchStart.toISOString(),
      voting_end_time: votingEnd.toISOString(),
      match_end_time: matchEnd.toISOString(),
      status: 'upcoming',
      is_qualification: false,
    })

    if (error) {
      console.error(`  ✗ ${match.team1} vs ${match.team2} (${match.date}): ${error.message}`)
      failed++
    } else {
      console.log(`  ✔  ${match.team1} vs ${match.team2}  ·  ${match.date}  ·  ${match.group ?? match.round}`)
      created++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Created: ${created}`)
  if (skipped > 0) console.log(`⏭️   Skipped: ${skipped} (already in DB)`)
  if (failed > 0)  console.log(`❌  Failed:  ${failed}`)
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
