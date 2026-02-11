/**
 * Farcaster Profile Service
 *
 * Utility for fetching Farcaster user profile data
 * Uses Neynar's public API (no API key required for basic lookups)
 */

export type FarcasterProfile = {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  bio?: string
  verifiedAddresses: {
    eth: string[]
  }
}

/**
 * Fetch Farcaster user profile by FID
 * Uses Neynar's public API
 *
 * @param fid - Farcaster ID
 * @returns User profile data or null if not found
 */
export async function fetchFarcasterProfile(fid: number): Promise<FarcasterProfile | null> {
  try {
    console.log(`[Farcaster Profile] Fetching profile for FID ${fid}...`)

    // Use Neynar's public API - no API key required for basic lookups
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`
    console.log(`[Farcaster Profile] URL: ${url}`)

    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
      },
    })

    console.log(`[Farcaster Profile] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Farcaster Profile] API error for FID ${fid}:`, response.status, errorText)
      return null
    }

    const data = await response.json()
    console.log(`[Farcaster Profile] Response data:`, JSON.stringify(data, null, 2))

    if (!data.users || data.users.length === 0) {
      console.warn(`[Farcaster Profile] No user found for FID ${fid}`)
      return null
    }

    const user = data.users[0]
    console.log(`[Farcaster Profile] Found user:`, {
      fid: user.fid,
      username: user.username,
      pfp: user.pfp_url,
      verifiedAddresses: user.verified_addresses,
    })

    // Extract verified Ethereum addresses
    const ethAddresses = user.verified_addresses?.eth_addresses || []

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      pfpUrl: user.pfp_url || '',
      bio: user.profile?.bio?.text,
      verifiedAddresses: {
        eth: ethAddresses,
      },
    }
  } catch (error) {
    console.error(`[Farcaster Profile] Error fetching profile for FID ${fid}:`, error)
    return null
  }
}

/**
 * Fetch multiple Farcaster profiles by FIDs
 * More efficient than fetching one by one
 *
 * @param fids - Array of Farcaster IDs (max 100)
 * @returns Map of FID to profile data
 */
export async function fetchFarcasterProfiles(
  fids: number[]
): Promise<Map<number, FarcasterProfile>> {
  const profiles = new Map<number, FarcasterProfile>()

  if (fids.length === 0) {
    return profiles
  }

  // Neynar API supports up to 100 FIDs per request
  const chunks = []
  for (let i = 0; i < fids.length; i += 100) {
    chunks.push(fids.slice(i, i + 100))
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${chunk.join(',')}`,
        {
          headers: {
            'accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('[Farcaster Profile] API error:', response.status)
        continue
      }

      const data = await response.json()

      if (data.users) {
        for (const user of data.users) {
          const ethAddresses = user.verified_addresses?.eth_addresses || []

          profiles.set(user.fid, {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name || user.username,
            pfpUrl: user.pfp_url || '',
            bio: user.profile?.bio?.text,
            verifiedAddresses: {
              eth: ethAddresses,
            },
          })
        }
      }
    } catch (error) {
      console.error('[Farcaster Profile] Error fetching profiles:', error)
    }
  }

  return profiles
}
