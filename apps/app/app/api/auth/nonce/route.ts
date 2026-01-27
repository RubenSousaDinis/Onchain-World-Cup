import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

/**
 * Generate a cryptographically secure nonce for SIWE authentication
 * This endpoint is called by the frontend before signing the SIWE message
 *
 * SIWE Nonce Requirements:
 * - At least 8 characters
 * - Alphanumeric only (no special characters like +, /, =)
 */
export async function GET() {
  try {
    // Generate alphanumeric nonce (hex encoding is alphanumeric)
    // 16 bytes = 32 hex characters, well above the 8 character minimum
    const nonce = randomBytes(16).toString("hex")

    console.log("[Nonce] Generated nonce:", nonce, "length:", nonce.length)

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error("[Nonce] Error generating nonce:", error)
    return NextResponse.json({ error: "Failed to generate nonce" }, { status: 500 })
  }
}
