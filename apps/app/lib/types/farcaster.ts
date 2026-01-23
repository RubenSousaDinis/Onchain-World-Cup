/**
 * Farcaster Mini App Types
 * Based on: https://miniapps.farcaster.xyz/docs/specification
 */

/**
 * JSON Farcaster Signature format
 */
export interface FarcasterSignature {
  header: string // base64url encoded
  payload: string // base64url encoded
  signature: string // base64url encoded
}

/**
 * Notification details provided by Farcaster clients
 */
export interface MiniAppNotificationDetails {
  url: string // The URL to POST notifications to
  token: string // Authentication token for notifications
}

/**
 * Header information from Farcaster signature
 */
export interface FarcasterSignatureHeader {
  fid: number // Farcaster ID of the user
  type: 'custody' | 'auth'
  key: string // Public key used for signing
}

/**
 * Webhook event: miniapp_added
 * Sent when a user adds the Mini App
 */
export interface MiniAppAddedEvent {
  event: 'miniapp_added'
  notificationDetails?: MiniAppNotificationDetails
}

/**
 * Webhook event: miniapp_removed
 * Sent when a user removes the Mini App
 */
export interface MiniAppRemovedEvent {
  event: 'miniapp_removed'
}

/**
 * Webhook event: notifications_enabled
 * Sent when a user enables notifications
 */
export interface NotificationsEnabledEvent {
  event: 'notifications_enabled'
  notificationDetails: MiniAppNotificationDetails
}

/**
 * Webhook event: notifications_disabled
 * Sent when a user disables notifications
 */
export interface NotificationsDisabledEvent {
  event: 'notifications_disabled'
}

/**
 * Union of all webhook event payloads
 */
export type FarcasterWebhookPayload =
  | MiniAppAddedEvent
  | MiniAppRemovedEvent
  | NotificationsEnabledEvent
  | NotificationsDisabledEvent

/**
 * Webhook request body (signed event)
 */
export interface FarcasterWebhookRequest extends FarcasterSignature {
  // The header, payload, and signature are inherited from FarcasterSignature
  // When decoded, payload contains a FarcasterWebhookPayload
}

/**
 * Notification request to send to users
 */
export interface SendNotificationRequest {
  notificationId: string // Unique ID for idempotency (valid 24 hours)
  title: string // Notification title (max 32 characters)
  body: string // Notification body (max 128 characters)
  targetUrl: string // URL to open when notification is clicked
  tokens: string[] // List of notification tokens for users to notify
}

/**
 * Response from notification API
 */
export interface SendNotificationResponse {
  result: {
    successfulTokens: string[] // Tokens that were successfully notified
    invalidTokens: string[] // Tokens that are no longer valid
    rateLimitedTokens: string[] // Tokens that hit rate limits
  }
}

/**
 * Notification launch context
 * Set in SDK context when user opens app from notification
 */
export interface NotificationLaunchContext {
  type: 'notification'
  notification: {
    notificationId: string
    title: string
    body: string
  }
}
