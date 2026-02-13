import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache configuration - 1 hour cache for user stats
export const revalidate = 3600 // Cache for 1 hour (ISR)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const ethSpent = searchParams.get('ethSpent') || '0.000'
    const earnings = searchParams.get('earnings') || '0.000'
    const country = searchParams.get('country') || 'None'
    const countryFlag = searchParams.get('countryFlag') || '🏳️'
    const votes = searchParams.get('votes') || '0'
    const rank = searchParams.get('rank') || '0'
    const levelNum = parseInt(searchParams.get('levelNum') || '1', 10)
    const levelName = searchParams.get('levelName') || 'Youth Player'
    const achievementPoints = searchParams.get('achievementPoints') || '0'

    const LEVEL_COLORS: Record<number, { border: string; bg: string; text: string }> = {
      1: { border: '#6b7280', bg: 'rgba(107,114,128,0.2)', text: '#9ca3af' },
      2: { border: '#22c55e', bg: 'rgba(34,197,94,0.2)',   text: '#4ade80' },
      3: { border: '#3b82f6', bg: 'rgba(59,130,246,0.2)',  text: '#60a5fa' },
      4: { border: '#a855f7', bg: 'rgba(168,85,247,0.2)',  text: '#c084fc' },
      5: { border: '#f97316', bg: 'rgba(249,115,22,0.2)',  text: '#fb923c' },
      6: { border: '#eab308', bg: 'rgba(234,179,8,0.2)',   text: '#facc15' },
    }
    const lvlStyle = LEVEL_COLORS[levelNum] ?? LEVEL_COLORS[1]

    const imageResponse = new ImageResponse(
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 40,
                gap: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 64,
                  fontWeight: 'bold',
                  color: '#00ff88',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                  textAlign: 'center',
                }}
              >
                📊 MY STATS
              </div>
              {/* Level badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: `3px solid ${lvlStyle.border}`,
                  borderRadius: 8,
                  backgroundColor: lvlStyle.bg,
                  padding: '10px 24px',
                }}
              >
                <span style={{ display: 'flex', fontSize: 28, fontWeight: 'bold', color: lvlStyle.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  LV.{levelNum}
                </span>
                <span style={{ display: 'flex', fontSize: 28, fontWeight: 'bold', color: lvlStyle.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {levelName}
                </span>
                <span style={{ display: 'flex', fontSize: 22, color: '#a8b3cf' }}>
                  · {achievementPoints} pts
                </span>
              </div>
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
                    display: 'flex',
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
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {ethSpent} ETH
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
                    display: 'flex',
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
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {earnings} ETH
                </div>
              </div>
            </div>

            {/* Favorite Country */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '3px solid #00ff88',
                borderRadius: 12,
                padding: '30px 60px',
                marginBottom: 40,
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: '#a8b3cf',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                ⚽ Favorite Country
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 80,
                    filter: 'drop-shadow(0 10px 30px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {countryFlag}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 56,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    textTransform: 'uppercase',
                  }}
                >
                  {country}
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
                    display: 'flex',
                    fontSize: 32,
                    color: '#a8b3cf',
                  }}
                >
                  📊 Total Votes:
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}
                >
                  {votes}
                </div>
              </div>
              {rank !== '0' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 32,
                      color: '#a8b3cf',
                    }}
                  >
                    🎯 Rank:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 40,
                      fontWeight: 'bold',
                      color: '#FFD700',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{rank}
                  </div>
                </div>
              )}
            </div>

            {/* Branding */}
            <div
              style={{
                display: 'flex',
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
                display: 'flex',
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: '#0052FF',
              }}
            />
            <div
              style={{
                display: 'flex',
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

    // Add cache headers for CDN and browser caching
    imageResponse.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    )

    return imageResponse
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
