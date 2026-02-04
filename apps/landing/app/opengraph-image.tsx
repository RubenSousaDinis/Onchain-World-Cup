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
          background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)',
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
        <div style={{ display: 'flex', fontSize: 100, marginBottom: 30 }}>🏆</div>

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            color: '#d4ff00',
            fontWeight: 'bold',
            fontSize: 72,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          ONCHAIN WORLD CUP
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: '#8b9dc3',
            marginBottom: 30,
            textAlign: 'center',
          }}
        >
          Qualification Opens Mid-February
        </div>

        {/* ETH Prize Pool badge */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#d4ff00',
            color: '#0a0f1e',
            padding: '15px 40px',
            borderRadius: 8,
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          ETH PRIZE POOL
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#8b9dc3',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          Add the app & get notified when voting begins
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
