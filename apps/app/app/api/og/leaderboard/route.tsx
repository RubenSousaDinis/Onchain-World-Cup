import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

// Function to get country flag emoji from code
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Function to get country name from code
function getCountryName(countryCode: string): string {
  // Map of common country codes to names
  const countryNames: Record<string, string> = {
    'AR': 'Argentina', 'BR': 'Brazil', 'FR': 'France', 'DE': 'Germany', 'ES': 'Spain',
    'IT': 'Italy', 'GB-ENG': 'England', 'PT': 'Portugal', 'BE': 'Belgium', 'NL': 'Netherlands',
    'CO': 'Colombia', 'UY': 'Uruguay', 'MX': 'Mexico', 'CR': 'Costa Rica', 'US': 'USA',
    'CA': 'Canada', 'JP': 'Japan', 'KR': 'South Korea', 'AU': 'Australia', 'SA': 'Saudi Arabia',
  }

  return countryNames[countryCode.toUpperCase()] || countryCode
}

export async function GET(request: NextRequest) {
  try {
    // Fetch top 5 countries from database
    const topCountries = await prisma.countryStats.findMany({
      orderBy: {
        totalVotes: 'desc',
      },
      take: 5,
      select: {
        countryCode: true,
        totalVotes: true,
        totalEth: true,
      },
    })

    // Transform data for display
    const leaderboardData = topCountries.map((country, index) => ({
      rank: index + 1,
      countryCode: country.countryCode,
      countryName: getCountryName(country.countryCode),
      flag: getCountryFlag(country.countryCode),
      votes: country.totalVotes,
      eth: parseFloat(country.totalEth).toFixed(4),
    }))

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
            position: 'relative',
            overflow: 'hidden',
            padding: '60px',
          }}
        >
          {/* Soccer field pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 40,
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#00ff88',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              🏆 QUALIFICATION LEADERBOARD
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#a8b3cf',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Top 5 Countries • Live Rankings
            </div>
          </div>

          {/* Leaderboard */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: 900,
              gap: 15,
              zIndex: 1,
            }}
          >
            {leaderboardData.map((country) => (
              <div
                key={country.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: country.rank <= 3 ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 255, 136, 0.08)',
                  border: country.rank <= 3 ? '3px solid #00ff88' : '2px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: 12,
                  padding: '20px 30px',
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 'bold',
                      color: country.rank === 1 ? '#FFD700' : country.rank === 2 ? '#C0C0C0' : country.rank === 3 ? '#CD7F32' : '#00ff88',
                      width: 60,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  >
                    {country.rank}
                  </div>

                  {/* Flag */}
                  <div
                    style={{
                      fontSize: 56,
                      filter: country.rank <= 3 ? 'drop-shadow(0 5px 15px rgba(0, 255, 136, 0.3))' : 'none',
                    }}
                  >
                    {country.flag}
                  </div>

                  {/* Country Name */}
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 'bold',
                      color: country.rank <= 3 ? '#00ff88' : '#ffffff',
                      minWidth: 250,
                    }}
                  >
                    {country.countryName}
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 'bold',
                      color: '#00ff88',
                      fontFamily: 'monospace',
                    }}
                  >
                    {country.votes.toLocaleString()} votes
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      color: '#a8b3cf',
                      fontFamily: 'monospace',
                    }}
                  >
                    {country.eth} ETH
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 40,
              gap: 15,
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Onchain World Cup 2026
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#a8b3cf',
              }}
            >
              Vote Now • Top 48 Qualify
            </div>
          </div>

          {/* Base Network Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(0, 82, 255, 0.2)',
              border: '2px solid #0052FF',
              borderRadius: 8,
              padding: '15px 25px',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: '#0052FF',
              }}
            />
            <div
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#0052FF',
              }}
            >
              Base Network
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
