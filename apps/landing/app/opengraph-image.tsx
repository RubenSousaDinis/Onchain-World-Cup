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
        tw="w-full h-full flex flex-col items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)',
          fontFamily: 'monospace',
        }}
      >
        {/* Trophy icon */}
        <div tw="flex text-[100px] mb-[30px]">🏆</div>

        {/* Main title */}
        <div
          tw="flex text-[72px] font-bold mb-5 text-center"
          style={{ color: '#d4ff00' }}
        >
          ONCHAIN WORLD CUP
        </div>

        {/* Subtitle */}
        <div
          tw="flex text-[40px] mb-[30px] text-center"
          style={{ color: '#8b9dc3' }}
        >
          Qualification Opens Mid-February
        </div>

        {/* ETH Prize Pool badge */}
        <div
          tw="flex rounded-lg text-[32px] font-bold mb-5"
          style={{
            backgroundColor: '#d4ff00',
            color: '#0a0f1e',
            padding: '15px 40px',
          }}
        >
          ETH PRIZE POOL
        </div>

        {/* Description */}
        <div
          tw="flex text-[26px] text-center max-w-[900px]"
          style={{
            color: '#8b9dc3',
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
