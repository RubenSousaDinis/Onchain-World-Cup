// Mock data for platform statistics
// Will be replaced with real data from API/blockchain

export interface PlatformStats {
  totalETHInPools: string
  totalETHWagered: string
  totalVotesCast: number
  matchesCreated: number
  uniqueVoters: number
  averageVoteSize: string
  phase1VotesPercent: number
  phase2VotesPercent: number
}

export interface ChartDataPoint {
  label: string
  value: number
  displayValue?: string
}

export const platformStats: PlatformStats = {
  totalETHInPools: "125.8",
  totalETHWagered: "342.5",
  totalVotesCast: 48750,
  matchesCreated: 156,
  uniqueVoters: 1247,
  averageVoteSize: "0.007",
  phase1VotesPercent: 68,
  phase2VotesPercent: 32,
}

// Helper to get dates for last N days
const getDatesForLastNDays = (n: number): string[] => {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    // Format as "Jan 11"
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dates.push(formatted)
  }
  return dates
}

const last7Days = getDatesForLastNDays(7)

// ETH over time (last 7 days)
export const ethOverTime: ChartDataPoint[] = [
  { label: last7Days[0], value: 45.2, displayValue: "45.2 ETH" },
  { label: last7Days[1], value: 67.8, displayValue: "67.8 ETH" },
  { label: last7Days[2], value: 89.3, displayValue: "89.3 ETH" },
  { label: last7Days[3], value: 124.5, displayValue: "124.5 ETH" },
  { label: last7Days[4], value: 198.7, displayValue: "198.7 ETH" },
  { label: last7Days[5], value: 267.3, displayValue: "267.3 ETH" },
  { label: last7Days[6], value: 342.5, displayValue: "342.5 ETH" },
]

// Votes per day (last 7 days)
export const votesPerDay: ChartDataPoint[] = [
  { label: last7Days[0], value: 4250 },
  { label: last7Days[1], value: 5870 },
  { label: last7Days[2], value: 7340 },
  { label: last7Days[3], value: 9120 },
  { label: last7Days[4], value: 11450 },
  { label: last7Days[5], value: 14890 },
  { label: last7Days[6], value: 18920 },
]

// Top countries by votes
export const topCountriesByVotes: ChartDataPoint[] = [
  { label: "🇧🇷 Brazil", value: 2500 },
  { label: "🇦🇷 Argentina", value: 2465 },
  { label: "🇩🇪 Germany", value: 2390 },
  { label: "🇫🇷 France", value: 2310 },
  { label: "🇪🇸 Spain", value: 2180 },
  { label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", value: 2050 },
  { label: "🇮🇹 Italy", value: 1920 },
  { label: "🇵🇹 Portugal", value: 1780 },
  { label: "🇳🇱 Netherlands", value: 1650 },
  { label: "🇧🇪 Belgium", value: 1520 },
]

// Phase distribution
export const phaseDistribution = [
  { label: "Phase 1 (Linear Pricing)", value: 68, color: "bg-green-500" },
  { label: "Phase 2 (Exponential Pricing)", value: 32, color: "bg-accent" },
]

// Activity by hour (24 hours)
export const activityByHour: ChartDataPoint[] = [
  { label: "00:00", value: 45 },
  { label: "01:00", value: 32 },
  { label: "02:00", value: 28 },
  { label: "03:00", value: 25 },
  { label: "04:00", value: 30 },
  { label: "05:00", value: 42 },
  { label: "06:00", value: 58 },
  { label: "07:00", value: 75 },
  { label: "08:00", value: 92 },
  { label: "09:00", value: 105 },
  { label: "10:00", value: 118 },
  { label: "11:00", value: 125 },
  { label: "12:00", value: 142 },
  { label: "13:00", value: 155 },
  { label: "14:00", value: 168 },
  { label: "15:00", value: 182 },
  { label: "16:00", value: 195 },
  { label: "17:00", value: 208 },
  { label: "18:00", value: 215 },
  { label: "19:00", value: 198 },
  { label: "20:00", value: 175 },
  { label: "21:00", value: 145 },
  { label: "22:00", value: 98 },
  { label: "23:00", value: 65 },
]
