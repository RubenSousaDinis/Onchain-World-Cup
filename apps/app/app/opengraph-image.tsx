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
        style={{
          fontSize: 60,
          background: '#0a0f1e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Trophy icon */}
        <div
          style={{
            display: 'flex',
            fontSize: 100,
            marginBottom: 30,
          }}
        >
          🏆
        </div>

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            color: '#d4ff00',
            fontWeight: 'bold',
            fontSize: 72,
            marginBottom: 20,
          }}
        >
          ONCHAIN WORLD CUP 2026
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 42,
            color: '#ffffff',
            marginBottom: 15,
            fontWeight: 'bold',
          }}
        >
          Vote with ETH on Base Network
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#8b9dc3',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Support your country • Early voters get better prices • Top 48 qualify
        </div>

        {/* CTA Badge */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#d4ff00',
            color: '#0a0f1e',
            padding: '20px 50px',
            borderRadius: 8,
            fontSize: 36,
            fontWeight: 'bold',
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
