import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
}

const rarityGradients: Record<string, { from: string; to: string }> = {
  common: { from: '#4B5563', to: '#1F2937' },
  rare: { from: '#2563EB', to: '#1E3A5F' },
  epic: { from: '#7C3AED', to: '#3B0764' },
  legendary: { from: '#D97706', to: '#7C2D12' },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'Achievement'
    const description = searchParams.get('description') || ''
    const icon = searchParams.get('icon') || '🏆'
    const rarity = (searchParams.get('rarity') || 'common') as keyof typeof rarityColors
    const address = searchParams.get('address') || ''

    const borderColor = rarityColors[rarity] ?? rarityColors.common
    const gradient = rarityGradients[rarity] ?? rarityGradients.common
    const logoSrc = new URL('/logo.png', request.url).href

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: 600,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            border: `4px solid ${borderColor}`,
            borderRadius: 16,
            padding: 40,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 30px ${borderColor}66`,
          }}
        >
          {/* Grid pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(255,255,255,0.1) 29px, rgba(255,255,255,0.1) 30px), repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(255,255,255,0.1) 29px, rgba(255,255,255,0.1) 30px)`,
            }}
          />

          {/* Header: icon + rarity badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
            <div style={{ display: 'flex', fontSize: 96 }}>{icon}</div>
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                backgroundColor: borderColor,
                color: '#000',
                padding: '6px 18px',
                borderRadius: 999,
              }}
            >
              {rarity}
            </div>
          </div>

          {/* Middle: title + description */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 1, gap: 12 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 36,
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 20,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.4,
                maxWidth: 480,
              }}
            >
              {description}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: 10 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
              }}
            >
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </div>
            {/* Logo branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
              <img src={logoSrc} width={40} height={39} style={{ borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      },
    )

    imageResponse.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')

    return imageResponse
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('Achievement card OG generation error:', e)
    return new Response(`Failed to generate image: ${message}`, { status: 500 })
  }
}
