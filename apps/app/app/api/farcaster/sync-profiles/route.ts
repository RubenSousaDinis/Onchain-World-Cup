import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchFarcasterProfiles } from '@/lib/services/farcaster-profile'

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

    // Get all notification tokens with FIDs
    const tokens = await prisma.farcasterNotificationToken.findMany({
      where: {
        enabled: true,
      },
      select: {
        fid: true,
        walletAddress: true,
      },
    })

    if (tokens.length === 0) {
      console.log('[Farcaster Sync] No tokens found')
      return NextResponse.json({
        success: true,
        message: 'No users to sync',
        synced: 0,
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
