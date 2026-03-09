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

export interface FrameManifest {
  version: "1"
  name: string
  iconUrl: string
  homeUrl: string
  imageUrl?: string
  buttonTitle?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
  // Base Mini App discovery fields
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

export interface MiniAppManifest {
  requiredChains?: string[] // Array of CAIP-2 identifiers (e.g., ["eip155:84532", "eip155:8453"])
  requiredCapabilities?: string[] // Array of SDK method paths (e.g., ["wallet.switchEthereumChain"])
}

export interface FarcasterManifest {
  accountAssociation: AccountAssociation
  frame: FrameManifest
  miniapp?: MiniAppManifest
}

export interface ManifestConfig {
  appName: string
  appDomain: string
  iconUrl?: string
  buttonTitle?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
  // Account association fields (must be generated using Farcaster signing tool)
  accountAssociationHeader?: string
  accountAssociationPayload?: string
  accountAssociationSignature?: string
  // Base Mini App discovery fields
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
 * Note: Account association signature must be generated using the Farcaster
 * signing tool: https://farcaster.xyz/~/developers/hosted-manifests
 */
export function generateManifest(config: ManifestConfig): FarcasterManifest {
  const {
    appName,
    appDomain,
    iconUrl,
    buttonTitle = "Open App",
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

  // Construct full URLs
  const baseUrl = appDomain.startsWith('http') ? appDomain : `https://${appDomain}`
  const icon = iconUrl || `${baseUrl}/logo.jpg`
  const splash = splashImageUrl || `${baseUrl}/splash_social.png`
  const home = baseUrl
  const webhook = webhookUrl || `${baseUrl}/api/farcaster/webhook`

  return {
    accountAssociation: {
      header: accountAssociationHeader,
      payload: accountAssociationPayload,
      signature: accountAssociationSignature,
    },
    frame: {
      version: "1",
      name: appName,
      iconUrl: icon,
      homeUrl: home,
      imageUrl: splash,
      buttonTitle,
      splashImageUrl: splash,
      splashBackgroundColor,
      webhookUrl: webhook,
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
    miniapp: {
      requiredChains: ["eip155:8453", "eip155:84532"],
      // Require Ethereum provider for wallet interactions
      requiredCapabilities: ["wallet.getEthereumProvider"],
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
    if (!aa.header || typeof aa.header !== 'string') {
      errors.push('accountAssociation.header must be a string')
    }
    if (!aa.payload || typeof aa.payload !== 'string') {
      errors.push('accountAssociation.payload must be a string')
    }
    if (!aa.signature || typeof aa.signature !== 'string') {
      errors.push('accountAssociation.signature must be a string')
    }

    // Check if placeholders are still present
    if (aa.header === 'REPLACE_WITH_SIGNED_HEADER') {
      errors.push('accountAssociation.header is still a placeholder - needs proper signature')
    }
  }

  // Validate frame
  if (!m.frame || typeof m.frame !== 'object') {
    errors.push('Missing or invalid frame')
  } else {
    const f = m.frame as Record<string, unknown>

    if (f.version !== '1') {
      errors.push('frame.version must be "1" (string)')
    }
    if (!f.name || typeof f.name !== 'string') {
      errors.push('frame.name must be a string')
    }
    if (!f.iconUrl || typeof f.iconUrl !== 'string') {
      errors.push('frame.iconUrl must be a string URL')
    }
    if (!f.homeUrl || typeof f.homeUrl !== 'string') {
      errors.push('frame.homeUrl must be a string URL')
    }

    // Validate URLs
    const urlFields = ['iconUrl', 'homeUrl', 'imageUrl', 'splashImageUrl', 'webhookUrl']
    for (const field of urlFields) {
      if (f[field] && typeof f[field] === 'string') {
        try {
          new URL(f[field] as string)
        } catch {
          errors.push(`frame.${field} is not a valid URL`)
        }
      }
    }

    // Validate color format
    if (f.splashBackgroundColor && typeof f.splashBackgroundColor === 'string') {
      const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
      if (!colorRegex.test(f.splashBackgroundColor)) {
        errors.push('frame.splashBackgroundColor must be a valid hex color (e.g., #0a1628)')
      }
    }
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
    buttonTitle: "⚽ Vote Now",
    splashBackgroundColor: "#0a1628",
    // Account association should be set via environment variables
    // These are generated using Farcaster's signing tool
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
    // screenshotUrls: [] — add portrait screenshots (1284×2778px) when available
    ogTitle: "Onchain World Cup",
    ogDescription: "Vote on World Cup 2026 matches and win ETH on Base.",
    ogImageUrl: `${baseUrl}/splash_social.png`,
  }
}
