/**
 * Page-specific Mini App Embed utilities
 *
 * Generates fc:miniapp metadata for different page types
 * Spec: https://miniapps.farcaster.xyz/docs/specification#mini-app-embed
 */

import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"

/**
 * Generate embed metadata for home page
 */
export function generateHomeEmbed(): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/splash_social.png`,
        button: {
          title: "⚽ Vote Now",
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: BASE_URL,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Generate embed metadata for qualification overview page
 */
export function generateQualificationEmbed(): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/qualification_og.png`,
        button: {
          title: "🏆 View Qualification",
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/qualification`,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Generate embed metadata for individual country page
 */
export function generateCountryEmbed(country: {
  name: string
  code: string
  flagEmoji: string
}): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/api/og/country?code=${country.code}`,
        button: {
          title: `${country.flagEmoji} Vote ${country.name}`,
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/qualification/${country.code.toLowerCase()}`,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Generate embed metadata for match page
 */
export function generateMatchEmbed(match: {
  id: string
  team1Name: string
  team2Name: string
  team1Flag: string
  team2Flag: string
}): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/api/og/match?id=${match.id}`,
        button: {
          title: `${match.team1Flag} vs ${match.team2Flag}`,
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/matches/${match.id}`,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Generate embed metadata for leaderboard page
 */
export function generateLeaderboardEmbed(): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/leaderboard_og.png`,
        button: {
          title: "📊 View Leaderboard",
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/leaderboard`,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Generate embed metadata for team page
 */
export function generateTeamEmbed(team: {
  name: string
  code: string
  flagEmoji: string
}): Metadata {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/api/og/team?code=${team.code}`,
        button: {
          title: `${team.flagEmoji} View ${team.name}`,
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/teams/${team.code.toLowerCase()}`,
            splashImageUrl: `${BASE_URL}/logo.png`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

/**
 * Merge embed metadata with existing metadata
 */
export function mergeEmbedMetadata(baseMetadata: Metadata, embedMetadata: Metadata): Metadata {
  return {
    ...baseMetadata,
    other: {
      ...baseMetadata.other,
      ...embedMetadata.other,
    },
  }
}
