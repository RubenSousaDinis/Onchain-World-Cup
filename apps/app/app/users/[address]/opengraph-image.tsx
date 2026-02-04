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
          tw="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-[60px]"
          style={{
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
          }}
        >
          {/* Soccer field pattern background */}
          <div
            tw="absolute inset-0"
            style={{
              opacity: 0.1,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Content */}
          <div tw="flex flex-col items-center justify-center z-10 w-full max-w-[1000px]">
            {/* Header */}
            <div
              tw="text-[64px] font-bold mb-5 uppercase text-center"
              style={{
                color: '#00ff88',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              📊 PLAYER STATS
            </div>

            {/* Address */}
            <div
              tw="text-[32px] mb-[50px]"
              style={{
                color: '#a8b3cf',
                fontFamily: 'monospace',
              }}
            >
              {shortAddress}
            </div>

            {/* Stats Grid */}
            <div tw="flex w-full gap-5 mb-10">
              {/* ETH Spent */}
              <div
                tw="flex-1 flex flex-col items-center rounded-xl p-[30px]"
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                }}
              >
                <div
                  tw="text-[24px] mb-[15px] uppercase"
                  style={{
                    color: '#a8b3cf',
                    letterSpacing: '0.1em',
                  }}
                >
                  💰 Total Spent
                </div>
                <div
                  tw="text-[48px] font-bold"
                  style={{
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalSpent} ETH
                </div>
              </div>

              {/* Current Earnings */}
              <div
                tw="flex-1 flex flex-col items-center rounded-xl p-[30px]"
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                }}
              >
                <div
                  tw="text-[24px] mb-[15px] uppercase"
                  style={{
                    color: '#a8b3cf',
                    letterSpacing: '0.1em',
                  }}
                >
                  🏆 Earnings
                </div>
                <div
                  tw="text-[48px] font-bold"
                  style={{
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalEarnings} ETH
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div tw="flex gap-10 items-center">
              <div tw="flex items-center gap-[15px]">
                <div tw="text-[32px]" style={{ color: '#a8b3cf' }}>
                  📊 Total Votes:
                </div>
                <div
                  tw="text-[40px] font-bold"
                  style={{
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalVotes}
                </div>
              </div>
              {userStats.rank > 0 && (
                <div tw="flex items-center gap-[15px]">
                  <div tw="text-[32px]" style={{ color: '#a8b3cf' }}>
                    🎯 Rank:
                  </div>
                  <div
                    tw="text-[40px] font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{userStats.rank}
                  </div>
                </div>
              )}
            </div>

            {/* Branding */}
            <div
              tw="text-[36px] font-bold uppercase mt-[50px]"
              style={{
                color: '#00ff88',
                letterSpacing: '0.05em',
              }}
            >
              Onchain World Cup 2026
            </div>
          </div>

          {/* Base Network Badge */}
          <div
            tw="absolute bottom-[30px] right-[30px] flex items-center gap-[10px] rounded-lg"
            style={{
              backgroundColor: 'rgba(0, 82, 255, 0.2)',
              border: '2px solid #0052FF',
              padding: '15px 25px',
            }}
          >
            <div
              tw="w-[30px] h-[30px] rounded-full"
              style={{
                backgroundColor: '#0052FF',
              }}
            />
            <div tw="text-[24px] font-bold" style={{ color: '#0052FF' }}>
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
          <div tw="flex text-[48px]" style={{ color: '#00ff88' }}>
            Error Generating Image
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
