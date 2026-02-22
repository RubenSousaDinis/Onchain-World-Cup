"use client"

import { useState } from "react"

interface Audience {
  segment: string
  description: string
  size: string
  channels: string[]
  painPoints: string[]
  messagingHook: string
}

interface ContentPillar {
  pillar: string
  description: string
  rationale: string
}

interface WeeklyContent {
  week: string
  blog: string
  twitter: string
  notes?: string
}

interface PhaseCalendar {
  timeframe: string
  themes: string[]
  weeklyContent: WeeklyContent[]
}

interface Channel {
  channel: string
  priority: string
  strategy: string
  kpis: string[]
}

interface GrowthTactic {
  tactic: string
  description: string
  expectedImpact: string
  effort: string
}

interface KPI {
  metric: string
  target: string
  timeframe: string
}

interface MarketingPlanData {
  executiveSummary: string
  targetAudiences: Audience[]
  contentPillars: ContentPillar[]
  contentCalendar: {
    prelaunch: PhaseCalendar
    launchPhase: PhaseCalendar
    worldCupPhase: PhaseCalendar
  }
  distributionChannels: Channel[]
  growthTactics: GrowthTactic[]
  kpis: KPI[]
  competitiveAdvantages: string[]
}

const EFFORT_COLORS: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-muted-foreground",
}

function PhaseSection({ phase, label }: { phase: PhaseCalendar; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border/20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-[var(--nav-purple)]/20 transition-colors"
      >
        <span>{label} <span className="text-muted-foreground font-normal">— {phase.timeframe}</span></span>
        <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {phase.themes?.map((theme) => (
              <span key={theme} className="text-xs bg-[var(--nav-purple)]/50 px-2 py-0.5 border border-border/20">
                {theme}
              </span>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/20">
                <th className="text-left py-1 pr-3">Week</th>
                <th className="text-left py-1 pr-3">Blog Post</th>
                <th className="text-left py-1 pr-3">Twitter Thread</th>
                <th className="text-left py-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              {phase.weeklyContent?.map((row, i) => (
                <tr key={i} className="border-b border-border/10">
                  <td className="py-2 pr-3 text-xs font-medium whitespace-nowrap">{row.week}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{row.blog}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{row.twitter}</td>
                  <td className="py-2 text-xs text-muted-foreground/60">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function MarketingPlan() {
  const [plan, setPlan] = useState<MarketingPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/content/marketing-plan", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setPlan(data.plan)
      setGeneratedAt(data.generatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <div className="p-6 border border-border/20 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Generate a comprehensive content marketing plan powered by AI. The plan will include target audiences,
            content pillars, a 3-phase content calendar (pre-launch, launch, World Cup), distribution channels,
            growth tactics, and KPIs tailored for Onchain World Cup.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="cm-highlight bg-[var(--nav-purple)] border border-[var(--cm-highlight)] px-6 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-[var(--nav-purple)]/80"
          >
            {loading ? "Generating Marketing Plan..." : "Generate Marketing Plan"}
          </button>
          {loading && (
            <p className="text-xs text-muted-foreground">This may take 20-30 seconds...</p>
          )}
        </div>
        {error && (
          <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold cm-highlight">AI Marketing Plan</h4>
          {generatedAt && (
            <p className="text-xs text-muted-foreground">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs px-3 py-1.5 border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      {/* Executive Summary */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Executive Summary</h5>
        <p className="text-sm text-muted-foreground leading-relaxed">{plan.executiveSummary}</p>
      </div>

      {/* Competitive Advantages */}
      {plan.competitiveAdvantages?.length > 0 && (
        <div className="cm-panel p-4">
          <h5 className="cm-section-header px-3 py-2 mb-3">Competitive Advantages</h5>
          <ul className="space-y-1">
            {plan.competitiveAdvantages.map((adv, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="cm-highlight">▶</span>
                <span className="text-muted-foreground">{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audiences */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Target Audiences</h5>
        <div className="grid gap-4 md:grid-cols-2">
          {plan.targetAudiences?.map((audience, i) => (
            <div key={i} className="border border-border/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm cm-highlight">{audience.segment}</span>
                <span className="text-xs text-muted-foreground">{audience.size}</span>
              </div>
              <p className="text-xs text-muted-foreground">{audience.description}</p>
              <div>
                <p className="text-xs font-medium mb-1">Channels:</p>
                <div className="flex flex-wrap gap-1">
                  {audience.channels?.map((ch) => (
                    <span key={ch} className="text-xs bg-[var(--nav-purple)]/40 px-1.5 py-0.5">{ch}</span>
                  ))}
                </div>
              </div>
              <div className="border-t border-border/10 pt-2">
                <p className="text-xs italic text-muted-foreground">"{audience.messagingHook}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Content Pillars</h5>
        <div className="grid gap-3 md:grid-cols-3">
          {plan.contentPillars?.map((pillar, i) => (
            <div key={i} className="border border-border/20 p-3">
              <span className="font-semibold text-sm cm-highlight block mb-1">{pillar.pillar}</span>
              <p className="text-xs text-muted-foreground mb-2">{pillar.description}</p>
              <p className="text-xs text-muted-foreground/60 italic">{pillar.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Content Calendar</h5>
        <div className="space-y-2">
          {plan.contentCalendar?.prelaunch && (
            <PhaseSection phase={plan.contentCalendar.prelaunch} label="Pre-Launch" />
          )}
          {plan.contentCalendar?.launchPhase && (
            <PhaseSection phase={plan.contentCalendar.launchPhase} label="Launch Phase" />
          )}
          {plan.contentCalendar?.worldCupPhase && (
            <PhaseSection phase={plan.contentCalendar.worldCupPhase} label="World Cup Phase" />
          )}
        </div>
      </div>

      {/* Distribution Channels */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Distribution Channels</h5>
        <div className="space-y-3">
          {plan.distributionChannels?.map((channel, i) => (
            <div key={i} className="border border-border/20 p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-sm">{channel.channel}</span>
                <span className={`text-xs font-medium ${PRIORITY_COLORS[channel.priority] ?? ""}`}>
                  {channel.priority?.toUpperCase()} PRIORITY
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{channel.strategy}</p>
              <div className="flex gap-2 flex-wrap">
                {channel.kpis?.map((kpi) => (
                  <span key={kpi} className="text-xs bg-[var(--nav-purple)]/30 px-1.5 py-0.5 text-muted-foreground">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Tactics */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Growth Tactics</h5>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border/20">
                <th className="px-3 py-2">Tactic</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Expected Impact</th>
                <th className="px-3 py-2">Effort</th>
              </tr>
            </thead>
            <tbody>
              {plan.growthTactics?.map((tactic, i) => (
                <tr key={i} className="border-b border-border/10">
                  <td className="px-3 py-2 text-sm font-medium">{tactic.tactic}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs">{tactic.description}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{tactic.expectedImpact}</td>
                  <td className={`px-3 py-2 text-xs font-medium ${EFFORT_COLORS[tactic.effort] ?? ""}`}>
                    {tactic.effort}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPIs */}
      <div className="cm-panel p-4">
        <h5 className="cm-section-header px-3 py-2 mb-3">Key Performance Indicators</h5>
        <div className="grid gap-3 md:grid-cols-3">
          {plan.kpis?.map((kpi, i) => (
            <div key={i} className="border border-border/20 p-3">
              <span className="text-xs text-muted-foreground block">{kpi.metric}</span>
              <span className="text-lg font-bold cm-highlight block">{kpi.target}</span>
              <span className="text-xs text-muted-foreground">{kpi.timeframe}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
