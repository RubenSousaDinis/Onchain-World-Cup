import { ImageResponse } from 'next/og'
import countriesData from '@/data/countries.json'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Vote for your country in World Cup 2026 qualification. Support with ETH on Base Network.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Helper to get the base URL for assets
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://app.onchainworldcup.xyz'
}

// Helper to get country flag emoji from code
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default async function Image({ params }: { params: Promise<{ countryId: string }> }) {
  try {
    const baseUrl = getBaseUrl()
    const { countryId } = await params
    const countryIdUpper = countryId.toUpperCase()

    // Find country data from JSON - support both country code (PT) and name (PORTUGAL)
    const country = countriesData.find(
      (c) => c.code.toUpperCase() === countryIdUpper || c.name.toUpperCase() === countryIdUpper
    )

    if (!country) {
      // Return a default image if country not found
      return new ImageResponse(
        (
          <div
            tw="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: '#0a0f1a',
              fontFamily: 'Arial Narrow, Helvetica Condensed, Arial, sans-serif',
            }}
          >
            <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
              Country Not Found
            </div>
          </div>
        ),
        {
          ...size,
        }
      )
    }

    // Fetch country stats directly from Supabase
    let votes = 0
    let amount = '0.000'
    let rank = 0

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })

        // Fetch the specific country's stats
        const { data: countryStats, error } = await supabase
          .from('country_stats')
          .select('total_votes, total_eth')
          .eq('country_code', country.code.toUpperCase())
          .single()

        if (!error && countryStats) {
          votes = countryStats.total_votes || 0
          amount = parseFloat(countryStats.total_eth || '0').toFixed(3)
        }

        // Calculate rank by counting countries with more votes
        const { count } = await supabase
          .from('country_stats')
          .select('*', { count: 'exact', head: true })
          .gt('total_votes', votes)

        rank = (count || 0) + 1
      }
    } catch (error) {
      console.error('Failed to fetch country stats:', error)
      // Use default values if API fails
    }

    const countryFlag = country.flagEmoji || getCountryFlag(country.code)
    const countryName = country.name

    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex relative"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
            fontFamily: 'Arial Narrow, Helvetica Condensed, Arial, sans-serif',
          }}
        >
          {/* Grid pattern overlay */}
          <div
            tw="absolute inset-0 flex"
            style={{
              backgroundImage: 'linear-gradient(rgba(212, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 255, 0, 0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Main content */}
          <div tw="flex flex-col items-center justify-between w-full" style={{ height: '100%', padding: '60px' }}>
            {/* Header with logo */}
            <div tw="flex items-center justify-between w-full">
              <div tw="flex items-center" style={{ gap: 20 }}>
                {/* Logo */}
                <img
                  src={`${baseUrl}/logo.svg`}
                  width="70"
                  height="65"
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 28, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                    2026 QUALIFICATION
                  </div>
                </div>
              </div>

              {/* Base badge */}
              <div
                tw="flex items-center"
                style={{
                  gap: 10,
                  background: 'rgba(0, 82, 255, 0.15)',
                  border: '2px solid #0052FF',
                  borderRadius: 8,
                  padding: '12px 20px',
                }}
              >
                <div
                  tw="flex rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    background: '#0052FF',
                  }}
                />
                <div tw="flex font-bold" style={{ fontSize: 16, color: '#0052FF' }}>
                  BASE
                </div>
              </div>
            </div>

            {/* Middle: Flag and stats */}
            <div tw="flex flex-col items-center" style={{ gap: 30 }}>
              {/* Flag */}
              <div
                tw="flex"
                style={{
                  fontSize: 120,
                  filter: 'drop-shadow(0 10px 30px rgba(212, 255, 0, 0.3))',
                }}
              >
                {countryFlag}
              </div>

              {/* Country Name */}
              <div
                tw="flex font-bold text-center uppercase"
                style={{
                  fontSize: 56,
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                }}
              >
                {countryName}
              </div>

              {/* Stats Grid */}
              <div tw="flex items-center" style={{ gap: 30 }}>
                {/* Rank */}
                {rank > 0 && (
                  <div
                    tw="flex flex-col items-center"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: 12,
                      padding: '20px 30px',
                    }}
                  >
                    <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                      Rank
                    </div>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 40,
                        color: '#FFD700',
                        fontFamily: 'monospace',
                      }}
                    >
                      #{rank}
                    </div>
                  </div>
                )}

                {/* Votes */}
                <div
                  tw="flex flex-col items-center"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '20px 30px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                    Total Votes
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {votes.toLocaleString()}
                  </div>
                </div>

                {/* ETH */}
                <div
                  tw="flex flex-col items-center"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '20px 30px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                    Total ETH
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {amount}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: CTA button */}
            <div tw="flex items-center justify-between w-full">
              <div
                tw="flex items-center justify-center font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                  color: '#0a0f1a',
                  padding: '20px 50px',
                  borderRadius: 8,
                  fontSize: 32,
                  boxShadow: '0 8px 32px rgba(212, 255, 0, 0.3)',
                }}
              >
                VOTE NOW
              </div>

              <div tw="flex" style={{ fontSize: 20, color: '#666', fontFamily: 'monospace' }}>
                app.onchainworldcup.xyz
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    // Return error image
    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: '#0a0f1a',
            fontFamily: 'Arial Narrow, Helvetica Condensed, Arial, sans-serif',
          }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
            Error Generating Image
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}
