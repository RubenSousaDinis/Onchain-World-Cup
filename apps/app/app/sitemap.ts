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
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/qualification`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tournament`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: staticContentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  const qualificationRoutes: MetadataRoute.Sitemap = countriesData.map((country) => ({
    url: `${baseUrl}/qualification/${country.name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...qualificationRoutes]
}
