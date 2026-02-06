import { ImageResponse } from 'next/og'
import countriesData from '@/data/countries.json'

export const runtime = 'edge'
export const alt = 'World Cup 2026 Qualification Leaderboard - Top 3 Countries. Vote now with ETH on Base Network. Top 48 qualify!'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  try {
    let topCountries: Array<{
      rank: number
      name: string
      flag: string
      votes: number
      eth: string
    }> = []

    // Fetch real leaderboard data from API with caching
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/qualification/countries?sort=votes&order=desc&limit=3`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        topCountries = data.data.slice(0, 3).map((country: any, index: number) => {
          // Find country info from countries.json
          const countryInfo = countriesData.find(
            (c) => c.code.toUpperCase() === country.country_code.toUpperCase()
          )

          return {
            rank: index + 1,
            name: countryInfo?.name || country.country_code,
            flag: countryInfo?.flagEmoji || '🏳️',
            votes: country.total_votes || 0,
            eth: parseFloat(country.total_eth || '0').toFixed(4),
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }

    // Fallback to placeholder if no data
    if (topCountries.length === 0) {
      topCountries = [
        { rank: 1, name: 'Brazil', flag: '🇧🇷', votes: 0, eth: '0.0000' },
        { rank: 2, name: 'Argentina', flag: '🇦🇷', votes: 0, eth: '0.0000' },
        { rank: 3, name: 'Germany', flag: '🇩🇪', votes: 0, eth: '0.0000' },
      ]
    }

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

          {/* Main content - compact padding so CTA is never cropped */}
          <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '36px 48px 40px' }}>
            {/* Header with logo */}
            <div tw="flex items-center justify-between w-full flex-shrink-0">
              <div tw="flex items-center" style={{ gap: 16 }}>
                {/* Logo */}
                <img
                  src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.svg`}
                  width="56"
                  height="52"
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 24, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 15, color: '#a0a0a0' }}>
                    QUALIFICATION LEADERBOARD
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

            {/* Leaderboard - compact so CTA fits */}
            <div tw="flex flex-col flex-1 min-h-0" style={{ gap: 10, marginTop: 20, marginBottom: 20 }}>
              {topCountries.map((country) => (
                <div
                  key={country.rank}
                  tw="flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 255, 0, 0.2)',
                    borderRadius: 8,
                    padding: '14px 24px',
                  }}
                >
                  {/* Rank & Country */}
                  <div tw="flex items-center" style={{ gap: 20 }}>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 28,
                        width: 40,
                        color: country.rank === 1 ? '#FFD700' : country.rank === 2 ? '#C0C0C0' : country.rank === 3 ? '#CD7F32' : '#d4ff00',
                        fontFamily: 'monospace',
                      }}
                    >
                      {country.rank}
                    </div>

                    {/* Flag */}
                    <div
                      tw="flex"
                      style={{
                        fontSize: 40,
                      }}
                    >
                      {country.flag}
                    </div>

                    {/* Country Name */}
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 26,
                        color: '#ffffff',
                      }}
                    >
                      {country.name}
                    </div>
                  </div>

                  {/* Stats */}
                  <div tw="flex flex-col items-end">
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 22,
                        color: '#d4ff00',
                        fontFamily: 'monospace',
                      }}
                    >
                      {country.votes.toLocaleString()} votes
                    </div>
                    <div
                      tw="flex"
                      style={{
                        fontSize: 16,
                        color: '#a0a0a0',
                        fontFamily: 'monospace',
                      }}
                    >
                      {country.eth} ETH
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA - flex-shrink-0 so it's never cropped */}
            <div tw="flex items-center justify-between flex-shrink-0">
              <div
                tw="flex items-center justify-center font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                  color: '#0a0f1a',
                  padding: '16px 40px',
                  borderRadius: 8,
                  fontSize: 28,
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
