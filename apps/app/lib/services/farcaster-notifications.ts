/**
 * Farcaster Notifications Service
 *
 * Utility for sending notifications to Farcaster Mini App users
 * Spec: https://miniapps.farcaster.xyz/docs/specification#notifications
 */

import { prisma } from "@/lib/prisma"
import type { SendNotificationRequest, SendNotificationResponse } from "@/lib/types/farcaster"

/**
 * Send a notification to specific users by their FIDs
 *
 * @param fids - Array of Farcaster IDs to notify
 * @param notification - Notification content
 * @returns Promise with notification results
 */
export async function sendNotificationToUsers(
  fids: number[],
  notification: {
    notificationId: string // Must be unique for 24 hours for idempotency
    title: string // Max 32 characters
    body: string // Max 128 characters
    targetUrl: string // URL to open when clicked
  }
): Promise<{
  successCount: number
  failureCount: number
  rateLimitedCount: number
  results: Array<{ fid: number; success: boolean; error?: string }>
}> {
  // Validate notification
  if (notification.title.length > 32) {
    throw new Error("Notification title must be max 32 characters")
  }
  if (notification.body.length > 128) {
    throw new Error("Notification body must be max 128 characters")
  }

  // Fetch notification tokens for these FIDs
  const tokens = await prisma.farcasterNotificationToken.findMany({
    where: {
      fid: { in: fids },
      enabled: true,
    },
  })

  if (tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: fids.length,
      rateLimitedCount: 0,
      results: fids.map((fid) => ({
        fid,
        success: false,
        error: "No notification token found",
      })),
    }
  }

  // Group tokens by notification URL (different Farcaster clients)
  const tokensByUrl = tokens.reduce(
    (acc, token) => {
      if (!acc[token.notificationUrl]) {
        acc[token.notificationUrl] = []
      }
      acc[token.notificationUrl].push(token)
      return acc
    },
    {} as Record<string, typeof tokens>
  )

  const results: Array<{ fid: number; success: boolean; error?: string }> = []
  let successCount = 0
  let failureCount = 0
  let rateLimitedCount = 0

  // Send notifications to each client URL
  for (const [notificationUrl, urlTokens] of Object.entries(tokensByUrl)) {
    try {
      const requestBody: SendNotificationRequest = {
        notificationId: notification.notificationId,
        title: notification.title,
        body: notification.body,
        targetUrl: notification.targetUrl,
        tokens: urlTokens.map((t) => t.token),
      }

      const response = await fetch(notificationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        console.error("[Farcaster Notifications] HTTP error:", response.status, response.statusText)
        // Mark all tokens for this URL as failed
        for (const token of urlTokens) {
          results.push({
            fid: token.fid,
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
          failureCount++
        }
        continue
      }

      const responseData = (await response.json()) as SendNotificationResponse

      // Process results for each token
      for (const token of urlTokens) {
        if (responseData.result.successfulTokens.includes(token.token)) {
          // Success - update last notified time
          await prisma.farcasterNotificationToken.update({
            where: { id: token.id },
            data: { lastNotifiedAt: new Date() },
          })

          results.push({ fid: token.fid, success: true })
          successCount++
        } else if (responseData.result.invalidTokens.includes(token.token)) {
          // Invalid token - disable it
          await prisma.farcasterNotificationToken.update({
            where: { id: token.id },
            data: { enabled: false },
          })

          results.push({
            fid: token.fid,
            success: false,
            error: "Token invalidated",
          })
          failureCount++
        } else if (responseData.result.rateLimitedTokens.includes(token.token)) {
          // Rate limited
          results.push({
            fid: token.fid,
            success: false,
            error: "Rate limited",
          })
          rateLimitedCount++
        } else {
          // Unknown status
          results.push({
            fid: token.fid,
            success: false,
            error: "Unknown status",
          })
          failureCount++
        }
      }
    } catch (error) {
      console.error("[Farcaster Notifications] Error sending to", notificationUrl, error)

      // Mark all tokens for this URL as failed
      for (const token of urlTokens) {
        results.push({
          fid: token.fid,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
        failureCount++
      }
    }
  }

  return {
    successCount,
    failureCount,
    rateLimitedCount,
    results,
  }
}

/**
 * Send a notification to all users who have enabled notifications
 *
 * @param notification - Notification content
 * @returns Promise with notification results
 */
export async function broadcastNotification(notification: {
  notificationId: string
  title: string
  body: string
  targetUrl: string
}): Promise<{
  successCount: number
  failureCount: number
  rateLimitedCount: number
}> {
  // Get all enabled tokens
  const tokens = await prisma.farcasterNotificationToken.findMany({
    where: { enabled: true },
    select: { fid: true },
  })

  const fids = tokens.map((t) => t.fid)

  const result = await sendNotificationToUsers(fids, notification)

  return {
    successCount: result.successCount,
    failureCount: result.failureCount,
    rateLimitedCount: result.rateLimitedCount,
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats() {
  const total = await prisma.farcasterNotificationToken.count()
  const enabled = await prisma.farcasterNotificationToken.count({
    where: { enabled: true },
  })
  const disabled = total - enabled

  const recentlyNotified = await prisma.farcasterNotificationToken.count({
    where: {
      enabled: true,
      lastNotifiedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  })

  return {
    total,
    enabled,
    disabled,
    recentlyNotified,
  }
}
