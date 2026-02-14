"use client"

import { useFarcaster } from "@/lib/farcaster-provider"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

interface FarcasterUserInfoProps {
  variant?: "default" | "compact" | "badge"
  showFid?: boolean
  showLink?: boolean
  className?: string
}

export function FarcasterUserInfo({
  variant = "default",
  showFid = true,
  showLink = false,
  className = "",
}: FarcasterUserInfoProps) {
  const { isFarcasterMiniApp, fid, username, displayName, pfpUrl, isLoading } = useFarcaster()

  // Don't show if not in Farcaster context or no user data
  if (!isFarcasterMiniApp || isLoading) {
    return null
  }

  // No user data available
  if (!fid && !username) {
    return null
  }

  const profileUrl = username ? `https://farcaster.xyz/${username}` : `https://farcaster.xyz/~/profiles/${fid}`

  // Compact variant - just username and avatar
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {pfpUrl && (
          <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image src={pfpUrl} alt={displayName || username || `FID ${fid}`} width={24} height={24} className="object-cover" />
          </div>
        )}
        <span className="text-sm font-medium truncate">
          {displayName || (username ? `@${username}` : `FID ${fid}`)}
        </span>
        {showLink && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="View Farcaster profile"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    )
  }

  // Badge variant - minimal pill design
  if (variant === "badge") {
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors ${className}`}
      >
        {pfpUrl && (
          <div className="w-4 h-4 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image src={pfpUrl} alt="" width={16} height={16} className="object-cover" />
          </div>
        )}
        <span className="truncate max-w-[120px]">
          {username ? `@${username}` : `FID ${fid}`}
        </span>
      </a>
    )
  }

  // Default variant - full card
  return (
    <div className={`cm-panel p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {pfpUrl && (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={pfpUrl}
              alt={displayName || username || `FID ${fid}`}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {displayName && (
            <div className="font-bold text-base truncate">{displayName}</div>
          )}
          {username && (
            <div className="text-sm text-muted-foreground truncate">
              @{username}
            </div>
          )}
          {showFid && fid && (
            <div className="text-xs text-muted-foreground">FID: {fid}</div>
          )}
        </div>
        {showLink && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cm-nav-tab px-3 py-2 text-xs font-bold flex items-center gap-1 flex-shrink-0"
            aria-label="View Farcaster profile"
          >
            VIEW
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
