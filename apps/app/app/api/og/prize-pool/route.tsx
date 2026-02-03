import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache configuration - 30 minutes cache for prize pool (changes frequently)
export const revalidate = 1800 // Cache for 30 minutes (ISR)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const totalPool = searchParams.get('totalPool') || '0.00'
    const team1Name = searchParams.get('team1Name') || 'Team 1'
    const team1Flag = searchParams.get('team1Flag') || '🏳️'
    const team1Pool = searchParams.get('team1Pool') || '0.00'
    const team1Votes = searchParams.get('team1Votes') || '0'
    const team2Name = searchParams.get('team2Name') || 'Team 2'
    const team2Flag = searchParams.get('team2Flag') || '🏳️'
    const team2Pool = searchParams.get('team2Pool') || '0.00'
    const team2Votes = searchParams.get('team2Votes') || '0'

    const winnerPool = (parseFloat(totalPool) * 0.9).toFixed(2)
    const platformFee = (parseFloat(totalPool) * 0.1).toFixed(2)

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
                fontSize: 64,
                fontWeight: 'bold',
                color: '#00ff88',
                marginBottom: 50,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                textAlign: 'center',
              }}
            >
              🏆 PRIZE POOL
            </div>

            {/* Total Pool */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                border: '4px solid #00ff88',
                borderRadius: 16,
                padding: '40px 80px',
                marginBottom: 50,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: '#a8b3cf',
                  marginBottom: 15,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Total Prize Pool
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  marginBottom: 20,
                }}
              >
                {totalPool} ETH
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 40,
                  fontSize: 20,
                  color: '#a8b3cf',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>Winner:</span>
                  <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{winnerPool} ETH (90%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>Platform:</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{platformFee} ETH (10%)</span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                gap: 30,
              }}
            >
              {/* Team 1 */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                  borderLeft: '8px solid #00ff88',
                  borderRadius: 12,
                  padding: '30px',
                }}
              >
                <div
                  style={{
                    fontSize: 80,
                    marginBottom: 20,
                    filter: 'drop-shadow(0 5px 15px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {team1Flag}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    marginBottom: 20,
                    textAlign: 'center',
                  }}
                >
                  {team1Name}
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                    marginBottom: 10,
                  }}
                >
                  {team1Pool} ETH
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: '#a8b3cf',
                  }}
                >
                  {team1Votes} votes
                </div>
              </div>

              {/* VS */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#a8b3cf',
                  }}
                >
                  VS
                </div>
              </div>

              {/* Team 2 */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '3px solid #00ff88',
                  borderRight: '8px solid #00ff88',
                  borderRadius: 12,
                  padding: '30px',
                }}
              >
                <div
                  style={{
                    fontSize: 80,
                    marginBottom: 20,
                    filter: 'drop-shadow(0 5px 15px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {team2Flag}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    marginBottom: 20,
                    textAlign: 'center',
                  }}
                >
                  {team2Name}
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                    marginBottom: 10,
                  }}
                >
                  {team2Pool} ETH
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: '#a8b3cf',
                  }}
                >
                  {team2Votes} votes
                </div>
              </div>
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
      {
        width: 1200,
        height: 630,
      },
    )

    // Add cache headers for CDN and browser caching
    // Shorter cache time for prize pool since data changes frequently
    imageResponse.headers.set(
      'Cache-Control',
      'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600'
    )

    return imageResponse
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
