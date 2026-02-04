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
              opacity: 0.1,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              width: '100%',
              maxWidth: 1000,
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#00ff88',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                textAlign: 'center',
              }}
            >
              📊 PLAYER STATS
            </div>

            {/* Address */}
            <div
              style={{
                fontSize: 32,
                color: '#a8b3cf',
                marginBottom: 50,
                fontFamily: 'monospace',
              }}
            >
              {shortAddress}
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                gap: 20,
                marginBottom: 40,
              }}
            >
              {/* ETH Spent */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                  borderRadius: 12,
                  padding: '30px',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: '#a8b3cf',
                    marginBottom: 15,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  💰 Total Spent
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalSpent} ETH
                </div>
              </div>

              {/* Current Earnings */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                  borderRadius: 12,
                  padding: '30px',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: '#a8b3cf',
                    marginBottom: 15,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  🏆 Earnings
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalEarnings} ETH
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div
              style={{
                display: 'flex',
                gap: 40,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    color: '#a8b3cf',
                  }}
                >
                  📊 Total Votes:
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {userStats.totalVotes}
                </div>
              </div>
              {userStats.rank > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      color: '#a8b3cf',
                    }}
                  >
                    🎯 Rank:
                  </div>
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 'bold',
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
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: 50,
              }}
            >
              Onchain World Cup 2026
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
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              color: '#00ff88',
            }}
          >
            Error Generating Image
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
