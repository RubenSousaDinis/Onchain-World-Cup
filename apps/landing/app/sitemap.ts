import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://onchainworldcup.xyz"

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-02-14"),
    },
  ]
}
