import { NextResponse } from "next/server"
import { generateManifest, validateManifest, getManifestConfig } from "@/lib/utils/manifest"

/**
 * GET /api/farcaster/manifest
 *
 * Returns the Farcaster Mini App manifest JSON
 *
 * This endpoint serves as an alternative to the static .well-known/farcaster.json file
 * Use this if you prefer dynamic manifest generation or if your hosting provider
 * doesn't support .well-known directory
 */
export async function GET() {
  try {
    const config = getManifestConfig()
    const manifest = generateManifest(config)

    // Validate manifest before serving
    const errors = validateManifest(manifest)
    if (errors.length > 0) {
      console.error("[Farcaster Manifest] Validation errors:", errors)
      // Log warnings but still serve (in case of placeholder values during dev)
    }

    return NextResponse.json(manifest, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        // CORS headers for Farcaster clients
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[Farcaster Manifest] Error generating manifest:", error)

    return NextResponse.json(
      {
        error: "Failed to generate manifest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
