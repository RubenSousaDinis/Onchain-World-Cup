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

    // Use Warpcast API - free and no authentication required
    const url = `https://client.warpcast.com/v2/user-by-fid?fid=${fid}`
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

    if (!data.result || !data.result.user) {
      console.warn(`[Farcaster Profile] No user found for FID ${fid}`)
      return null
    }

    const user = data.result.user
    console.log(`[Farcaster Profile] Found user:`, {
      fid: user.fid,
      username: user.username,
      pfp: user.pfp?.url,
      verifiedAddresses: user.verifiedAddresses,
    })

    // Extract verified Ethereum addresses
    const ethAddresses = user.verifiedAddresses?.eth_addresses ||
                         user.verifiedAddresses?.ethAddresses ||
                         []

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName || user.username,
      pfpUrl: user.pfp?.url || '',
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
 * Fetches profiles in parallel using Warpcast API
 *
 * @param fids - Array of Farcaster IDs
 * @returns Map of FID to profile data
 */
export async function fetchFarcasterProfiles(
  fids: number[]
): Promise<Map<number, FarcasterProfile>> {
  const profiles = new Map<number, FarcasterProfile>()

  if (fids.length === 0) {
    return profiles
  }

  console.log(`[Farcaster Profile] Fetching ${fids.length} profiles in parallel...`)

  // Fetch all profiles in parallel using Warpcast API (free, no auth required)
  const fetchPromises = fids.map(async (fid) => {
    try {
      const profile = await fetchFarcasterProfile(fid)
      if (profile) {
        return { fid, profile }
      }
      return null
    } catch (error) {
      console.error(`[Farcaster Profile] Error fetching FID ${fid}:`, error)
      return null
    }
  })

  const results = await Promise.all(fetchPromises)

  // Build map from successful results
  for (const result of results) {
    if (result) {
      profiles.set(result.fid, result.profile)
    }
  }

  console.log(`[Farcaster Profile] Successfully fetched ${profiles.size}/${fids.length} profiles`)

  return profiles
}
