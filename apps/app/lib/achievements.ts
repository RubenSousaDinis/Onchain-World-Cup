import { QUALIFICATION_OPEN_DATE } from '@/lib/constants'

export interface AchievementStats {
  qualificationVotes: number
  qualificationSpentEth: number // pre-parsed float
  countriesVotedFor: number
  rank: number | null
  createdAt: Date
}

export interface ComputedAchievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  progress: number
  progressTotal: number
  unlocked: boolean
}

export interface Level {
  level: number
  name: string
  minPoints: number
  maxPoints: number | null
  color: string
  textColor: string
  borderColor: string
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Youth Player',
    minPoints: 0,
    maxPoints: 49,
    color: 'bg-gray-500/20',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500',
  },
  {
    level: 2,
    name: 'Reserve',
    minPoints: 50,
    maxPoints: 149,
    color: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
  },
  {
    level: 3,
    name: 'Regular',
    minPoints: 150,
    maxPoints: 299,
    color: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500',
  },
  {
    level: 4,
    name: 'Key Player',
    minPoints: 300,
    maxPoints: 599,
    color: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500',
  },
  {
    level: 5,
    name: 'Star Player',
    minPoints: 600,
    maxPoints: 999,
    color: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500',
  },
  {
    level: 6,
    name: 'World Class',
    minPoints: 1000,
    maxPoints: null,
    color: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
  },
]

interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  compute: (stats: AchievementStats) => { progress: number; progressTotal: number; unlocked: boolean }
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first-vote',
    title: 'First Vote',
    description: 'Casted your first qualification vote',
    icon: '⚽',
    rarity: 'common',
    points: 10,
    compute: (stats) => ({
      progress: Math.min(stats.qualificationVotes, 1),
      progressTotal: 1,
      unlocked: stats.qualificationVotes >= 1,
    }),
  },
  {
    id: 'vote-collector',
    title: 'Vote Collector',
    description: 'Casted 10 qualification votes',
    icon: '🔥',
    rarity: 'common',
    points: 20,
    compute: (stats) => ({
      progress: Math.min(stats.qualificationVotes, 10),
      progressTotal: 10,
      unlocked: stats.qualificationVotes >= 10,
    }),
  },
  {
    id: 'power-voter',
    title: 'Power Voter',
    description: 'Casted 50 qualification votes',
    icon: '⚡',
    rarity: 'rare',
    points: 50,
    compute: (stats) => ({
      progress: Math.min(stats.qualificationVotes, 50),
      progressTotal: 50,
      unlocked: stats.qualificationVotes >= 50,
    }),
  },
  {
    id: 'vote-whale',
    title: 'Vote Whale',
    description: 'Casted 100 qualification votes',
    icon: '🐋',
    rarity: 'epic',
    points: 100,
    compute: (stats) => ({
      progress: Math.min(stats.qualificationVotes, 100),
      progressTotal: 100,
      unlocked: stats.qualificationVotes >= 100,
    }),
  },
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    description: 'Voted for 5 different countries',
    icon: '🌍',
    rarity: 'rare',
    points: 50,
    compute: (stats) => ({
      progress: Math.min(stats.countriesVotedFor, 5),
      progressTotal: 5,
      unlocked: stats.countriesVotedFor >= 5,
    }),
  },
  {
    id: 'world-citizen',
    title: 'World Citizen',
    description: 'Voted for 10 different countries',
    icon: '🌐',
    rarity: 'epic',
    points: 100,
    compute: (stats) => ({
      progress: Math.min(stats.countriesVotedFor, 10),
      progressTotal: 10,
      unlocked: stats.countriesVotedFor >= 10,
    }),
  },
  {
    id: 'spender',
    title: 'Spender',
    description: 'Spent 0.05 ETH on qualification votes',
    icon: '💸',
    rarity: 'rare',
    points: 40,
    compute: (stats) => ({
      progress: Math.min(Math.round((stats.qualificationSpentEth / 0.05) * 100), 100),
      progressTotal: 100,
      unlocked: stats.qualificationSpentEth >= 0.05,
    }),
  },
  {
    id: 'high-roller',
    title: 'High Roller',
    description: 'Spent 0.5 ETH on qualification votes',
    icon: '🎰',
    rarity: 'epic',
    points: 80,
    compute: (stats) => ({
      progress: Math.min(Math.round((stats.qualificationSpentEth / 0.5) * 100), 100),
      progressTotal: 100,
      unlocked: stats.qualificationSpentEth >= 0.5,
    }),
  },
  {
    id: 'top-100',
    title: 'Top 100',
    description: 'Reached the top 100 on the qualification leaderboard',
    icon: '📊',
    rarity: 'rare',
    points: 50,
    compute: (stats) => ({
      progress: stats.rank !== null && stats.rank <= 100 ? 1 : 0,
      progressTotal: 1,
      unlocked: stats.rank !== null && stats.rank <= 100,
    }),
  },
  {
    id: 'top-10',
    title: 'Top 10',
    description: 'Reached the top 10 on the qualification leaderboard',
    icon: '👑',
    rarity: 'legendary',
    points: 200,
    compute: (stats) => ({
      progress: stats.rank !== null && stats.rank <= 10 ? 1 : 0,
      progressTotal: 1,
      unlocked: stats.rank !== null && stats.rank <= 10,
    }),
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Voted in the first week of qualification',
    icon: '🐦',
    rarity: 'epic',
    points: 75,
    compute: (stats) => {
      const earlyDeadline = new Date(QUALIFICATION_OPEN_DATE)
      earlyDeadline.setDate(earlyDeadline.getDate() + 7)
      const isEarly = stats.qualificationVotes >= 1 && stats.createdAt <= earlyDeadline
      return {
        progress: isEarly ? 1 : 0,
        progressTotal: 1,
        unlocked: isEarly,
      }
    },
  },
]

export const ACHIEVEMENTS = ACHIEVEMENT_DEFS

/**
 * Normalises API data from either snake_case (REST response) or camelCase (Prisma model) format.
 */
export function computeAchievementStats(apiData: {
  qualification_votes?: number
  qualificationVotes?: number
  qualification_spent_eth?: string
  qualificationSpentEth?: string
  countries_voted_for?: number
  countriesVotedFor?: number
  rank?: number | null
  created_at?: string
  createdAt?: string | Date
}): AchievementStats {
  const votes = apiData.qualification_votes ?? apiData.qualificationVotes ?? 0
  const ethStr = apiData.qualification_spent_eth ?? apiData.qualificationSpentEth ?? '0'
  const countries = apiData.countries_voted_for ?? apiData.countriesVotedFor ?? 0
  const rank = apiData.rank ?? null
  const createdAtRaw = apiData.created_at ?? apiData.createdAt ?? new Date().toISOString()

  return {
    qualificationVotes: votes,
    qualificationSpentEth: parseFloat(ethStr as string),
    countriesVotedFor: countries,
    rank,
    createdAt: new Date(createdAtRaw as string),
  }
}

export function computeAchievements(stats: AchievementStats): ComputedAchievement[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const { progress, progressTotal, unlocked } = def.compute(stats)
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      points: def.points,
      progress,
      progressTotal,
      unlocked,
    }
  })
}

export function computeTotalPoints(achievements: ComputedAchievement[]): number {
  return achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)
}

export function computeLevel(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}
