import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'World Cup 2026 Qualification Leaderboard - Top 5 Countries. Vote now with ETH on Base Network. Top 48 qualify!'
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
          tw="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
            padding: '60px',
          }}
        >
          {/* Soccer field pattern background */}
          <div
            tw="absolute inset-0"
            style={{
              opacity: 0.08,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Header */}
          <div tw="flex flex-col items-center z-10" style={{ marginBottom: 40 }}>
            <div
              tw="flex font-bold uppercase tracking-wide"
              style={{
                fontSize: 64,
                marginBottom: 10,
                color: '#00ff88',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              🏆 QUALIFICATION LEADERBOARD
            </div>
            <div
              tw="flex uppercase"
              style={{
                fontSize: 28,
                color: '#a8b3cf',
                letterSpacing: '0.1em',
              }}
            >
              Top 5 Countries • Live Rankings
            </div>
          </div>

          {/* Leaderboard */}
          <div tw="flex flex-col w-full z-10" style={{ maxWidth: 900, gap: 15 }}>
            {topCountries.map((country) => (
              <div
                key={country.rank}
                tw="flex items-center justify-between rounded-xl"
                style={{
                  backgroundColor: country.rank <= 3 ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 255, 136, 0.08)',
                  border: country.rank <= 3 ? '3px solid #00ff88' : '2px solid rgba(0, 255, 136, 0.3)',
                  padding: '20px 30px',
                }}
              >
                {/* Rank */}
                <div tw="flex items-center" style={{ gap: 20 }}>
                  <div
                    tw="flex font-bold text-center"
                    style={{
                      fontSize: 48,
                      width: 60,
                      color: country.rank === 1 ? '#FFD700' : country.rank === 2 ? '#C0C0C0' : country.rank === 3 ? '#CD7F32' : '#00ff88',
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
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      minWidth: 250,
                      color: country.rank <= 3 ? '#00ff88' : '#ffffff',
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
                      fontSize: 36,
                      color: '#00ff88',
                      fontFamily: 'monospace',
                    }}
                  >
                    {country.votes.toLocaleString()} votes
                  </div>
                  <div
                    tw="flex"
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
          <div tw="flex flex-col items-center z-10" style={{ marginTop: 40, gap: 15 }}>
            <div
              tw="flex font-bold uppercase"
              style={{
                fontSize: 32,
                color: '#00ff88',
                letterSpacing: '0.05em',
              }}
            >
              Onchain World Cup 2026
            </div>
            <div tw="flex" style={{ fontSize: 24, color: '#a8b3cf' }}>
              Vote Now • Top 48 Qualify
            </div>
          </div>

          {/* Base Network Badge */}
          <div
            tw="absolute flex items-center rounded-lg"
            style={{
              bottom: 30,
              right: 30,
              gap: 10,
              backgroundColor: 'rgba(0, 82, 255, 0.2)',
              border: '2px solid #0052FF',
              padding: '15px 25px',
            }}
          >
            <div
              tw="flex rounded-full"
              style={{
                width: 30,
                height: 30,
                backgroundColor: '#0052FF',
              }}
            />
            <div tw="flex font-bold" style={{ fontSize: 24, color: '#0052FF' }}>
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
          tw="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: '#0a0f1a',
          }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#00ff88' }}>
            Error Generating Image
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
