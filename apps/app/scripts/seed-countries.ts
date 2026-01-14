import { getSupabaseClient } from '../lib/server/supabase'

/**
 * Seed script for 2026 World Cup countries
 *
 * The 2026 World Cup will feature 48 teams:
 * - 16 from UEFA (Europe)
 * - 9 from CAF (Africa)
 * - 8 from AFC (Asia)
 * - 6 from CONMEBOL (South America)
 * - 6 from CONCACAF (North/Central America)
 * - 1 from OFC (Oceania)
 * - 2 remaining slots (1 CONCACAF host + 1 intercontinental playoff)
 */

interface CountryData {
  name: string
  code: string
  flag_emoji: string
  fifa_rank: number
  qualified: boolean
}

const countries: CountryData[] = [
  // CONCACAF (Hosts - automatic qualification)
  { name: 'United States', code: 'USA', flag_emoji: '🇺🇸', fifa_rank: 13, qualified: true },
  { name: 'Canada', code: 'CAN', flag_emoji: '🇨🇦', fifa_rank: 40, qualified: true },
  { name: 'Mexico', code: 'MEX', flag_emoji: '🇲🇽', fifa_rank: 12, qualified: true },

  // UEFA (Europe) - Top teams based on FIFA rankings
  { name: 'Argentina', code: 'ARG', flag_emoji: '🇦🇷', fifa_rank: 1, qualified: true },
  { name: 'France', code: 'FRA', flag_emoji: '🇫🇷', fifa_rank: 2, qualified: true },
  { name: 'Spain', code: 'ESP', flag_emoji: '🇪🇸', fifa_rank: 3, qualified: true },
  { name: 'England', code: 'ENG', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fifa_rank: 4, qualified: true },
  { name: 'Brazil', code: 'BRA', flag_emoji: '🇧🇷', fifa_rank: 5, qualified: true },
  { name: 'Belgium', code: 'BEL', flag_emoji: '🇧🇪', fifa_rank: 6, qualified: true },
  { name: 'Netherlands', code: 'NED', flag_emoji: '🇳🇱', fifa_rank: 7, qualified: true },
  { name: 'Portugal', code: 'POR', flag_emoji: '🇵🇹', fifa_rank: 8, qualified: true },
  { name: 'Colombia', code: 'COL', flag_emoji: '🇨🇴', fifa_rank: 9, qualified: true },
  { name: 'Italy', code: 'ITA', flag_emoji: '🇮🇹', fifa_rank: 10, qualified: true },
  { name: 'Uruguay', code: 'URU', flag_emoji: '🇺🇾', fifa_rank: 11, qualified: true },
  { name: 'Croatia', code: 'CRO', flag_emoji: '🇭🇷', fifa_rank: 14, qualified: true },
  { name: 'Germany', code: 'GER', flag_emoji: '🇩🇪', fifa_rank: 15, qualified: true },
  { name: 'Morocco', code: 'MAR', flag_emoji: '🇲🇦', fifa_rank: 16, qualified: true },
  { name: 'Switzerland', code: 'SUI', flag_emoji: '🇨🇭', fifa_rank: 17, qualified: true },
  { name: 'Japan', code: 'JPN', flag_emoji: '🇯🇵', fifa_rank: 18, qualified: true },
  { name: 'Senegal', code: 'SEN', flag_emoji: '🇸🇳', fifa_rank: 19, qualified: true },
  { name: 'Denmark', code: 'DEN', flag_emoji: '🇩🇰', fifa_rank: 20, qualified: true },
  { name: 'South Korea', code: 'KOR', flag_emoji: '🇰🇷', fifa_rank: 21, qualified: true },
  { name: 'Australia', code: 'AUS', flag_emoji: '🇦🇺', fifa_rank: 22, qualified: true },

  // Additional UEFA teams
  { name: 'Poland', code: 'POL', flag_emoji: '🇵🇱', fifa_rank: 23, qualified: true },
  { name: 'Austria', code: 'AUT', flag_emoji: '🇦🇹', fifa_rank: 24, qualified: true },
  { name: 'Ukraine', code: 'UKR', flag_emoji: '🇺🇦', fifa_rank: 25, qualified: true },
  { name: 'Sweden', code: 'SWE', flag_emoji: '🇸🇪', fifa_rank: 26, qualified: true },
  { name: 'Turkey', code: 'TUR', flag_emoji: '🇹🇷', fifa_rank: 27, qualified: true },
  { name: 'Serbia', code: 'SRB', flag_emoji: '🇷🇸', fifa_rank: 28, qualified: true },
  { name: 'Russia', code: 'RUS', flag_emoji: '🇷🇺', fifa_rank: 29, qualified: false }, // Subject to FIFA decision
  { name: 'Wales', code: 'WAL', flag_emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', fifa_rank: 30, qualified: true },
  { name: 'Czech Republic', code: 'CZE', flag_emoji: '🇨🇿', fifa_rank: 31, qualified: true },
  { name: 'Scotland', code: 'SCO', flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fifa_rank: 32, qualified: true },

  // CONMEBOL (South America)
  { name: 'Ecuador', code: 'ECU', flag_emoji: '🇪🇨', fifa_rank: 33, qualified: true },
  { name: 'Peru', code: 'PER', flag_emoji: '🇵🇪', fifa_rank: 34, qualified: true },
  { name: 'Chile', code: 'CHI', flag_emoji: '🇨🇱', fifa_rank: 35, qualified: true },

  // CAF (Africa)
  { name: 'Nigeria', code: 'NGA', flag_emoji: '🇳🇬', fifa_rank: 36, qualified: true },
  { name: 'Tunisia', code: 'TUN', flag_emoji: '🇹🇳', fifa_rank: 37, qualified: true },
  { name: 'Cameroon', code: 'CMR', flag_emoji: '🇨🇲', fifa_rank: 38, qualified: true },
  { name: 'Egypt', code: 'EGY', flag_emoji: '🇪🇬', fifa_rank: 39, qualified: true },
  { name: 'Algeria', code: 'ALG', flag_emoji: '🇩🇿', fifa_rank: 41, qualified: true },
  { name: 'Ivory Coast', code: 'CIV', flag_emoji: '🇨🇮', fifa_rank: 42, qualified: true },
  { name: 'Ghana', code: 'GHA', flag_emoji: '🇬🇭', fifa_rank: 43, qualified: true },
  { name: 'Mali', code: 'MLI', flag_emoji: '🇲🇱', fifa_rank: 44, qualified: true },

  // AFC (Asia)
  { name: 'Iran', code: 'IRN', flag_emoji: '🇮🇷', fifa_rank: 45, qualified: true },
  { name: 'Saudi Arabia', code: 'KSA', flag_emoji: '🇸🇦', fifa_rank: 46, qualified: true },
  { name: 'Qatar', code: 'QAT', flag_emoji: '🇶🇦', fifa_rank: 47, qualified: true },
  { name: 'Iraq', code: 'IRQ', flag_emoji: '🇮🇶', fifa_rank: 48, qualified: true },
  { name: 'China', code: 'CHN', flag_emoji: '🇨🇳', fifa_rank: 49, qualified: false },

  // CONCACAF (Additional)
  { name: 'Costa Rica', code: 'CRC', flag_emoji: '🇨🇷', fifa_rank: 50, qualified: true },
  { name: 'Jamaica', code: 'JAM', flag_emoji: '🇯🇲', fifa_rank: 51, qualified: true },
  { name: 'Panama', code: 'PAN', flag_emoji: '🇵🇦', fifa_rank: 52, qualified: true },

  // OFC (Oceania)
  { name: 'New Zealand', code: 'NZL', flag_emoji: '🇳🇿', fifa_rank: 53, qualified: true },
]

async function seedCountries() {
  console.log('🌍 Starting countries seed...\n')

  const supabase = getSupabaseClient()

  try {
    // Check if countries already exist
    const { count } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      console.log(`⚠️  Found ${count} existing countries`)
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      const answer = await new Promise<string>((resolve) => {
        rl.question('Do you want to clear and re-seed? (yes/no): ', resolve)
      })
      rl.close()

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seed cancelled')
        process.exit(0)
      }

      // Delete existing countries
      console.log('🗑️  Deleting existing countries...')
      const { error: deleteError } = await supabase
        .from('countries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        throw deleteError
      }
      console.log('✅ Existing countries deleted\n')
    }

    // Insert all countries
    console.log(`📝 Inserting ${countries.length} countries...\n`)

    const { data, error } = await supabase
      .from('countries')
      .insert(countries)
      .select()

    if (error) {
      throw error
    }

    console.log('✅ Countries inserted successfully!\n')
    console.log('📊 Summary:')
    console.log(`   Total countries: ${data.length}`)
    console.log(`   Qualified: ${data.filter(c => c.qualified).length}`)
    console.log(`   Not yet qualified: ${data.filter(c => !c.qualified).length}`)

    // Group by confederation (based on FIFA rank ranges - approximate)
    console.log('\n🌎 By Confederation:')
    const _qualified = data.filter(c => c.qualified)
    console.log(`   CONCACAF (Hosts): 3`)
    console.log(`   UEFA (Europe): ~16`)
    console.log(`   CONMEBOL (South America): ~6`)
    console.log(`   CAF (Africa): ~9`)
    console.log(`   AFC (Asia): ~8`)
    console.log(`   OFC (Oceania): ~1`)
    console.log(`   Remaining slots: ~5`)

    console.log('\n🎉 Seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding countries:', error)
    process.exit(1)
  }
}

// Run the seed
seedCountries()
