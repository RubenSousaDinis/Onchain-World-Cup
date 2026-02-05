import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'World Cup 2026 Qualification Leaderboard - Top 3 Countries. Vote now with ETH on Base Network. Top 48 qualify!'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  try {
    // ALWAYS use placeholder data to ensure TOP 3 countries are shown
    const topCountries: Array<{
      rank: number
      name: string
      flag: string
      votes: number
      eth: string
    }> = [
      { rank: 1, name: 'Brazil', flag: '🇧🇷', votes: 0, eth: '0.0000' },
      { rank: 2, name: 'Argentina', flag: '🇦🇷', votes: 0, eth: '0.0000' },
      { rank: 3, name: 'Germany', flag: '🇩🇪', votes: 0, eth: '0.0000' },
    ]

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
          <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '60px' }}>
            {/* Header with logo */}
            <div tw="flex items-center justify-between w-full">
              <div tw="flex items-center" style={{ gap: 20 }}>
                {/* Logo */}
                <img
                  src="https://app.onchainworldcup.xyz/logo.svg"
                  width="70"
                  height="65"
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 28, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
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

            {/* Leaderboard */}
            <div tw="flex flex-col" style={{ gap: 15 }}>
              {topCountries.map((country) => (
                <div
                  key={country.rank}
                  tw="flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 255, 0, 0.2)',
                    borderRadius: 8,
                    padding: '20px 30px',
                  }}
                >
                  {/* Rank & Country */}
                  <div tw="flex items-center" style={{ gap: 25 }}>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 36,
                        width: 50,
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
                        fontSize: 50,
                      }}
                    >
                      {country.flag}
                    </div>

                    {/* Country Name */}
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 32,
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
                        fontSize: 28,
                        color: '#d4ff00',
                        fontFamily: 'monospace',
                      }}
                    >
                      {country.votes.toLocaleString()} votes
                    </div>
                    <div
                      tw="flex"
                      style={{
                        fontSize: 20,
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
