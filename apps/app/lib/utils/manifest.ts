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
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
}

export interface FarcasterManifest {
  accountAssociation: AccountAssociation
  frame: FrameManifest
}

export interface ManifestConfig {
  appName: string
  appDomain: string
  iconUrl?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  webhookUrl?: string
  // Account association fields (must be generated using Farcaster signing tool)
  accountAssociationHeader?: string
  accountAssociationPayload?: string
  accountAssociationSignature?: string
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
    splashImageUrl,
    splashBackgroundColor = "#0a1628",
    webhookUrl,
    accountAssociationHeader = "REPLACE_WITH_SIGNED_HEADER",
    accountAssociationPayload = "REPLACE_WITH_SIGNED_PAYLOAD",
    accountAssociationSignature = "REPLACE_WITH_SIGNATURE",
  } = config

  // Construct full URLs
  const baseUrl = appDomain.startsWith('http') ? appDomain : `https://${appDomain}`
  const icon = iconUrl || `${baseUrl}/logo.png`
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
      splashImageUrl: splash,
      splashBackgroundColor,
      webhookUrl: webhook,
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

  return {
    appName: "Onchain World Cup",
    appDomain,
    splashBackgroundColor: "#0a1628",
    // Account association should be set via environment variables
    // These are generated using Farcaster's signing tool
    accountAssociationHeader: process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER,
    accountAssociationPayload: process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD,
    accountAssociationSignature: process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE,
  }
}
