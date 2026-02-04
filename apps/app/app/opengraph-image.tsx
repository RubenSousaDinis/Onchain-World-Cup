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
        tw="w-full h-full flex flex-col items-center justify-center relative"
        style={{
          background: '#0a0f1e',
          fontFamily: 'monospace',
        }}
      >
        {/* Trophy icon */}
        <div tw="flex" style={{ fontSize: 100, marginBottom: 30 }}>
          🏆
        </div>

        {/* Main title */}
        <div tw="flex font-bold" style={{ fontSize: 72, marginBottom: 20, color: '#d4ff00' }}>
          ONCHAIN WORLD CUP 2026
        </div>

        {/* Subtitle */}
        <div tw="flex font-bold" style={{ fontSize: 42, marginBottom: 15, color: '#ffffff' }}>
          Vote with ETH on Base Network
        </div>

        {/* Description */}
        <div
          tw="flex text-center"
          style={{
            fontSize: 28,
            color: '#8b9dc3',
            lineHeight: 1.4,
            maxWidth: '900px',
            marginBottom: 40,
          }}
        >
          Support your country • Early voters get better prices • Top 48 qualify
        </div>

        {/* CTA Badge */}
        <div
          tw="flex rounded-lg font-bold"
          style={{
            fontSize: 36,
            backgroundColor: '#d4ff00',
            color: '#0a0f1e',
            padding: '20px 50px',
          }}
        >
          🔥 VOTE NOW
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
