"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, Users, HelpCircle, Wallet, Trophy, Flag } from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { useFarcaster } from "@/lib/farcaster-provider"
import { useState } from "react"
import { DisconnectConfirmModal } from "@/components/disconnect-confirm-modal"

const sidebarItems = [
  { icon: Trophy, label: "Qualification", href: "/qualification" },
  { icon: Flag, label: "Teams", href: "/teams" },
  { icon: Calendar, label: "Tournament", href: "/tournament" },
  { icon: Users, label: "Leaderboard", href: "/leaderboard" },
  { icon: Wallet, label: "My Votes", href: "/my-bets" },
  { icon: HelpCircle, label: "How it Works", href: "/how-it-works" },
]

export function RetroSidebar() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { isFrameContext, isAutoConnecting, username, displayName, pfpUrl } = useFarcaster()
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  return (
    <div
      className="cm-sidebar fixed left-0 top-0 h-screen w-24 border-r border-border lg:flex hidden flex-col items-center py-6 gap-6"
      role="navigation"
      aria-label="Main sidebar navigation"
    >
      {/* Logo/Brand */}
      <Link href="/" className="flex flex-col items-center gap-2" aria-label="Go to home">
        <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center overflow-hidden">
          <Image src="/logo.svg" alt="Onchain World Cup logo" width={48} height={48} priority className="w-full h-full object-contain p-1" />
        </div>
        <div className="text-sm text-center leading-tight" aria-hidden="true">
          <div className="cm-highlight">ONCHAIN</div>
          <div className="text-sidebar-text text-xs">WORLD CUP</div>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3 w-full px-2" aria-label="Primary navigation">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href)) ||
            (item.href === "/tournament" && pathname.startsWith("/matches")) || // Matches activate Tournament
            (item.href === "/leaderboard" && pathname.startsWith("/users")) // User pages activate Leaderboard
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-text hover:bg-secondary hover:text-secondary-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="w-full px-2">
        {!isFrameContext && !isConnected ? (
          <button
            onClick={() => open()}
            className="cm-nav-tab px-3 py-2 rounded-sm text-xs font-bold w-full"
            aria-label="Connect wallet"
          >
            <Wallet className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
            <div className="text-xs">CONNECT</div>
          </button>
        ) : isConnected ? (
          <button
            onClick={() => !isFrameContext && setShowDisconnectConfirm(true)}
            disabled={isFrameContext}
            className="bg-accent text-accent-foreground px-2 py-2 rounded-sm text-xs font-bold w-full disabled:opacity-70"
            aria-label={
              isFrameContext && username
                ? `Farcaster user ${username}`
                : `Disconnect wallet ${address?.slice(0, 6)}...${address?.slice(-4)}`
            }
          >
            {isFrameContext && (username || pfpUrl) ? (
              <>
                {pfpUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mx-auto mb-1">
                    <img src={pfpUrl} alt={`${username || "User"} profile`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="truncate">{displayName || username || "Farcaster User"}</div>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
                <div className="truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="text-xs opacity-70">{chain?.name || "Connected"}</div>
              </>
            )}
          </button>
        ) : isAutoConnecting ? (
          <div className="text-center text-xs text-muted-foreground px-2 py-2" role="status" aria-live="polite">
            <div>Connecting...</div>
          </div>
        ) : null}
      </div>
      <DisconnectConfirmModal
        isOpen={showDisconnectConfirm}
        onConfirm={() => { disconnect(); setShowDisconnectConfirm(false) }}
        onCancel={() => setShowDisconnectConfirm(false)}
      />
    </div>
  )
}
