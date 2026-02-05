import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'User voting stats - Onchain World Cup 2026. Track your ETH spent, earnings, votes and rank.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params

    // Fetch user stats from API
    let userStats = {
      totalSpent: '0.000',
      totalEarnings: '0.000',
      totalVotes: 0,
      rank: 0,
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.onchainworldcup.xyz'}/api/users/${address}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        userStats = {
          totalSpent: parseFloat(data.data.qualification_spent_eth || '0').toFixed(3),
          totalEarnings: parseFloat(data.data.qualification_won_eth || '0').toFixed(3),
          totalVotes: data.data.qualification_votes || 0,
          rank: data.data.rank || 0,
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

            {/* User Stats Content */}
            <div tw="flex flex-col" style={{ gap: 25 }}>
              {/* Title */}
              <div tw="flex flex-col" style={{ gap: 10 }}>
                <div tw="flex font-bold" style={{ fontSize: 44, color: '#ffffff' }}>
                  Player Stats
                </div>
                <div tw="flex" style={{ fontSize: 22, color: '#a0a0a0', fontFamily: 'monospace' }}>
                  {shortAddress}
                </div>
              </div>

              {/* Stats Grid */}
              <div tw="flex" style={{ gap: 20 }}>
                {/* ETH Spent */}
                <div
                  tw="flex-1 flex flex-col"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '24px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 10 }}>
                    Total Spent
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 34,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {userStats.totalSpent} ETH
                  </div>
                </div>

                {/* Earnings */}
                <div
                  tw="flex-1 flex flex-col"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '24px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 10 }}>
                    Total Earnings
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 34,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {userStats.totalEarnings} ETH
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div tw="flex items-center" style={{ gap: 40 }}>
                <div
                  tw="flex flex-col"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '20px 30px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 16, color: '#a0a0a0', marginBottom: 8 }}>
                    Total Votes
                  </div>
                  <div tw="flex font-bold" style={{ fontSize: 32, color: '#d4ff00', fontFamily: 'monospace' }}>
                    {userStats.totalVotes.toLocaleString()}
                  </div>
                </div>
                {userStats.rank > 0 && (
                  <div
                    tw="flex flex-col"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: 12,
                      padding: '20px 30px',
                    }}
                  >
                    <div tw="flex" style={{ fontSize: 16, color: '#a0a0a0', marginBottom: 8 }}>
                      Global Rank
                    </div>
                    <div tw="flex font-bold" style={{ fontSize: 32, color: '#FFD700', fontFamily: 'monospace' }}>
                      #{userStats.rank}
                    </div>
                  </div>
                )}
              </div>
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
                VIEW STATS
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
