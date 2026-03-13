/**
 * Farcaster Manifest Generation Utility
 *
 * Generates valid Farcaster Mini App manifest JSON
 * Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
 */

export interface AccountAssociation {
  header: string
  payload: string
  signature: string
}

export interface MiniAppManifest {
  version: "1"
  name: string
  iconUrl: string
  homeUrl: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
  tagline?: string
  subtitle?: string
  description?: string
  primaryCategory?: string
  tags?: string[]
  heroImageUrl?: string
  screenshotUrls?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  noindex?: boolean
  requiredChains?: string[]
  requiredCapabilities?: string[]
}

export interface FarcasterManifest {
  accountAssociation: AccountAssociation
  miniapp: MiniAppManifest
}

export interface ManifestConfig {
  appName: string
  appDomain: string
  iconUrl?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
  accountAssociationHeader?: string
  accountAssociationPayload?: string
  accountAssociationSignature?: string
  tagline?: string
  subtitle?: string
  description?: string
  primaryCategory?: string
  tags?: string[]
  heroImageUrl?: string
  screenshotUrls?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  noindex?: boolean
}

/**
 * Generate a Farcaster manifest object
 *
 * Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
 * All app metadata lives under the top-level "miniapp" key.
 * The legacy "frame" key is no longer used.
 */
export function generateManifest(config: ManifestConfig): FarcasterManifest {
  const {
    appName,
    appDomain,
    iconUrl,
    splashImageUrl,
    splashBackgroundColor = "#0a1628",
    webhookUrl,
    accountAssociationHeader = "REPLACE_WITH_SIGNED_HEADER",
    accountAssociationPayload = "REPLACE_WITH_SIGNED_PAYLOAD",
    accountAssociationSignature = "REPLACE_WITH_SIGNATURE",
    tagline,
    subtitle,
    description,
    primaryCategory,
    tags,
    heroImageUrl,
    screenshotUrls,
    ogTitle,
    ogDescription,
    ogImageUrl,
    noindex,
  } = config

  const baseUrl = appDomain.startsWith('http') ? appDomain : `https://${appDomain}`
  const icon = iconUrl || `${baseUrl}/logo.jpg`
  const splash = splashImageUrl || `${baseUrl}/splash_social.png`
  const webhook = webhookUrl || `${baseUrl}/api/farcaster/webhook`

  return {
    accountAssociation: {
      header: accountAssociationHeader,
      payload: accountAssociationPayload,
      signature: accountAssociationSignature,
    },
    miniapp: {
      version: "1",
      name: appName,
      iconUrl: icon,
      homeUrl: baseUrl,
      splashImageUrl: splash,
      splashBackgroundColor,
      webhookUrl: webhook,
      requiredChains: ["eip155:8453"],
      requiredCapabilities: ["wallet.getEthereumProvider"],
      ...(tagline && { tagline }),
      ...(subtitle && { subtitle }),
      ...(description && { description }),
      ...(primaryCategory && { primaryCategory }),
      ...(tags && { tags }),
      ...(heroImageUrl && { heroImageUrl }),
      ...(screenshotUrls && { screenshotUrls }),
      ...(ogTitle && { ogTitle }),
      ...(ogDescription && { ogDescription }),
      ...(ogImageUrl && { ogImageUrl }),
      ...(noindex !== undefined && { noindex }),
    },
  }
}

/**
 * Validate a Farcaster manifest
 * Returns an array of validation errors, or empty array if valid
 */
export function validateManifest(manifest: unknown): string[] {
  const errors: string[] = []

  if (!manifest || typeof manifest !== 'object') {
    errors.push('Manifest must be an object')
    return errors
  }

  const m = manifest as Record<string, unknown>

  // Validate accountAssociation
  if (!m.accountAssociation || typeof m.accountAssociation !== 'object') {
    errors.push('Missing or invalid accountAssociation')
  } else {
    const aa = m.accountAssociation as Record<string, unknown>
    if (!aa.header || typeof aa.header !== 'string') errors.push('accountAssociation.header must be a string')
    if (!aa.payload || typeof aa.payload !== 'string') errors.push('accountAssociation.payload must be a string')
    if (!aa.signature || typeof aa.signature !== 'string') errors.push('accountAssociation.signature must be a string')
    if (aa.header === 'REPLACE_WITH_SIGNED_HEADER') errors.push('accountAssociation.header is still a placeholder')
  }

  // Validate miniapp
  if (!m.miniapp || typeof m.miniapp !== 'object') {
    errors.push('Missing or invalid miniapp')
  } else {
    const a = m.miniapp as Record<string, unknown>
    if (a.version !== '1') errors.push('miniapp.version must be "1"')
    if (!a.name || typeof a.name !== 'string') errors.push('miniapp.name must be a string')
    if (!a.iconUrl || typeof a.iconUrl !== 'string') errors.push('miniapp.iconUrl must be a string URL')
    if (!a.homeUrl || typeof a.homeUrl !== 'string') errors.push('miniapp.homeUrl must be a string URL')
  }

  return errors
}

/**
 * Get manifest configuration from environment variables
 */
export function getManifestConfig(): ManifestConfig {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.onchainworldcup.xyz'
  const baseUrl = appDomain.startsWith('http') ? appDomain : `https://${appDomain}`

  return {
    appName: "Onchain World Cup",
    appDomain,
    splashBackgroundColor: "#0a1628",
    // Account association — env var names match Vercel configuration
    accountAssociationHeader: process.env.FARCASTER_HEADER,
    accountAssociationPayload: process.env.FARCASTER_PAYLOAD,
    accountAssociationSignature: process.env.FARCASTER_SIGNATURE,
    // Base Mini App discovery fields
    tagline: "Vote on World Cup 2026 matches",
    subtitle: "Onchain World Cup 2026",
    description: "Vote on World Cup 2026 matches and win ETH on Base. Pick winners before kick-off, earn more for voting early. Fully onchain, no custody.",
    primaryCategory: "games",
    tags: ["soccer", "worldcup", "voting", "onchain", "sports"],
    heroImageUrl: `${baseUrl}/splash_social.png`,
    screenshotUrls: [
      `${baseUrl}/screenshot_qualification.png`,
      `${baseUrl}/screenshot_vote_modal.png`,
      `${baseUrl}/screenshot_profile.png`,
    ],
    ogTitle: "Onchain World Cup",
    ogDescription: "Vote on World Cup 2026 matches and win ETH on Base.",
    ogImageUrl: `${baseUrl}/splash_social.png`,
  }
}
