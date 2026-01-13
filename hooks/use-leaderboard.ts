import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  UserStats,
  ApiResponse,
  LeaderboardQueryParams,
} from '@/lib/api-types'

/**
 * Query keys for leaderboard
 */
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (params: LeaderboardQueryParams) => [...leaderboardKeys.lists(), params] as const,
}

/**
 * Fetch leaderboard with optional filters and sorting
 *
 * @example
 * const { data, isLoading } = useLeaderboard({
 *   limit: 10,
 *   sort_by: 'total_won_eth'
 * })
 */
export function useLeaderboard(params: LeaderboardQueryParams = {}) {
  return useQuery({
    queryKey: leaderboardKeys.list(params),
    queryFn: () => api.get<ApiResponse<UserStats[]>>('/leaderboard', { params }),
    // Leaderboard updates when matches complete, cache for 15 minutes
    staleTime: 15 * 60 * 1000,
  })
}

/**
 * Fetch user stats by wallet address
 *
 * @example
 * const { data } = useUserStats('0x1234...')
 */
export function useUserStats(address: string) {
  return useQuery({
    queryKey: ['user-stats', address] as const,
    queryFn: () => api.get<{ data: UserStats }>(`/users/${address}`),
    enabled: !!address,
    staleTime: 15 * 60 * 1000,
  })
}
