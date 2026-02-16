import type { MetadataRoute } from "next"
import countriesData from "@/data/countries.json"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/qualification`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/tournament`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date("2026-02-14"),
    },
  ]

  const qualificationRoutes: MetadataRoute.Sitemap = countriesData.map((country) => ({
    url: `${baseUrl}/qualification/${country.name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date("2026-02-14"),
  }))

  // /teams/* pages are noindex (mock data) — excluded from sitemap to avoid directive conflict
  return [...staticRoutes, ...qualificationRoutes]
}
