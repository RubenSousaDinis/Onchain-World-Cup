import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Onchain World Cup - Qualification Opens Soon'
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
        <div style={{
                display: 'flex', fontSize: 100, marginBottom: 30 }}>🏆</div>

        {/* Main title */}
        <div
          style={{
            color: '#d4ff00',
            fontWeight: 'bold',
            fontSize: 72,
            marginBottom: 20,
          }}
        >
          ONCHAIN WORLD CUP
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 40,
            color: '#8b9dc3',
            marginBottom: 30,
          }}
        >
          Qualification Opens Soon
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: '#8b9dc3',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          Back your country with ETH • Top 48 qualify • Prize pool shared among winners
        </div>

        {/* Footer badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            backgroundColor: '#d4ff00',
            color: '#0a0f1e',
            padding: '15px 30px',
            borderRadius: 8,
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          EARLY SUPPORTERS SHAPE THE TOURNAMENT
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
