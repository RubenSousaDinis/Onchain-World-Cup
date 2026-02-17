import type { MetadataRoute } from "next"
import countriesData from "@/data/countries.json"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"
  const now = new Date()
  const staticContentDate = new Date("2026-02-16")

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
    },
    {
      url: `${baseUrl}/qualification`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tournament`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: staticContentDate,
    },
  ]

  const qualificationRoutes: MetadataRoute.Sitemap = countriesData.map((country) => ({
    url: `${baseUrl}/qualification/${country.name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: staticContentDate,
  }))

  return [...staticRoutes, ...qualificationRoutes]
}
