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
  // Fetch Barlow Condensed font
  const fontData = await fetch(
    new URL('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&display=swap')
  ).then((res) => res.arrayBuffer())

  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`

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
              fontFamily: 'Barlow Condensed, sans-serif',
            }}
          >
            <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
              Country Not Found
            </div>
          </div>
        ),
        {
          ...size,
          fonts: [
            {
              name: 'Barlow Condensed',
              data: fontData,
              weight: 700,
              style: 'normal',
            },
          ],
        }
      )
    }

    // Fetch country stats from API using the country code (not full name)
    let votes = 0
    let amount = '0.000'
    let rank = 0

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.onchainworldcup.xyz'}/api/qualification/countries/${country.code.toLowerCase()}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        votes = data.data.total_votes || 0
        amount = parseFloat(data.data.total_eth || '0').toFixed(3)
        rank = data.data.rank || 0
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
          tw="w-full h-full flex relative"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
            fontFamily: 'Barlow Condensed, sans-serif',
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
                  src={logoUrl}
                  width="70"
                  height="70"
                  alt="Logo"
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

            {/* Country Content */}
            <div tw="flex flex-col items-center" style={{ gap: 25 }}>
              {/* Flag */}
              <div
                tw="flex"
                style={{
                  fontSize: 120,
                  marginTop: 20,
                  marginBottom: 20,
                  filter: 'drop-shadow(0 10px 30px rgba(212, 255, 0, 0.3))',
                }}
              >
                {countryFlag}
              </div>

              {/* Country Name */}
              <div
                tw="flex font-bold text-center uppercase"
                style={{
                  fontSize: 56,
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                }}
              >
                {countryName}
              </div>

              {/* Stats Grid */}
              <div tw="flex items-center" style={{ gap: 30 }}>
                {/* Rank */}
                {rank > 0 && (
                  <div
                    tw="flex flex-col items-center"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: 12,
                      padding: '20px 30px',
                    }}
                  >
                    <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                      Rank
                    </div>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 40,
                        color: '#FFD700',
                        fontFamily: 'monospace',
                      }}
                    >
                      #{rank}
                    </div>
                  </div>
                )}

                {/* Votes */}
                <div
                  tw="flex flex-col items-center"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '20px 30px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                    Total Votes
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {votes.toLocaleString()}
                  </div>
                </div>

                {/* ETH */}
                <div
                  tw="flex flex-col items-center"
                  style={{
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '2px solid rgba(212, 255, 0, 0.3)',
                    borderRadius: 12,
                    padding: '20px 30px',
                  }}
                >
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', marginBottom: 8 }}>
                    Total ETH
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {amount}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div tw="flex items-center justify-between" style={{ marginTop: 20 }}>
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
        fonts: [
          {
            name: 'Barlow Condensed',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
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
            fontFamily: 'Barlow Condensed, sans-serif',
          }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
            Error Generating Image
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Barlow Condensed',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    )
  }
}
