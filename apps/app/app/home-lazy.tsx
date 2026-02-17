"use client"

import dynamic from "next/dynamic"

/**
 * Lazy-loaded HomePageClient.
 *
 * ssr: false keeps wagmi hooks, contract imports, and dashboard components
 * out of the initial JS bundle and out of the SSR pass.
 * The hero section in page.tsx still renders as static SSR HTML immediately.
 * This component loads as a separate JS chunk after hydration, reducing
 * both initial bundle size and Total Blocking Time.
 */
export const HomeLazy = dynamic(
  () => import("./homepage-client").then((m) => ({ default: m.HomePageClient })),
  { ssr: false, loading: () => <div className="py-8" /> },
)
