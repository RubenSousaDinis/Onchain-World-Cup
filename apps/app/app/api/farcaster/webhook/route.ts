import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type {
  FarcasterWebhookRequest,
  FarcasterWebhookPayload,
  FarcasterSignatureHeader,
} from "@/lib/types/farcaster"

/**
 * POST /api/farcaster/webhook
 *
 * Handles webhook events from Farcaster clients:
 * - miniapp_added: User adds the Mini App
 * - miniapp_removed: User removes the Mini App
 * - notifications_enabled: User enables notifications
 * - notifications_disabled: User disables notifications
 *
 * Spec: https://miniapps.farcaster.xyz/docs/specification#server-events
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the signed webhook request
    const body = (await request.json()) as FarcasterWebhookRequest

    // Decode header and payload from base64url
    const headerJson = Buffer.from(body.header, "base64url").toString("utf-8")
    const payloadJson = Buffer.from(body.payload, "base64url").toString("utf-8")

    const header = JSON.parse(headerJson) as FarcasterSignatureHeader
    const payload = JSON.parse(payloadJson) as FarcasterWebhookPayload

    console.log("[Farcaster Webhook] Received event:", {
      fid: header.fid,
      event: payload.event,
    })

    // TODO: Verify signature using header.key and body.signature
    // For now, we'll trust the webhook (should verify in production)

    // Handle each event type
    switch (payload.event) {
      case "miniapp_added": {
        // User added the Mini App - store notification token
        if (payload.notificationDetails) {
          await prisma.farcasterNotificationToken.upsert({
            where: {
              fid_token: {
                fid: header.fid,
                token: payload.notificationDetails.token,
              },
            },
            create: {
              fid: header.fid,
              notificationUrl: payload.notificationDetails.url,
              token: payload.notificationDetails.token,
              enabled: true,
              miniappAddedAt: new Date(),
            },
            update: {
              notificationUrl: payload.notificationDetails.url,
              enabled: true,
              miniappAddedAt: new Date(),
              updatedAt: new Date(),
            },
          })

          console.log("[Farcaster Webhook] Stored notification token for FID:", header.fid)
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }

      case "miniapp_removed": {
        // User removed the Mini App - invalidate all tokens for this FID
        await prisma.farcasterNotificationToken.updateMany({
          where: { fid: header.fid },
          data: { enabled: false },
        })

        console.log("[Farcaster Webhook] Disabled notifications for FID:", header.fid)
        return NextResponse.json({ success: true }, { status: 200 })
      }

      case "notifications_enabled": {
        // User re-enabled notifications - store new token
        await prisma.farcasterNotificationToken.upsert({
          where: {
            fid_token: {
              fid: header.fid,
              token: payload.notificationDetails.token,
            },
          },
          create: {
            fid: header.fid,
            notificationUrl: payload.notificationDetails.url,
            token: payload.notificationDetails.token,
            enabled: true,
            miniappAddedAt: new Date(),
          },
          update: {
            notificationUrl: payload.notificationDetails.url,
            enabled: true,
            updatedAt: new Date(),
          },
        })

        console.log("[Farcaster Webhook] Re-enabled notifications for FID:", header.fid)
        return NextResponse.json({ success: true }, { status: 200 })
      }

      case "notifications_disabled": {
        // User disabled notifications - mark all tokens as disabled
        await prisma.farcasterNotificationToken.updateMany({
          where: { fid: header.fid },
          data: { enabled: false },
        })

        console.log("[Farcaster Webhook] Disabled notifications for FID:", header.fid)
        return NextResponse.json({ success: true }, { status: 200 })
      }

      default: {
        console.warn("[Farcaster Webhook] Unknown event type:", payload)
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
      }
    }
  } catch (error) {
    console.error("[Farcaster Webhook] Error processing webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
