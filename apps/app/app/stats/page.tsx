"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Users, TrendingUp, Target, DollarSign, Activity, BarChart3, PieChart } from "lucide-react"
import {
  platformStats,
  ethOverTime,
  votesPerDay,
  topCountriesByVotes,
  phaseDistribution,
  activityByHour,
  type ChartDataPoint,
} from "@/lib/mock-data/statistics-data"
import { StatCard } from "@/components/dashboard"

export default function StatsPage() {
  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Platform Statistics</span>
            </h1>
            <p className="text-sm lg:text-base text-foreground/80">
              Real-time metrics and analytics • Base Network
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard
            icon={DollarSign}
            label="Total ETH in Pools"
            value={`${platformStats.totalETHInPools} ETH`}
            valueColor="accent"
          />
          <StatCard
            icon={TrendingUp}
            label="Total ETH Wagered"
            value={`${platformStats.totalETHWagered} ETH`}
            valueColor="green"
          />
          <StatCard icon={Target} label="Total Votes" value={platformStats.totalVotesCast} formatValue valueColor="default" />
          <StatCard icon={Trophy} label="Matches Created" value={platformStats.matchesCreated} formatValue />
          <StatCard icon={Users} label="Unique Voters" value={platformStats.uniqueVoters} formatValue />
          <StatCard icon={Activity} label="Avg Vote Size" value={`${platformStats.averageVoteSize} ETH`} />
          <StatCard
            icon={BarChart3}
            label="Phase 1 Votes"
            value={`${platformStats.phase1VotesPercent}%`}
            valueColor="green"
          />
          <StatCard
            icon={PieChart}
            label="Phase 2 Votes"
            value={`${platformStats.phase2VotesPercent}%`}
            valueColor="accent"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ETH Over Time */}
          <ChartCard title="ETH Wagered Over Time" subtitle="Last 7 days" icon={TrendingUp}>
            <AreaChart data={ethOverTime} height={200} color="accent" />
          </ChartCard>

          {/* Votes Per Day */}
          <ChartCard title="Votes Per Day" subtitle="Last 7 days" icon={Target}>
            <BarChartComponent data={votesPerDay} height={200} color="green" />
          </ChartCard>

          {/* Top Countries */}
          <ChartCard title="Top Countries by Votes" subtitle="Leading the qualification" icon={Trophy}>
            <HorizontalBarChart data={topCountriesByVotes.slice(0, 5)} height={250} />
          </ChartCard>

          {/* Phase Distribution */}
          <ChartCard title="Vote Distribution by Phase" subtitle="Pricing model breakdown" icon={PieChart}>
            <div className="space-y-4">
              {phaseDistribution.map((phase) => (
                <div key={phase.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm lg:text-base font-bold text-foreground">{phase.label}</span>
                    <span className="text-sm lg:text-base font-mono font-bold cm-highlight">{phase.value}%</span>
                  </div>
                  <div className="w-full h-8 bg-secondary/20 rounded-sm overflow-hidden border border-border">
                    <div
                      className={`h-full ${phase.color} transition-all duration-500`}
                      style={{ width: `${phase.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Activity by Hour */}
          <div className="lg:col-span-2">
            <ChartCard title="Platform Activity by Hour" subtitle="24-hour voting pattern" icon={Activity}>
              <LineChart data={activityByHour} height={200} />
            </ChartCard>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">Voting Insights</h3>
            </div>
            <div className="space-y-3">
              <StatRow label="Most Voted Country" value="🇧🇷 Brazil" valueClass="cm-highlight" />
              <StatRow label="Avg Votes per Match" value="312" valueClass="text-accent" />
              <StatRow label="Peak Hour" value="18:00 UTC" valueClass="text-green-500" />
            </div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-accent" />
              <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">Financial Metrics</h3>
            </div>
            <div className="space-y-3">
              <StatRow label="Largest Single Vote" value="12.5 ETH" valueClass="cm-highlight" />
              <StatRow label="Prize Pool Growth" value="+45%" valueClass="text-green-500" />
              <StatRow label="Platform Fee Collected" value="34.25 ETH" valueClass="text-accent" />
            </div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">User Engagement</h3>
            </div>
            <div className="space-y-3">
              <StatRow label="Avg Votes per User" value="39" valueClass="cm-highlight" />
              <StatRow label="Returning Users" value="78%" valueClass="text-green-500" />
              <StatRow label="New Users Today" value="89" valueClass="text-accent" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Chart Card Wrapper Component
function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string
  subtitle?: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <div className="cm-panel rounded-sm overflow-hidden">
      <div className="bg-secondary/40 px-4 py-3 border-b-2 border-border">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-accent" />
          <div>
            <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-4 lg:p-6">{children}</div>
    </div>
  )
}

// Simple Area Chart Component
function AreaChart({ data, height, color }: { data: ChartDataPoint[]; height: number; color?: string }) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const colorClass = color === "accent" ? "bg-accent" : "bg-green-500"

  return (
    <div>
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                <div
                  className={`w-full ${colorClass} opacity-20 rounded-t-sm transition-all duration-300`}
                  style={{ height: `${(point.value / maxValue) * height}px` }}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 ${colorClass} rounded-t-sm transition-all duration-300 group-hover:opacity-100 opacity-70`}
                  style={{ height: `${(point.value / maxValue) * height * 0.7}px` }}
                />
              </div>
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded px-2 py-1 text-xs font-bold whitespace-nowrap pointer-events-none z-10">
                {point.displayValue || point.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((point, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs text-muted-foreground">{point.label}</div>
          </div>
        ))}
      </div>
      {/* Y-axis label */}
      <div className="text-xs text-muted-foreground text-center mt-2">
        Cumulative ETH wagered
      </div>
    </div>
  )
}

// Simple Bar Chart Component
function BarChartComponent({ data, height, color }: { data: ChartDataPoint[]; height: number; color?: string }) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const colorClass = color === "green" ? "bg-green-500" : "bg-accent"

  return (
    <div>
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div
                className={`w-full ${colorClass} rounded-t-sm transition-all duration-300 group-hover:opacity-100 opacity-80`}
                style={{ height: `${(point.value / maxValue) * height}px` }}
              />
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded px-2 py-1 text-xs font-bold whitespace-nowrap pointer-events-none z-10">
                {point.value.toLocaleString("en-US")} votes
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((point, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs text-muted-foreground">{point.label}</div>
          </div>
        ))}
      </div>
      {/* Y-axis label */}
      <div className="text-xs text-muted-foreground text-center mt-2">
        Number of votes cast per day
      </div>
    </div>
  )
}

// Horizontal Bar Chart Component
function HorizontalBarChart({ data, height }: { data: ChartDataPoint[]; height: number }) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div>
      <div className="space-y-3" style={{ minHeight: `${height}px` }}>
        {data.map((point, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm lg:text-base font-bold text-foreground">{point.label}</span>
              <span className="text-sm lg:text-base font-mono font-bold cm-highlight">{point.value.toLocaleString("en-US")} votes</span>
            </div>
            <div className="w-full h-6 bg-secondary/20 rounded-sm overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-500"
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center mt-4">
        Total votes received during qualification phase
      </div>
    </div>
  )
}

// Line Chart Component
function LineChart({ data, height }: { data: ChartDataPoint[]; height: number }) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const points = data.map((point, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (point.value / maxValue) * 100,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.3"
            className="transition-all duration-300"
          />
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className="text-accent" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" className="text-accent" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.filter((_, i) => i % 6 === 0 || i === data.length - 1).map((point, index) => (
          <span key={index} className="text-xs text-muted-foreground">
            {point.label}
          </span>
        ))}
      </div>
      {/* Y-axis label */}
      <div className="text-xs text-muted-foreground text-center mt-2">
        Votes per hour (UTC) - 24 hour pattern
      </div>
    </div>
  )
}

// Stat Row Component
function StatRow({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm lg:text-base text-muted-foreground">{label}</span>
      <span className={`text-sm lg:text-base font-mono font-bold ${valueClass}`}>{value}</span>
    </div>
  )
}
