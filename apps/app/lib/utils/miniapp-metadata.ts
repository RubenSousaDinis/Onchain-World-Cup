/**
 * Farcaster Mini App Embed Metadata Utility
 *
 * Generates fc:miniapp meta tags for Next.js pages
 * Spec: https://miniapps.farcaster.xyz/docs/specification#embed-metadata
 */

export interface MiniAppButton {
  title: string // Max 32 characters
  action: {
    type: "launch_frame"
    name: string
    url?: string
    splashImageUrl?: string
    splashBackgroundColor?: string
  }
}

export interface MiniAppMetadata {
  version: "1"
  imageUrl: string // 3:2 aspect ratio OG image
  button: MiniAppButton
}

export interface MiniAppMetadataConfig {
  title?: string
  description?: string
  imageUrl?: string
  buttonTitle?: string
  appName?: string
  appUrl?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
}

/**
 * Generate fc:miniapp metadata for Next.js
 *
 * Returns a metadata object that can be used in Next.js generateMetadata() function
 * or in the page metadata export
 */
export function generateMiniAppMetadata(config?: MiniAppMetadataConfig) {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz'
  const appName = config?.appName || 'Onchain World Cup'
  const buttonTitle = config?.buttonTitle || 'Open App'
  const appUrl = config?.appUrl || appDomain
  const imageUrl = config?.imageUrl || `${appDomain}/splash_social.png`
  const splashImageUrl = config?.splashImageUrl || `${appDomain}/splash_social.png`
  const splashBackgroundColor = config?.splashBackgroundColor || '#0a1628'

  // Validate button title length
  if (buttonTitle.length > 32) {
    console.warn(`[MiniAppMetadata] Button title "${buttonTitle}" exceeds 32 character limit. Truncating.`)
  }

  const miniAppData: MiniAppMetadata = {
    version: "1",
    imageUrl, // Must be 3:2 aspect ratio
    button: {
      title: buttonTitle.slice(0, 32), // Enforce 32 char limit
      action: {
        type: "launch_frame",
        name: appName,
        url: appUrl,
        splashImageUrl,
        splashBackgroundColor,
      },
    },
  }

  return {
    title: config?.title || `${appName} | Vote on World Cup 2026`,
    description: config?.description || 'Vote on World Cup 2026 matches with ETH on Base network',
    openGraph: {
      title: config?.title || appName,
      description: config?.description || 'Vote on World Cup 2026 matches with ETH',
      images: [
        {
          url: imageUrl,
          width: 1536,
          height: 1024,
          alt: appName,
        },
      ],
    },
    other: {
      // Farcaster Mini App meta tag
      'fc:miniapp': JSON.stringify(miniAppData),
    },
  }
}

/**
 * Generate fc:miniapp metadata for a specific match
 */
export function generateMatchMiniAppMetadata(matchId: string, team1: string, team2: string) {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz'

  return generateMiniAppMetadata({
    title: `Vote: ${team1} vs ${team2}`,
    description: `Vote on ${team1} vs ${team2} with ETH. Early voters get better rates!`,
    imageUrl: `${appDomain}/og/match/${matchId}`, // Dynamic OG image
    buttonTitle: 'Vote Now',
    appUrl: `${appDomain}/matches/${matchId}`,
  })
}

/**
 * Generate fc:miniapp metadata for qualification voting
 */
export function generateQualificationMiniAppMetadata(countryName: string) {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz'

  return generateMiniAppMetadata({
    title: `Vote: ${countryName} Qualification`,
    description: `Vote for ${countryName} to qualify for World Cup 2026. Support your team!`,
    imageUrl: `${appDomain}/og/qualification/${countryName}`,
    buttonTitle: 'Vote for Qualification',
    appUrl: `${appDomain}/qualification`,
  })
}

/**
 * Validate metadata configuration
 */
export function validateMiniAppMetadata(config: MiniAppMetadataConfig): string[] {
  const errors: string[] = []

  if (config.buttonTitle && config.buttonTitle.length > 32) {
    errors.push('Button title exceeds 32 character limit')
  }

  if (config.imageUrl) {
    try {
      new URL(config.imageUrl)
    } catch {
      errors.push('imageUrl is not a valid URL')
    }
  }

  if (config.appUrl) {
    try {
      new URL(config.appUrl)
    } catch {
      errors.push('appUrl is not a valid URL')
    }
  }

  if (config.splashBackgroundColor) {
    const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if (!colorRegex.test(config.splashBackgroundColor)) {
      errors.push('splashBackgroundColor must be a valid hex color')
    }
  }

  return errors
}

/**
 * Check if an image URL has the correct 3:2 aspect ratio
 * Note: This is a heuristic check based on common dimensions
 */
export function isValidAspectRatio(width: number, height: number): boolean {
  const ratio = width / height
  const expectedRatio = 3 / 2 // 1.5
  const tolerance = 0.01 // Allow 1% deviation

  return Math.abs(ratio - expectedRatio) < tolerance
}

/**
 * Get recommended OG image dimensions
 */
export function getRecommendedOGDimensions() {
  return {
    width: 1200,
    height: 800,
    aspectRatio: '3:2',
    common: [
      { width: 1200, height: 800 },
      { width: 1536, height: 1024 },
      { width: 1800, height: 1200 },
    ],
  }
}
