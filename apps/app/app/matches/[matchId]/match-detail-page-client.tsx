"use client"

import { useEffect, useState } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Clock, Trophy, Share2, Users } from "lucide-react"
import Link from "next/link"
import { InlineLoader } from "@/components/states"
import { ShareModal } from "@/components/share-modal"
import countriesData from "@/data/countries.json"

// ─── Types ────────────────────────────────────────────────────────────────────

type Team = { code: string; name: string; flag_emoji: string }

type MatchData = {
  id: string
  team1: Team
  team2: Team
  contract_address: string
  match_start_time: string
  voting_end_time: string
  match_end_time: string
  status: string
  match_type: string
  winning_team: number | null
  team1_score: number | null
  team2_score: number | null
  team1_votes: number
  team2_votes: number
  recent_votes: {
    id: string
    voter_address: string
    team_index: number
    vote_count: number
    total_cost_eth: string
    tx_hash: string
    created_at: string
  }[]
}

type WCFixtureMatch = {
  round: string
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
}

type ApiMatch = {
  id: string
  team1: { code: string; name: string }
  team2: { code: string; name: string }
  status: string
  team1_score: number | null
  team2_score: number | null
  match_type: string
}

type Standing = {
  code: string
  name: string
  flag: string
  p: number; w: number; d: number; l: number
  gf: number; ga: number; pts: number
}

// ─── Country helpers ───────────────────────────────────────────────────────────

const codeToCountry = new Map(countriesData.map(c => [c.code, c]))

// Openfootball names that differ from our canonical names (data/countries.json)
const FIXTURE_NAME_ALIASES: Record<string, string> = {
  "usa":                  "united states",
  "bosnia & herzegovina": "bosnia and herzegovina",
}

// Reverse: canonical name (lower) → openfootball fixture name
const CANONICAL_TO_FIXTURE: Record<string, string> = {
  "united states":         "USA",
  "bosnia and herzegovina":"Bosnia & Herzegovina",
}

function fixtureNameForCode(code: string): string {
  const canonical = codeToCountry.get(code)?.name ?? code
  return CANONICAL_TO_FIXTURE[canonical.toLowerCase()] ?? canonical
}

function codeFromFixtureName(fixtureName: string): string | null {
  const canonical = FIXTURE_NAME_ALIASES[fixtureName.toLowerCase()] ?? fixtureName.toLowerCase()
  const entry = countriesData.find(c => c.name.toLowerCase() === canonical)
  return entry?.code ?? null
}

// ─── Group standings computation ───────────────────────────────────────────────

function computeGroupStandings(
  groupTeamCodes: string[],
  allRealMatches: ApiMatch[]
): Standing[] {
  const standings = new Map<string, Standing>(
    groupTeamCodes.map(code => {
      const c = codeToCountry.get(code)
      return [code, { code, name: c?.name ?? code, flag: c?.flagEmoji ?? '🏳️', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]
    })
  )

  const groupSet = new Set(groupTeamCodes)
  for (const m of allRealMatches) {
    if (m.status !== 'completed') continue
    if (m.team1_score === null || m.team2_score === null) continue
    if (!groupSet.has(m.team1.code) || !groupSet.has(m.team2.code)) continue

    const s1 = standings.get(m.team1.code)!
    const s2 = standings.get(m.team2.code)!
    s1.p++; s2.p++
    s1.gf += m.team1_score; s1.ga += m.team2_score
    s2.gf += m.team2_score; s2.ga += m.team1_score

    if (m.team1_score > m.team2_score) {
      s1.w++; s1.pts += 3; s2.l++
    } else if (m.team1_score < m.team2_score) {
      s2.w++; s2.pts += 3; s1.l++
    } else {
      s1.d++; s1.pts++; s2.d++; s2.pts++
    }
  }

  return Array.from(standings.values()).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  )
}

// ─── GroupStandings component ─────────────────────────────────────────────────

function GroupStandings({
  groupName,
  standings,
  currentTeam1Code,
  currentTeam2Code,
}: {
  groupName: string
  standings: Standing[]
  currentTeam1Code: string
  currentTeam2Code: string
}) {
  return (
    <div className="cm-panel rounded-sm overflow-hidden">
      <div className="bg-accent/20 border-b-2 border-accent/30 px-4 py-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-accent" />
        <h3 className="font-bold cm-highlight">{groupName} Standings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/20 text-xs">
            <tr>
              <th className="text-left px-4 py-2 text-muted-foreground font-bold uppercase">Team</th>
              <th className="text-center px-2 py-2 text-muted-foreground font-bold uppercase">P</th>
              <th className="text-center px-2 py-2 text-muted-foreground font-bold uppercase">W</th>
              <th className="text-center px-2 py-2 text-muted-foreground font-bold uppercase">D</th>
              <th className="text-center px-2 py-2 text-muted-foreground font-bold uppercase">L</th>
              <th className="text-center px-2 py-2 text-muted-foreground font-bold uppercase">GD</th>
              <th className="text-center px-3 py-2 text-muted-foreground font-bold uppercase">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const isCurrentMatch = s.code === currentTeam1Code || s.code === currentTeam2Code
              return (
                <tr
                  key={s.code}
                  className={`border-t border-border ${isCurrentMatch ? 'bg-accent/10' : 'hover:bg-secondary/20'} transition-colors`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs w-4">{i + 1}</span>
                      <span className="text-base">{s.flag}</span>
                      <Link
                        href={`/qualification/${s.code.toLowerCase()}`}
                        className={`font-bold hover:text-accent transition-colors text-sm ${isCurrentMatch ? 'cm-highlight' : ''}`}
                      >
                        {s.name}
                      </Link>
                    </div>
                  </td>
                  <td className="text-center px-2 py-2.5 font-mono text-sm">{s.p}</td>
                  <td className="text-center px-2 py-2.5 font-mono text-sm">{s.w}</td>
                  <td className="text-center px-2 py-2.5 font-mono text-sm">{s.d}</td>
                  <td className="text-center px-2 py-2.5 font-mono text-sm">{s.l}</td>
                  <td className="text-center px-2 py-2.5 font-mono text-sm">
                    {s.gf - s.ga > 0 ? `+${s.gf - s.ga}` : s.gf - s.ga}
                  </td>
                  <td className="text-center px-3 py-2.5 font-bold cm-highlight">{s.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    function calc() {
      const diff = +target - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [target])

  return timeLeft
}

function MatchCountdown({ matchStart }: { matchStart: string }) {
  const timeLeft = useCountdown(new Date(matchStart))

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-sm">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-xs cm-highlight font-bold uppercase">Match Started</span>
      </div>
    )
  }

  const parts = timeLeft.days > 0
    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
    : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-sm">
      <Clock className="w-4 h-4 text-accent" />
      <span className="text-xs font-mono cm-highlight font-bold">{parts}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MatchDetailPageClient({ matchId }: { matchId: string }) {
  const [match, setMatch] = useState<MatchData | null>(null)
  const [groupName, setGroupName] = useState<string | null>(null)
  const [groupStandings, setGroupStandings] = useState<Standing[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/matches/${matchId}`).then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<MatchData>
      }),
      fetch('/data/worldcup-2026.json').then(r => r.ok ? r.json() : null),
      fetch('/api/matches?type=real&limit=200').then(r => r.ok ? r.json() : { data: [] }),
    ])
      .then(([matchData, fixture, allMatchesResp]) => {
        if (!matchData) { setIsLoading(false); return }

        setMatch(matchData)

        // Find group from fixture JSON
        if (fixture && matchData.match_type === 'real') {
          const t1Fixture = fixtureNameForCode(matchData.team1.code)
          const t2Fixture = fixtureNameForCode(matchData.team2.code)
          const fixtureMatch = fixture.matches?.find((m: WCFixtureMatch) =>
            m.group && (
              (m.team1 === t1Fixture && m.team2 === t2Fixture) ||
              (m.team1 === t2Fixture && m.team2 === t1Fixture)
            )
          )

          if (fixtureMatch?.group) {
            setGroupName(fixtureMatch.group)

            // Collect all team names in this group
            const groupFixtureNames = new Set<string>()
            for (const m of fixture.matches as WCFixtureMatch[]) {
              if (m.group === fixtureMatch.group) {
                groupFixtureNames.add(m.team1)
                groupFixtureNames.add(m.team2)
              }
            }
            const groupTeamCodes = Array.from(groupFixtureNames)
              .map(codeFromFixtureName)
              .filter((c): c is string => c !== null)

            const standings = computeGroupStandings(groupTeamCodes, allMatchesResp.data ?? [])
            setGroupStandings(standings)
          }
        }

        setIsLoading(false)
      })
      .catch(() => { setNotFound(true); setIsLoading(false) })
  }, [matchId])

  const isUpcoming  = match?.status === 'upcoming'
  const isCompleted = match?.status === 'completed'
  const totalVotes  = (match?.team1_votes ?? 0) + (match?.team2_votes ?? 0)
  const team1Pct    = totalVotes > 0 ? ((match?.team1_votes ?? 0) / totalVotes) * 100 : 50
  const team2Pct    = totalVotes > 0 ? ((match?.team2_votes ?? 0) / totalVotes) * 100 : 50

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 min-w-0 lg:ml-24 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="p-4 lg:p-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm lg:text-base leading-tight pb-1.5 lg:pb-3">
            <Link href="/tournament" className="text-accent hover:text-accent/80 transition-colors flex-shrink-0 inline-flex items-center py-0.5 leading-tight">
              Tournament
            </Link>
            <span aria-hidden="true" className="text-muted-foreground flex-shrink-0 leading-tight">›</span>
            <span aria-current="page" className="text-foreground font-medium truncate min-w-0 leading-tight">
              {match ? `${match.team1.name} vs ${match.team2.name}` : 'Match'}
            </span>
          </nav>

          {isLoading && (
            <div className="cm-panel rounded-sm p-12 text-center">
              <InlineLoader text="Loading match..." />
            </div>
          )}

          {notFound && (
            <div className="cm-panel rounded-sm p-12 text-center">
              <p className="text-muted-foreground font-bold">Match not found.</p>
            </div>
          )}

          {match && (
            <div className="space-y-4 lg:space-y-6">
              {/* Match card */}
              <div className="cm-panel rounded-sm overflow-hidden">
                <div className="soccer-field-bg p-4 lg:p-6">
                  {/* Status row */}
                  <div className="flex items-center justify-between mb-4">
                    {isUpcoming
                      ? <MatchCountdown matchStart={match.match_start_time} />
                      : (
                        <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-sm">
                          <span className={`text-xs font-bold uppercase ${isCompleted ? 'text-green-400' : 'cm-highlight'}`}>
                            {match.status}
                          </span>
                        </div>
                      )
                    }
                    <div className="text-xs text-foreground/60 bg-card/90 px-3 py-1.5 rounded-sm">
                      {new Date(match.match_start_time).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-center gap-4 lg:gap-8 mb-4">
                    <div className="flex-1 text-center">
                      <div className="text-5xl lg:text-7xl mb-2">{match.team1.flag_emoji}</div>
                      <div className="text-lg lg:text-2xl font-bold text-foreground mb-1">{match.team1.name}</div>
                      {isCompleted && match.team1_score !== null ? (
                        <div className="text-4xl lg:text-6xl font-bold cm-highlight">{match.team1_score}</div>
                      ) : totalVotes > 0 ? (
                        <>
                          <div className="text-4xl lg:text-6xl font-bold cm-highlight">{match.team1_votes}</div>
                          <div className="text-xs text-muted-foreground mt-1">votes</div>
                        </>
                      ) : null}
                      {isCompleted && match.winning_team === 0 && (
                        <div className="mt-1 flex justify-center">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                      )}
                    </div>

                    <div className="text-2xl lg:text-4xl text-muted-foreground font-bold flex-shrink-0">
                      {isCompleted && match.team1_score !== null && match.team2_score !== null ? '-' : 'VS'}
                    </div>

                    <div className="flex-1 text-center">
                      <div className="text-5xl lg:text-7xl mb-2">{match.team2.flag_emoji}</div>
                      <div className="text-lg lg:text-2xl font-bold text-foreground mb-1">{match.team2.name}</div>
                      {isCompleted && match.team2_score !== null ? (
                        <div className="text-4xl lg:text-6xl font-bold cm-highlight">{match.team2_score}</div>
                      ) : totalVotes > 0 ? (
                        <>
                          <div className="text-4xl lg:text-6xl font-bold cm-highlight">{match.team2_votes}</div>
                          <div className="text-xs text-muted-foreground mt-1">votes</div>
                        </>
                      ) : null}
                      {isCompleted && match.winning_team === 1 && (
                        <div className="mt-1 flex justify-center">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vote distribution bar */}
                  {totalVotes > 0 && (
                    <div className="bg-card/90 rounded-sm p-4 mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-foreground font-bold">{team1Pct.toFixed(1)}%</span>
                        <span className="text-muted-foreground">Vote Distribution</span>
                        <span className="text-foreground font-bold">{team2Pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                        <div className="bg-primary transition-all duration-500" style={{ width: `${team1Pct}%` }} />
                        <div className="bg-accent transition-all duration-500" style={{ width: `${team2Pct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Upcoming, no votes */}
                  {isUpcoming && totalVotes === 0 && (
                    <div className="bg-card/90 rounded-sm p-4 text-center">
                      <p className="text-sm text-muted-foreground">Voting opens when the match starts.</p>
                    </div>
                  )}
                </div>

                {totalVotes > 0 && (
                  <div className="bg-secondary/30 px-4 py-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Total votes: <span className="cm-highlight font-bold">{totalVotes}</span>
                    </span>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Group standings */}
              {groupName && groupStandings && (
                <GroupStandings
                  groupName={groupName}
                  standings={groupStandings}
                  currentTeam1Code={match.team1.code}
                  currentTeam2Code={match.team2.code}
                />
              )}

              {/* Recent votes */}
              <div className="cm-panel rounded-sm overflow-hidden">
                <div className="bg-secondary/40 px-4 py-3 border-b border-border flex items-center gap-2">
                  <h3 className="text-sm font-bold cm-highlight uppercase">Latest Votes</h3>
                </div>

                {match.recent_votes.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <Users className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No votes yet.</p>
                    {isUpcoming && (
                      <p className="text-xs text-muted-foreground/70">Be the first to vote when the match starts.</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {match.recent_votes.map(vote => (
                      <div key={vote.id} className="p-3 lg:p-4 flex items-center justify-between gap-4">
                        <Link href={`/users/${vote.voter_address}`} className="text-accent hover:text-accent/80 font-mono text-xs truncate">
                          {vote.voter_address.slice(0, 6)}…{vote.voter_address.slice(-4)}
                        </Link>
                        <span className={`font-bold text-sm flex-shrink-0 ${vote.team_index === 0 ? 'text-primary' : 'text-accent'}`}>
                          {vote.team_index === 0 ? match.team1.name : match.team2.name}
                        </span>
                        <span className="text-sm font-bold cm-highlight flex-shrink-0">{vote.vote_count} votes</span>
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                          {parseFloat(vote.total_cost_eth).toFixed(4)} ETH
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {match && showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          type="prize-pool"
          data={{
            prizePool: {
              totalPool: '0',
              team1Name: match.team1.name,
              team1Flag: match.team1.flag_emoji,
              team1Pool: '0',
              team1Votes: match.team1_votes,
              team2Name: match.team2.name,
              team2Flag: match.team2.flag_emoji,
              team2Pool: '0',
              team2Votes: match.team2_votes,
              matchId,
            },
          }}
        />
      )}
    </div>
  )
}
