import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const address = searchParams.get('address') || ''
    const referralCount = parseInt(searchParams.get('referralCount') || '0', 10)
    const referralEarnedEth = parseFloat(searchParams.get('referralEarnedEth') || '0')

    const truncatedAddress = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : ''

    const ethDisplay = referralEarnedEth > 0
      ? `${parseFloat(referralEarnedEth.toFixed(6))} ETH earned`
      : 'Earn 1% on every vote you refer'

    const logoSrc = new URL('/logo.jpg', request.url).href

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
            padding: '60px 80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Grid pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.07,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #00ff88 39px, #00ff88 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #00ff88 39px, #00ff88 40px)`,
            }}
          />

          {/* Glow accent */}
          <div
            style={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src={logoSrc} width={52} height={52} style={{ borderRadius: 8 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#00ff88', letterSpacing: '0.05em' }}>
                  ONCHAIN WORLD CUP
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                  VOTE WITH ETH ON BASE
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 15,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
                background: 'rgba(255,255,255,0.06)',
                padding: '8px 18px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {truncatedAddress}
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1, gap: 20 }}>
            <div style={{ display: 'flex', fontSize: 20, color: '#00ff88', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              🔗 Referral Invite
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 62,
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.1,
                maxWidth: 900,
              }}
            >
              Join me on the World Cup vote
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
              Back your country. Vote with ETH. Win rewards.
            </div>
          </div>

          {/* Footer stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: 32 }}>
              {/* Referral count */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.25)',
                  borderRadius: 10,
                  padding: '16px 28px',
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', fontSize: 38, fontWeight: 'bold', color: '#00ff88' }}>
                  {referralCount}
                </div>
                <div style={{ display: 'flex', fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                  VOTES REFERRED
                </div>
              </div>

              {/* ETH earned / CTA */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '16px 28px',
                  gap: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ display: 'flex', fontSize: 22, fontWeight: 'bold', color: '#ffffff' }}>
                  {ethDisplay}
                </div>
                <div style={{ display: 'flex', fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                  FROM REFERRALS
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 16,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.05em',
              }}
            >
              app.onchainworldcup.xyz
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (e) {
    console.error('Referral OG generation error:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
