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
          tw="w-full h-full flex relative"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
            fontFamily: 'system-ui, sans-serif',
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
          <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '60px' }}>
            {/* Header with logo */}
            <div tw="flex items-center justify-between w-full">
              <div tw="flex items-center" style={{ gap: 20 }}>
                {/* Logo/Trophy */}
                <div
                  tw="flex items-center justify-center"
                  style={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                    borderRadius: 12,
                    fontSize: 48,
                  }}
                >
                  ⚽
                </div>
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

            {/* Leaderboard */}
            <div tw="flex flex-col" style={{ gap: 12 }}>
              {topCountries.map((country) => (
                <div
                  key={country.rank}
                  tw="flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 255, 0, 0.2)',
                    borderRadius: 8,
                    padding: '16px 24px',
                  }}
                >
                  {/* Rank & Country */}
                  <div tw="flex items-center" style={{ gap: 20 }}>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 32,
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
                        fontSize: 48,
                        marginTop: 20,
                      }}
                    >
                      {country.flag}
                    </div>

                    {/* Country Name */}
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 28,
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
                        fontSize: 24,
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

            {/* CTA */}
            <div tw="flex items-center justify-between">
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
                🔥 VOTE NOW
              </div>

              <div tw="flex" style={{ fontSize: 20, color: '#666', fontFamily: 'monospace' }}>
                app.onchainworldcup.xyz
              </div>
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
          <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
            Error Generating Image
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
