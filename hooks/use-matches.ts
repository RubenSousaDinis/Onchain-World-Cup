import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  Match,
  ApiResponse,
  MatchesQueryParams,
} from '@/lib/api-types'

/**
 * Query keys for matches
 */
export const matchesKeys = {
  all: ['matches'] as const,
  lists: () => [...matchesKeys.all, 'list'] as const,
  list: (params: MatchesQueryParams) => [...matchesKeys.lists(), params] as const,
  details: () => [...matchesKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchesKeys.details(), id] as const,
}

/**
 * Fetch all matches with optional filters
 *
 * @example
 * const { data, isLoading, error } = useMatches({ status: 'voting', limit: 10 })
 */
export function useMatches(params: MatchesQueryParams = {}) {
  return useQuery({
    queryKey: matchesKeys.list(params),
    queryFn: () => api.get<ApiResponse<Match[]>>('/matches', { params }),
    // Matches data is static, cache for 1 hour
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Fetch a single match by ID
 *
 * @example
 * const { data, isLoading } = useMatch('match-id')
 */
export function useMatch(id: string) {
  return useQuery({
    queryKey: matchesKeys.detail(id),
    queryFn: () => api.get<{ data: Match }>(`/matches/${id}`),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 60 * 60 * 1000,
  })
}

