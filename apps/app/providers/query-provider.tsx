'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'

/**
 * React Query provider for client-side data fetching and caching
 *
 * Features:
 * - Automatic caching with configurable stale times
 * - Background refetching
 * - Request deduplication
 * - Optimistic updates
 * - DevTools in development (press Escape to close if minimize doesn't)
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Re-mount key: when minimize doesn't close the panel, Escape remounts devtools so panel resets to closed
  const [devtoolsKey, setDevtoolsKey] = useState(0)

  // Create QueryClient instance (useState ensures it's only created once)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests
            retry: 2,
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry failed mutations
            retry: 1,
          },
        },
      })
  )

  // Workaround: TanStack devtools minimize button sometimes doesn't close the panel.
  // Escape remounts the devtools so the panel resets to closed.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.repeat) {
        setDevtoolsKey((k) => k + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development. Key forces remount on Escape so panel closes. */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          key={devtoolsKey}
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}
