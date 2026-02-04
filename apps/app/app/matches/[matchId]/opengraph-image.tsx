import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Match Details - Onchain World Cup 2026'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params

    // For now, use placeholder data since matches are not yet live
    // In the future, fetch from /api/matches/[id]
    const match = {
      team1Name: 'Team 1',
      team1Flag: '🏳️',
      team1Votes: 0,
      team2Name: 'Team 2',
      team2Flag: '🏳️',
      team2Votes: 0,
      totalPool: '0.00',
    }

    /*
    // Uncomment when matches API is ready:
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.onchainworldcup.xyz'}/api/matches/${matchId}`,
        { next: { revalidate: 60 } } // Cache for 1 minute
      )

      if (response.ok) {
        const data = await response.json()
        match = {
          team1Name: data.team1_name,
          team1Flag: data.team1_flag,
          team1Votes: data.team1_votes,
          team2Name: data.team2_name,
          team2Flag: data.team2_flag,
          team2Votes: data.team2_votes,
          totalPool: data.total_pool,
        }
      }
    } catch (error) {
      console.error('Failed to fetch match data:', error)
    }
    */

    const totalVotes = match.team1Votes + match.team2Votes
    const team1Percentage = totalVotes > 0 ? ((match.team1Votes / totalVotes) * 100).toFixed(1) : '0'
    const team2Percentage = totalVotes > 0 ? ((match.team2Votes / totalVotes) * 100).toFixed(1) : '0'

    return new ImageResponse(
      (
        <div
          tw="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            padding: 60,
            backgroundColor: '#0a0f1a',
            backgroundImage: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
          }}
        >
          {/* Soccer field pattern background */}
          <div
            tw="flex absolute inset-0"
            style={{
              opacity: 0.1,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #00ff88 50px, #00ff88 51px)`,
            }}
          />

          {/* Content */}
          <div tw="flex flex-col items-center z-10">
            {/* Title */}
            <div
              tw="flex font-bold uppercase"
              style={{
                fontSize: 48,
                marginBottom: 50,
                color: '#00ff88',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              }}
            >
              ⚽ MATCH PREVIEW
            </div>

            {/* Teams */}
            <div tw="flex items-center justify-center" style={{ gap: 60, marginBottom: 50 }}>
              {/* Team 1 */}
              <div tw="flex flex-col items-center">
                <div
                  tw="flex mb-5"
                  style={{
                    fontSize: 120,
                    filter: 'drop-shadow(0 10px 30px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {match.team1Flag}
                </div>
                <div
                  tw="flex font-bold"
                  style={{ fontSize: 48, marginBottom: 15, color: '#00ff88' }}
                >
                  {match.team1Name}
                </div>
                <div
                  tw="flex font-bold"
                  style={{
                    fontSize: 56,
                    color: '#ffffff',
                    fontFamily: 'monospace',
                  }}
                >
                  {match.team1Votes}
                </div>
                <div tw="flex" style={{ fontSize: 24, color: '#a8b3cf' }}>
                  votes ({team1Percentage}%)
                </div>
              </div>

              {/* VS */}
              <div
                tw="flex font-bold"
                style={{ fontSize: 64, color: '#a8b3cf' }}
              >
                VS
              </div>

              {/* Team 2 */}
              <div tw="flex flex-col items-center">
                <div
                  tw="flex mb-5"
                  style={{
                    fontSize: 120,
                    filter: 'drop-shadow(0 10px 30px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {match.team2Flag}
                </div>
                <div
                  tw="flex font-bold"
                  style={{ fontSize: 48, marginBottom: 15, color: '#00ff88' }}
                >
                  {match.team2Name}
                </div>
                <div
                  tw="flex font-bold"
                  style={{
                    fontSize: 56,
                    color: '#ffffff',
                    fontFamily: 'monospace',
                  }}
                >
                  {match.team2Votes}
                </div>
                <div tw="flex" style={{ fontSize: 24, color: '#a8b3cf' }}>
                  votes ({team2Percentage}%)
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div
              tw="flex flex-col items-center rounded-xl mb-10"
              style={{
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '3px solid #00ff88',
                padding: '30px 80px',
              }}
            >
              <div
                tw="flex uppercase"
                style={{ fontSize: 28, marginBottom: 10, color: '#a8b3cf' }}
              >
                🏆 Prize Pool
              </div>
              <div
                tw="flex font-bold"
                style={{
                  fontSize: 64,
                  color: '#00ff88',
                  fontFamily: 'monospace',
                }}
              >
                {match.totalPool} ETH
              </div>
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
              tw="flex rounded-full"
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
