import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchFarcasterProfiles } from '@/lib/services/farcaster-profile'

/**
 * Helper function to sync users by FID map
 */
async function syncUsersByFidMap(fidMap: Map<number, string>) {
  const fids = Array.from(fidMap.keys())
  console.log(`[Farcaster Sync] Syncing ${fids.length} FIDs from User table`)

  const profiles = await fetchFarcasterProfiles(fids)
  console.log(`[Farcaster Sync] Fetched ${profiles.size} profiles from Farcaster`)

  let syncedCount = 0
  let skippedCount = 0
  const errors: string[] = []

  for (const [fid, profile] of profiles.entries()) {
    try {
      const walletAddress = fidMap.get(fid)
      if (!walletAddress) {
        skippedCount++
        continue
      }

      // Update user record with profile data
      await prisma.user.update({
        where: { walletAddress },
        data: {
          name: profile.username,
          image: profile.pfpUrl,
        },
      })

      syncedCount++
      console.log(`[Farcaster Sync] Updated FID ${fid} -> ${walletAddress} (@${profile.username})`)
    } catch (error) {
      console.error(`[Farcaster Sync] Error syncing FID ${fid}:`, error)
      errors.push(`FID ${fid}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      skippedCount++
    }
  }

  return NextResponse.json({
    success: true,
    message: `Synced ${syncedCount} profiles, skipped ${skippedCount}`,
    synced: syncedCount,
    skipped: skippedCount,
    total: fids.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}

/**
 * GET /api/farcaster/sync-profiles
 *
 * Check sync status and see how many users need syncing
 */
export async function GET() {
  try {
    const tokens = await prisma.farcasterNotificationToken.findMany({
      select: {
        fid: true,
        walletAddress: true,
        enabled: true,
      },
    })

    const usersWithFid = await prisma.user.findMany({
      where: {
        name: {
          startsWith: 'FID:',
        },
      },
      select: {
        walletAddress: true,
        name: true,
      },
    })

    const usersWithProfiles = await prisma.user.findMany({
      where: {
        name: {
          not: null,
          startsWith: 'FID:',
        },
        NOT: {
          name: {
            startsWith: 'FID:',
          },
        },
      },
      select: {
        walletAddress: true,
        name: true,
        image: true,
      },
      take: 10,
    })

    return NextResponse.json({
      totalTokens: tokens.length,
      enabledTokens: tokens.filter((t) => t.enabled).length,
      usersNeedingSync: usersWithFid.length,
      usersWithProfiles: usersWithProfiles.length,
      sampleUsersNeedingSync: usersWithFid.slice(0, 5).map((u) => ({
        address: u.walletAddress,
        name: u.name,
      })),
      sampleUsersWithProfiles: usersWithProfiles.slice(0, 5).map((u) => ({
        address: u.walletAddress,
        name: u.name,
        hasImage: !!u.image,
      })),
    })
  } catch (error) {
    console.error('[Farcaster Sync] Error checking status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/farcaster/sync-profiles
 *
 * Syncs Farcaster profile data for all users with FIDs
 * This is useful for backfilling profile data for existing users
 *
 * This endpoint can be called manually or via a cron job
 */
export async function POST() {
  try {
    console.log('[Farcaster Sync] Starting profile sync...')

    // Get all notification tokens with FIDs (including disabled ones)
    const tokens = await prisma.farcasterNotificationToken.findMany({
      select: {
        fid: true,
        walletAddress: true,
        enabled: true,
      },
    })

    console.log(`[Farcaster Sync] Found ${tokens.length} total tokens`)

    if (tokens.length === 0) {
      // Also check if there are users with FID in their name
      const usersWithFid = await prisma.user.findMany({
        where: {
          name: {
            startsWith: 'FID:',
          },
        },
        select: {
          walletAddress: true,
          name: true,
        },
      })

      console.log(`[Farcaster Sync] Found ${usersWithFid.length} users with FID in name`)

      if (usersWithFid.length > 0) {
        // Extract FIDs from names and sync
        const fidMap = new Map<number, string>()
        for (const user of usersWithFid) {
          const fidMatch = user.name?.match(/FID:(\d+)/)
          if (fidMatch) {
            const fid = parseInt(fidMatch[1])
            fidMap.set(fid, user.walletAddress)
          }
        }

        if (fidMap.size > 0) {
          return await syncUsersByFidMap(fidMap)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'No users to sync',
        synced: 0,
        debug: {
          tokensFound: tokens.length,
          usersWithFidFound: usersWithFid.length,
        },
      })
    }

    // Get unique FIDs
    const uniqueFids = [...new Set(tokens.map((t) => t.fid))]
    console.log(`[Farcaster Sync] Found ${uniqueFids.length} unique FIDs to sync`)

    // Fetch all profiles
    const profiles = await fetchFarcasterProfiles(uniqueFids)
    console.log(`[Farcaster Sync] Fetched ${profiles.size} profiles from Farcaster`)

    let syncedCount = 0
    let skippedCount = 0

    // Update user records with profile data
    for (const [fid, profile] of profiles.entries()) {
      try {
        if (profile.verifiedAddresses.eth.length === 0) {
          console.log(`[Farcaster Sync] FID ${fid} has no verified ETH addresses, skipping`)
          skippedCount++
          continue
        }

        // Use the first verified Ethereum address
        const walletAddress = profile.verifiedAddresses.eth[0].toLowerCase()

        // Update or create user record
        await prisma.user.upsert({
          where: { walletAddress },
          create: {
            walletAddress,
            name: profile.username,
            image: profile.pfpUrl,
          },
          update: {
            name: profile.username,
            image: profile.pfpUrl,
          },
        })

        // Link the notification token to the wallet address if not already linked
        await prisma.farcasterNotificationToken.updateMany({
          where: {
            fid,
            walletAddress: null,
          },
          data: {
            walletAddress,
          },
        })

        syncedCount++
        console.log(`[Farcaster Sync] Synced FID ${fid} -> ${walletAddress} (@${profile.username})`)
      } catch (error) {
        console.error(`[Farcaster Sync] Error syncing FID ${fid}:`, error)
        skippedCount++
      }
    }

    const result = {
      success: true,
      message: `Synced ${syncedCount} profiles, skipped ${skippedCount}`,
      synced: syncedCount,
      skipped: skippedCount,
      total: uniqueFids.length,
    }

    console.log('[Farcaster Sync] Complete:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Farcaster Sync] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync profiles',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
