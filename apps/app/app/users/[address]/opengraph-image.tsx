import { ImageResponse } from 'next/og'
import countriesData from '@/data/countries.json'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'User voting stats - Onchain World Cup 2026. Track your ETH spent, favorite country, votes and rank.'
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

export default async function Image({ params }: { params: Promise<{ address: string }> }) {
  try {
    const baseUrl = getBaseUrl()
    const { address } = await params
    const normalizedAddress = address.toLowerCase()

    // Fetch user stats and profile directly from Supabase
    let userStats = {
      totalSpent: '0.000',
      totalVotes: 0,
      rank: 0,
      favoriteCountry: null as { name: string; flag: string } | null,
    }
    let displayName = 'Player'
    let imageUrl: string | null = null

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

        // Fetch user stats
        const { data: stats } = await supabase
          .from('user_stats')
          .select('qualification_votes, qualification_spent_eth, rank')
          .eq('wallet_address', normalizedAddress)
          .single()

        if (stats) {
          userStats.totalSpent = parseFloat(stats.qualification_spent_eth || '0').toFixed(3)
          userStats.totalVotes = stats.qualification_votes || 0
          userStats.rank = stats.rank || 0
        }

        // Fetch user profile (name, image) if available
        const { data: user } = await supabase
          .from('users')
          .select('name, image')
          .eq('wallet_address', normalizedAddress)
          .single()

        if (user) {
          if (user.name && String(user.name).trim()) {
            displayName = String(user.name).trim()
          }
          if (user.image && String(user.image).trim()) {
            imageUrl = String(user.image).trim()
          }
        }

        // Calculate favorite country from votes
        const { data: votes } = await supabase
          .from('qualification_votes')
          .select('country_code, vote_count')
          .eq('voter_address', normalizedAddress)
          .order('created_at', { ascending: false })
          .limit(50)

        if (votes && votes.length > 0) {
          const countryVotes: Record<string, number> = {}

          // Count votes per country
          votes.forEach((vote) => {
            const code = vote.country_code
            countryVotes[code] = (countryVotes[code] || 0) + (vote.vote_count || 1)
          })

          // Find country with most votes
          const favoriteCode = Object.entries(countryVotes).reduce((a, b) =>
            b[1] > a[1] ? b : a
          )[0]

          // Look up country info
          const countryInfo = countriesData.find(
            (c) => c.code.toUpperCase() === favoriteCode.toUpperCase()
          )

          if (countryInfo) {
            userStats.favoriteCountry = {
              name: countryInfo.name,
              flag: countryInfo.flagEmoji,
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      // Use default values if API fails
    }

    // Shorten address for display
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

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

          {/* Main content - centered like country OG, extra padding so content stays in the middle */}
          <div tw="flex flex-col items-center justify-between w-full" style={{ height: '100%', padding: '56px 72px 52px' }}>
            {/* Header with logo */}
            <div tw="flex items-center justify-between w-full flex-shrink-0">
              <div tw="flex items-center" style={{ gap: 16 }}>
                {/* Logo */}
                <img
                  src={`${baseUrl}/logo.svg`}
                  width="56"
                  height="52"
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 24, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 15, color: '#a0a0a0' }}>
                    PLAYER STATISTICS
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
                  padding: '10px 16px',
                }}
              >
                <div
                  tw="flex rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    background: '#0052FF',
                  }}
                />
                <div tw="flex font-bold" style={{ fontSize: 14, color: '#0052FF' }}>
                  BASE
                </div>
              </div>
            </div>

            {/* Middle: player image + name, then stats (centered like country OG) */}
            <div tw="flex flex-col items-center justify-center" style={{ gap: 20, flex: 1, paddingTop: 24, paddingBottom: 24 }}>
              {/* Player avatar + "{Name} Stats" */}
              <div tw="flex flex-row items-center" style={{ gap: 20 }}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    width={80}
                    height={80}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(212, 255, 0, 0.4)',
                    }}
                  />
                ) : null}
                <div tw="flex flex-col" style={{ gap: 4 }}>
                  <div tw="flex font-bold" style={{ fontSize: 44, color: '#ffffff' }}>
                    {displayName} Stats
                  </div>
                  <div tw="flex" style={{ fontSize: 20, color: '#a0a0a0', fontFamily: 'monospace' }}>
                    {shortAddress}
                  </div>
                </div>
              </div>

              {/* Stats Grid - 3 equal-width cards in one row (same as country OG) */}
              <div tw="flex flex-row" style={{ gap: 12 }}>
                {/* Total Spent */}
                <div
                  tw="flex flex-col items-center justify-center"
                  style={{
                    width: 220,
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '16px 8px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 6 }}>
                    Total Spent
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 28,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {userStats.totalSpent} ETH
                  </div>
                </div>

                {/* Favorite Country */}
                <div
                  tw="flex flex-col items-center justify-center"
                  style={{
                    width: 220,
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '16px 8px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 6 }}>
                    Favorite Country
                  </div>
                  {userStats.favoriteCountry ? (
                    <div tw="flex flex-col items-center" style={{ gap: 4 }}>
                      <div tw="flex" style={{ fontSize: 32 }}>
                        {userStats.favoriteCountry.flag}
                      </div>
                      <div
                        tw="flex font-bold"
                        style={{
                          fontSize: 16,
                          color: '#d4ff00',
                        }}
                      >
                        {userStats.favoriteCountry.name}
                      </div>
                    </div>
                  ) : (
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 24,
                        color: '#666',
                      }}
                    >
                      —
                    </div>
                  )}
                </div>

                {/* Total Votes */}
                <div
                  tw="flex flex-col items-center justify-center"
                  style={{
                    width: 220,
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '16px 8px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 14, color: '#a0a0a0', marginBottom: 6 }}>
                    Total Votes
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 28,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {userStats.totalVotes.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* CTA button - centered below cards */}
              <div
                tw="flex items-center justify-center font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                  color: '#0a0f1a',
                  padding: '16px 40px',
                  borderRadius: 8,
                  fontSize: 26,
                  boxShadow: '0 8px 32px rgba(212, 255, 0, 0.3)',
                }}
              >
                VIEW STATS
              </div>
            </div>

            {/* Bottom: domain */}
            <div tw="flex items-center justify-center w-full flex-shrink-0" style={{ marginTop: 12 }}>
              <div tw="flex" style={{ fontSize: 18, color: '#666', fontFamily: 'monospace' }}>
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
