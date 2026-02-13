"use client"

import { useMemo } from 'react'
import { useUserStats } from '@/hooks/use-leaderboard'
import {
  computeAchievementStats,
  computeAchievements,
  computeTotalPoints,
  computeLevel,
  ACHIEVEMENTS,
  LEVELS,
} from '@/lib/achievements'

export function useAchievements(address: string | undefined) {
  const { data, isLoading, isError } = useUserStats(address ?? '')

  const result = useMemo(() => {
    if (!data?.data) {
      return {
        achievements: [],
        totalPoints: 0,
        level: LEVELS[0],
        unlockedCount: 0,
        totalCount: ACHIEVEMENTS.length,
      }
    }

    const stats = computeAchievementStats(data.data)
    const achievements = computeAchievements(stats)
    const totalPoints = computeTotalPoints(achievements)

    return {
      achievements,
      totalPoints,
      level: computeLevel(totalPoints),
      unlockedCount: achievements.filter((a) => a.unlocked).length,
      totalCount: achievements.length,
    }
  }, [data])

  return { ...result, isLoading: isLoading && !!address, isError }
}
