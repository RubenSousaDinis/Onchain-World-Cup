import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache configuration
export const revalidate = 3600 // Cache for 1 hour (ISR)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const country = searchParams.get('country') || 'Country'
    const countryCode = searchParams.get('countryCode') || 'XX'
    const votes = searchParams.get('votes') || '0'
    const amount = searchParams.get('amount') || '0.000'

    // Get country flag emoji
    const countryFlag = getCountryFlag(countryCode)

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
              padding: '60px',
              zIndex: 1,
            }}
          >
            {/* Flag */}
            <div
              style={{
                fontSize: 180,
                marginBottom: 40,
                filter: 'drop-shadow(0 10px 30px rgba(0, 255, 136, 0.3))',
              }}
            >
              {countryFlag}
            </div>

            {/* Country Name */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#00ff88',
                marginBottom: 20,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              {country}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 32,
                color: '#a8b3cf',
                marginBottom: 50,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Qualification Vote
            </div>

            {/* Vote Box */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '3px solid #00ff88',
                borderRadius: 12,
                padding: '30px 60px',
                marginBottom: 50,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#00ff88',
                  marginBottom: 10,
                  fontFamily: 'monospace',
                }}
              >
                {votes} VOTES
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: '#a8b3cf',
                  fontFamily: 'monospace',
                }}
              >
                {amount} ETH
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                fontSize: 32,
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: 15,
                fontWeight: 'bold',
              }}
            >
              🔥 Vote Early = Better Prices!
            </div>

            {/* Branding */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
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

// Helper function to get country flag emoji from code
function getCountryFlag(countryCode: string): string {
  // Convert country code to flag emoji
  // Each country code letter maps to a regional indicator symbol
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}
