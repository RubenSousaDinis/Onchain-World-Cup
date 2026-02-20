import { ImageResponse } from 'next/og'
import { getBaseUrl } from '@/lib/utils/og-image'
import {
  OG_IMAGE_SIZE,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_FONT_FAMILY,
  OG_IMAGE_LOGO,
} from '@/lib/constants'

export const runtime = 'edge'
export const alt = 'Onchain World Cup 2026 Leaderboard — Top supporters ranked by votes and ETH spent on Base.'
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function displayName(voter: { wallet_address: string; ens_name?: string | null; farcaster_name?: string | null }): string {
  if (voter.ens_name) return voter.ens_name
  if (voter.farcaster_name) return voter.farcaster_name
  return truncateAddress(voter.wallet_address)
}

export default async function Image() {
  try {
    const baseUrl = getBaseUrl()

    let topVoters: Array<{
      rank: number
      name: string
      votes: number
      eth: string
    }> = []

    try {
      const res = await fetch(`${baseUrl}/api/qualification/leaderboard?limit=3`, {
        next: { revalidate: 300 },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          topVoters = json.data.map((user: any) => ({
            rank: user.rank,
            name: displayName(user),
            votes: user.qualification_votes || 0,
            eth: parseFloat(user.qualification_spent_eth || '0').toFixed(4),
          }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }

    if (topVoters.length === 0) {
      topVoters = [
        { rank: 1, name: '0x1234…5678', votes: 0, eth: '0.0000' },
        { rank: 2, name: '0xabcd…ef01', votes: 0, eth: '0.0000' },
        { rank: 3, name: '0x9876…4321', votes: 0, eth: '0.0000' },
      ]
    }

    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']

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

          <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '36px 48px 40px' }}>
            {/* Header */}
            <div tw="flex items-center justify-between w-full flex-shrink-0">
              <div tw="flex items-center" style={{ gap: 16 }}>
                <img
                  src={`${baseUrl}/logo.jpg`}
                  width={OG_IMAGE_LOGO.SMALL.width}
                  height={OG_IMAGE_LOGO.SMALL.height}
                  style={{ objectFit: 'contain' }}
                />
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 24, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 15, color: '#a0a0a0' }}>
                    TOP SUPPORTERS
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

            {/* Rows */}
            <div tw="flex flex-col flex-1 min-h-0" style={{ gap: 10, marginTop: 20, marginBottom: 20 }}>
              {topVoters.map((voter) => (
                <div
                  key={voter.rank}
                  tw="flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 255, 0, 0.2)',
                    borderRadius: 8,
                    padding: '14px 24px',
                  }}
                >
                  <div tw="flex items-center" style={{ gap: 20 }}>
                    <div
                      tw="flex font-bold"
                      style={{
                        fontSize: 28,
                        width: 40,
                        color: rankColors[voter.rank - 1] ?? '#d4ff00',
                        fontFamily: 'monospace',
                      }}
                    >
                      {voter.rank}
                    </div>
                    <div tw="flex font-bold" style={{ fontSize: 22, color: '#ffffff', fontFamily: 'monospace' }}>
                      {voter.name}
                    </div>
                  </div>

                  <div tw="flex flex-col items-end">
                    <div tw="flex font-bold" style={{ fontSize: 22, color: '#d4ff00', fontFamily: 'monospace' }}>
                      {voter.votes.toLocaleString()} votes
                    </div>
                    <div tw="flex" style={{ fontSize: 16, color: '#a0a0a0', fontFamily: 'monospace' }}>
                      {voter.eth} ETH
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div tw="flex items-center justify-between flex-shrink-0">
              <div
                tw="flex items-center justify-center font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                  color: '#0a0f1a',
                  padding: '16px 40px',
                  borderRadius: 8,
                  fontSize: 28,
                  boxShadow: '0 8px 32px rgba(212, 255, 0, 0.3)',
                }}
              >
                VIEW LEADERBOARD
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
            Onchain World Cup — Leaderboard
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
