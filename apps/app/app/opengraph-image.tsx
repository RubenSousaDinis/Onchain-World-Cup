import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Onchain World Cup 2026 - Vote with ETH on Base Network. Support your country in qualification voting.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
                src="https://app.onchainworldcup.xyz/logo.png"
                width="70"
                height="65"
                style={{ objectFit: 'contain' }}
              />
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

          {/* Main message */}
          <div tw="flex flex-col" style={{ gap: 30 }}>
            <div tw="flex flex-col" style={{ gap: 15 }}>
              <div tw="flex font-bold" style={{ fontSize: 72, color: '#ffffff', lineHeight: 1.1 }}>
                Vote with ETH.
              </div>
              <div tw="flex font-bold" style={{ fontSize: 72, color: '#ffffff', lineHeight: 1.1 }}>
                Support Your Country.
              </div>
            </div>

            <div tw="flex" style={{ fontSize: 28, color: '#a0a0a0', maxWidth: 800, lineHeight: 1.4 }}>
              Dynamic pricing • Early voters get better rates • Top 48 qualify
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
}
