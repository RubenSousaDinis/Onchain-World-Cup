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
          tw="w-full h-full flex relative"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
            fontFamily: 'Arial Narrow, Helvetica Condensed, Arial, sans-serif',
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
                <div
                  tw="flex items-center justify-center"
                  style={{
                    width: 70,
                    height: 70,
                    background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                    borderRadius: '50%',
                    fontSize: 40,
                  }}
                >
                  ⚽
                </div>
                <div tw="flex flex-col">
                  <div tw="flex font-bold" style={{ fontSize: 28, color: '#d4ff00', letterSpacing: '0.05em' }}>
                    ONCHAIN WORLD CUP
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                    MATCH VOTING
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

            {/* Match Content */}
            <div tw="flex flex-col items-center" style={{ gap: 30 }}>
              {/* Teams */}
              <div tw="flex items-center justify-center" style={{ gap: 50 }}>
                {/* Team 1 */}
                <div tw="flex flex-col items-center">
                  <div
                    tw="flex"
                    style={{
                      fontSize: 90,
                      marginBottom: 18,
                      filter: 'drop-shadow(0 10px 30px rgba(212, 255, 0, 0.3))',
                    }}
                  >
                    {match.team1Flag}
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{ fontSize: 32, marginBottom: 12, color: '#ffffff' }}
                  >
                    {match.team1Name}
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {match.team1Votes.toLocaleString()}
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                    votes ({team1Percentage}%)
                  </div>
                </div>

                {/* VS */}
                <div
                  tw="flex font-bold"
                  style={{ fontSize: 44, color: '#a0a0a0' }}
                >
                  VS
                </div>

                {/* Team 2 */}
                <div tw="flex flex-col items-center">
                  <div
                    tw="flex"
                    style={{
                      fontSize: 90,
                      marginBottom: 18,
                      filter: 'drop-shadow(0 10px 30px rgba(212, 255, 0, 0.3))',
                    }}
                  >
                    {match.team2Flag}
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{ fontSize: 32, marginBottom: 12, color: '#ffffff' }}
                  >
                    {match.team2Name}
                  </div>
                  <div
                    tw="flex font-bold"
                    style={{
                      fontSize: 40,
                      color: '#d4ff00',
                      fontFamily: 'monospace',
                    }}
                  >
                    {match.team2Votes.toLocaleString()}
                  </div>
                  <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                    votes ({team2Percentage}%)
                  </div>
                </div>
              </div>

              {/* Prize Pool */}
              <div
                tw="flex flex-col items-center"
                style={{
                  background: 'rgba(212, 255, 0, 0.1)',
                  border: '2px solid rgba(212, 255, 0, 0.3)',
                  borderRadius: 12,
                  padding: '22px 55px',
                }}
              >
                <div tw="flex" style={{ fontSize: 18, marginBottom: 8, color: '#a0a0a0' }}>
                  Prize Pool
                </div>
                <div
                  tw="flex font-bold"
                  style={{
                    fontSize: 44,
                    color: '#d4ff00',
                    fontFamily: 'monospace',
                  }}
                >
                  {match.totalPool} ETH
                </div>
              </div>
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
                SEE RESULTS
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
            fontFamily: 'Arial Narrow, Helvetica Condensed, Arial, sans-serif',
          }}
        >
          <div tw="flex" style={{ fontSize: 48, color: '#d4ff00' }}>
            Error Generating Image
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}
