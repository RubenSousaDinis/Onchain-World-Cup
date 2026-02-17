import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://onchainworldcup.xyz"
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-02-16"),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-02-16"),
    },
  ]
}
