"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}

export function useInfiniteScroll({ hasMore, isLoading, threshold = 0.8 }: UseInfiniteScrollOptions) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setShouldLoadMore(true)
    }
  }, [isLoading, hasMore])

  useEffect(() => {
    if (shouldLoadMore) {
      setShouldLoadMore(false)
    }
  }, [shouldLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold },
    )

    observerRef.current.observe(sentinel)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, loadMore, threshold])

  return { sentinelRef, shouldLoadMore }
}
