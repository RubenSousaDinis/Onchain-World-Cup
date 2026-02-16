import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://onchainworldcup.xyz"

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-02-14"),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-02-14"),
    },
  ]
}
