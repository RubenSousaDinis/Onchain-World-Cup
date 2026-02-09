"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}

export function useInfiniteScroll({ hasMore, isLoading, threshold = 0.8 }: UseInfiniteScrollOptions) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false)
  const [sentinelElement, setSentinelElement] = useState<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Callback ref to track when sentinel is mounted
  const sentinelRefCallback = useCallback((node: HTMLDivElement | null) => {
    console.log("[useInfiniteScroll] Sentinel ref callback:", node ? "Element attached" : "Element detached")
    setSentinelElement(node)
  }, [])

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
    if (!sentinelElement) {
      console.log("[useInfiniteScroll] No sentinel element found")
      return
    }

    console.log("[useInfiniteScroll] Setting up IntersectionObserver", { hasMore, isLoading })

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        console.log("[useInfiniteScroll] Intersection event:", {
          isIntersecting: first.isIntersecting,
          hasMore,
          isLoading,
          willLoadMore: first.isIntersecting && hasMore && !isLoading,
        })
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold },
    )

    observerRef.current.observe(sentinelElement)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [sentinelElement, hasMore, isLoading, loadMore, threshold])

  return { sentinelRef: sentinelRefCallback, shouldLoadMore }
}
