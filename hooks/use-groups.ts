import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Group, GroupStanding, ApiResponse } from '@/lib/api-types'

/**
 * Query keys for groups
 */
export const groupsKeys = {
  all: ['groups'] as const,
  lists: () => [...groupsKeys.all, 'list'] as const,
  list: (tournamentId: string) => [...groupsKeys.lists(), tournamentId] as const,
  details: () => [...groupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupsKeys.details(), id] as const,
  standings: (groupId: string) => [...groupsKeys.detail(groupId), 'standings'] as const,
}

/**
 * Fetch all groups for a tournament with standings
 *
 * @example
 * const { data, isLoading } = useTournamentGroups('tournament-id')
 */
export function useTournamentGroups(tournamentId: string) {
  return useQuery({
    queryKey: groupsKeys.list(tournamentId),
    queryFn: () =>
      api.get<{ data: Group[] }>(`/tournaments/${tournamentId}/groups`),
    enabled: !!tournamentId,
    // Groups and standings don't change often, cache for 1 hour
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Fetch standings for a specific group
 *
 * @example
 * const { data, isLoading } = useGroupStandings('group-id')
 */
export function useGroupStandings(groupId: string) {
  return useQuery({
    queryKey: groupsKeys.standings(groupId),
    queryFn: () =>
      api.get<{ data: GroupStanding[] }>(`/groups/${groupId}/standings`),
    enabled: !!groupId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Recalculate standings for a group (admin only)
 *
 * @example
 * const recalculateStandings = useRecalculateStandings()
 * recalculateStandings.mutate('group-id')
 */
export function useRecalculateStandings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: string) =>
      api.put<{ data: GroupStanding[] }>(`/groups/${groupId}/standings`),
    onSuccess: (_, groupId) => {
      // Invalidate group standings
      queryClient.invalidateQueries({ queryKey: groupsKeys.standings(groupId) })
      // Also invalidate tournament groups since they include standings
      queryClient.invalidateQueries({ queryKey: groupsKeys.lists() })
    },
  })
}

/**
 * Add a team to a group (admin only)
 *
 * @example
 * const addTeamToGroup = useAddTeamToGroup()
 * addTeamToGroup.mutate({ groupId: 'group-id', countryId: 'country-id' })
 */
export function useAddTeamToGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: string; countryId: string }) =>
      api.post<{ data: GroupStanding }>(
        `/groups/${data.groupId}/standings`,
        { country_id: data.countryId }
      ),
    onSuccess: (_, variables) => {
      // Invalidate group standings
      queryClient.invalidateQueries({
        queryKey: groupsKeys.standings(variables.groupId),
      })
      queryClient.invalidateQueries({ queryKey: groupsKeys.lists() })
    },
  })
}
