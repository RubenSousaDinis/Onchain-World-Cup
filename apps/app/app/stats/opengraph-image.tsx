import { ImageResponse } from 'next/og'
import { getBaseUrl } from '@/lib/utils/og-image'
import {
  OG_IMAGE_SIZE,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_FONT_FAMILY,
  OG_IMAGE_LOGO,
} from '@/lib/constants'

export const runtime = 'edge'
export const alt = 'Onchain World Cup 2026 Live Statistics — Total votes, ETH raised, and countries competing on Base.'
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

const QUALIFICATION_END = new Date(1772060445 * 1000)

function timeLeft(): string {
  const diff = QUALIFICATION_END.getTime() - Date.now()
  if (diff <= 0) return 'ENDED'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days >= 1) return `${days}d ${hours}h`
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export default async function Image() {
  try {
    const baseUrl = getBaseUrl()

    let stats = {
      totalVotes: 0,
      totalEth: '0.0000',
      totalVoters: 0,
    }

    try {
      const res = await fetch(`${baseUrl}/api/qualification/summary`, {
        next: { revalidate: 300 },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          stats = {
            totalVotes: json.data.total_votes || 0,
            totalEth: parseFloat(json.data.total_eth || '0').toFixed(4),
            totalVoters: json.data.total_voters || 0,
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }

    const statItems = [
      { label: 'TOTAL VOTES', value: stats.totalVotes.toLocaleString(), highlight: true },
      { label: 'ETH RAISED', value: `${stats.totalEth} ETH`, highlight: false },
      { label: 'VOTERS', value: stats.totalVoters.toLocaleString(), highlight: false },
      { label: 'TIME LEFT', value: timeLeft(), highlight: false },
    ]

    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex relative"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
            fontFamily: OG_IMAGE_FONT_FAMILY,
          }}
        >
          <div
            tw="absolute inset-0 flex"
            style={{
              backgroundImage: 'linear-gradient(rgba(212, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 255, 0, 0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '48px 60px' }}>
            {/* Header */}
            <div tw="flex items-center justify-between w-full">
              <div tw="flex items-center" style={{ gap: 20 }}>
                <img
                  src={`${baseUrl}/logo.jpg`}
                  width={OG_IMAGE_LOGO.LARGE.width}
                  height={OG_IMAGE_LOGO.LARGE.height}
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 28, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                    LIVE STATISTICS
                  </div>
                </div>
              </div>

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
                <div tw="flex rounded-full" style={{ width: 24, height: 24, background: '#0052FF' }} />
                <div tw="flex font-bold" style={{ fontSize: 16, color: '#0052FF' }}>BASE</div>
              </div>
            </div>

            {/* Title */}
            <div tw="flex font-bold" style={{ fontSize: 58, color: '#ffffff', lineHeight: 1.1 }}>
              Live Onchain Data
            </div>

            {/* Stats grid */}
            <div tw="flex" style={{ gap: 20 }}>
              {statItems.map((item) => (
                <div
                  key={item.label}
                  tw="flex flex-col flex-1"
                  style={{
                    background: item.highlight ? 'rgba(212, 255, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${item.highlight ? 'rgba(212, 255, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: 10,
                    padding: '20px 24px',
                    gap: 8,
                  }}
                >
                  <div tw="flex" style={{ fontSize: 13, color: '#666', letterSpacing: '0.08em' }}>
                    {item.label}
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 26,
                      color: item.highlight ? '#d4ff00' : '#ffffff',
                      fontFamily: 'monospace',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
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
                VIEW STATS
              </div>
              <div tw="flex" style={{ fontSize: 20, color: '#666', fontFamily: 'monospace' }}>
                app.onchainworldcup.xyz
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: '#0a0f1a', fontFamily: OG_IMAGE_FONT_FAMILY }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
            Onchain World Cup — Live Stats
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
