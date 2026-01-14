import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  Country,
  ApiResponse,
  CountriesQueryParams,
} from '@/lib/api-types'

/**
 * Query keys for countries
 */
export const countriesKeys = {
  all: ['countries'] as const,
  lists: () => [...countriesKeys.all, 'list'] as const,
  list: (params: CountriesQueryParams) => [...countriesKeys.lists(), params] as const,
  details: () => [...countriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...countriesKeys.details(), id] as const,
}

/**
 * Fetch all countries with optional filters
 *
 * @example
 * const { data, isLoading } = useCountries({ qualified: true, group: 'A' })
 */
export function useCountries(params: CountriesQueryParams = {}) {
  return useQuery({
    queryKey: countriesKeys.list(params),
    queryFn: () => api.get<ApiResponse<Country[]>>('/countries', { params }),
    // Countries rarely change, cache for 1 day
    staleTime: 24 * 60 * 60 * 1000,
  })
}
