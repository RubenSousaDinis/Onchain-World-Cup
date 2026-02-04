import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Qualification Leaderboard - Onchain World Cup 2026'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  try {
    // Fetch top 5 countries from API
    let topCountries: Array<{
      rank: number
      name: string
      flag: string
      votes: number
      eth: string
    }> = []

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.onchainworldcup.xyz'}/api/qualification/leaderboard`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        topCountries = data.data.slice(0, 5).map((country: any, index: number) => ({
          rank: index + 1,
          name: country.country_name || 'Unknown',
          flag: country.country_flag || '🏳️',
          votes: country.total_votes || 0,
          eth: parseFloat(country.total_eth || '0').toFixed(4),
        }))
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      // Use placeholder data if API fails
      topCountries = [
        { rank: 1, name: 'Loading...', flag: '🏳️', votes: 0, eth: '0.0000' },
      ]
    }

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
            {topCountries.map((country) => (
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
                    {country.name}
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
      { ...size }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    // Return error image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0f1a',
          }}
        >
          <div style={{
                display: 'flex', fontSize: 48, color: '#00ff88' }}>Error Generating Image</div>
        </div>
      ),
      { ...size }
    )
  }
}
