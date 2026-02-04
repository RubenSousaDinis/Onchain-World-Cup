import { ImageResponse } from 'next/og'
import countriesData from '@/data/countries.json'

export const runtime = 'edge'
export const alt = 'Vote for your country in World Cup 2026 qualification. Support with ETH on Base Network.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Helper to get country flag emoji from code
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default async function Image({ params }: { params: Promise<{ countryId: string }> }) {
  try {
    const { countryId } = await params
    const countryIdUpper = countryId.toUpperCase()

    // Find country data from JSON - support both country code (PT) and name (PORTUGAL)
    const country = countriesData.find(
      (c) => c.code.toUpperCase() === countryIdUpper || c.name.toUpperCase() === countryIdUpper
    )

    if (!country) {
      // Return a default image if country not found
      return new ImageResponse(
        (
          <div
            tw="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: '#0a0f1a',
            }}
          >
            <div tw="flex" style={{ fontSize: 48, color: '#00ff88' }}>
              Country Not Found
            </div>
          </div>
        ),
        { ...size }
      )
    }

    // Fetch country stats from API using the country code (not full name)
    let votes = '0'
    let amount = '0.000'

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.onchainworldcup.xyz'}/api/qualification/countries/${country.code.toLowerCase()}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        votes = data.data.total_votes?.toString() || '0'
        amount = parseFloat(data.data.total_eth || '0').toFixed(3)
      }
    } catch (error) {
      console.error('Failed to fetch country stats:', error)
      // Use default values if API fails
    }

    const countryFlag = country.flagEmoji || getCountryFlag(country.code)
    const countryName = country.name

    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
          }}
        >
          {/* Soccer field pattern background */}
          <div
            tw="absolute inset-0"
            style={{
              opacity: 0.1,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Content */}
          <div tw="flex flex-col items-center justify-center z-10" style={{ padding: 60 }}>
            {/* Flag */}
            <div
              tw="mb-10"
              style={{
                fontSize: 180,
                filter: 'drop-shadow(0 10px 30px rgba(0, 255, 136, 0.3))',
              }}
            >
              {countryFlag}
            </div>

            {/* Country Name */}
            <div
              tw="font-bold mb-5 text-center uppercase"
              style={{
                fontSize: 72,
                color: '#00ff88',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              {countryName}
            </div>

            {/* Subtitle */}
            <div
              tw="uppercase"
              style={{
                fontSize: 32,
                marginBottom: 50,
                color: '#a8b3cf',
                letterSpacing: '0.1em',
              }}
            >
              Qualification Vote
            </div>

            {/* Vote Box */}
            <div
              tw="flex flex-col items-center rounded-xl"
              style={{
                marginBottom: 50,
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '3px solid #00ff88',
                padding: '30px 60px',
              }}
            >
              <div
                tw="font-bold"
                style={{
                  fontSize: 56,
                  marginBottom: 10,
                  color: '#00ff88',
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
              tw="flex text-center font-bold"
              style={{
                fontSize: 32,
                marginBottom: 15,
                color: '#ffffff',
              }}
            >
              🔥 Vote Early = Better Prices!
            </div>

            {/* Branding */}
            <div
              tw="flex font-bold uppercase"
              style={{
                fontSize: 36,
                color: '#00ff88',
                letterSpacing: '0.05em',
              }}
            >
              Onchain World Cup 2026
            </div>
          </div>

          {/* Base Network Badge */}
          <div
            tw="absolute flex items-center rounded-lg"
            style={{
              bottom: 30,
              right: 30,
              gap: 10,
              backgroundColor: 'rgba(0, 82, 255, 0.2)',
              border: '2px solid #0052FF',
              padding: '15px 25px',
            }}
          >
            <div
              tw="rounded-full"
              style={{
                width: 30,
                height: 30,
                backgroundColor: '#0052FF',
              }}
            />
            <div tw="font-bold" style={{ fontSize: 24, color: '#0052FF' }}>
              Base Network
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    // Return error image
    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: '#0a0f1a',
          }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#00ff88' }}>
            Error Generating Image
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
