"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Calendar, Users, Wallet } from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { useFarcaster } from "@/lib/farcaster-provider"

const navItems = [
  { icon: null, label: "Home", href: "/", isLogo: true },
  { icon: Trophy, label: "Qualification", href: "/qualification" },
  { icon: Users, label: "Leaderboard", href: "/leaderboard" },
  { icon: Wallet, label: "My Votes", href: "/my-bets" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { isFrameContext, isAutoConnecting, username, displayName, pfpUrl } = useFarcaster()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 cm-sidebar border-t border-border mobile-nav-safe overflow-visible"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href)) ||
              (item.href === "/tournament" && pathname.startsWith("/matches")) ||
              (item.href === "/leaderboard" && pathname.startsWith("/users"))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col items-center gap-1 py-2 px-3 rounded-sm transition-colors min-w-[44px] ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-text hover:bg-secondary hover:text-secondary-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.isLogo ? (
                  <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center overflow-hidden pointer-events-none">
                    <img src="/logo.png" alt="Onchain World Cup logo" className="w-full h-full object-contain p-0.5" />
                  </div>
                ) : (
                  Icon && <Icon className="w-6 h-6" aria-hidden="true" />
                )}
                <span className="text-xs font-medium text-center leading-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Wallet Connection Button */}
          {!isFrameContext && !isConnected && !isAutoConnecting ? (
            <button
              onClick={() => open()}
              className="group relative flex flex-col items-center gap-1 py-2 px-3 rounded-sm transition-colors min-w-[44px] cm-nav-tab"
              aria-label="Connect wallet"
            >
              <Wallet className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium text-center leading-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                CONNECT
              </span>
            </button>
          ) : isConnected ? (
            <button
              onClick={() => !isFrameContext && disconnect()}
              disabled={isFrameContext}
              className="group relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-sm transition-colors min-w-[44px] bg-accent text-accent-foreground disabled:opacity-70"
              aria-label={
                isFrameContext && username
                  ? `Farcaster user ${username}`
                  : `Disconnect wallet ${address?.slice(0, 6)}...${address?.slice(-4)}`
              }
            >
              {isFrameContext && (pfpUrl || username) ? (
                <>
                  {pfpUrl && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mb-0.5">
                      <img src={pfpUrl} alt={`${username || "User"} profile`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-[10px] font-semibold text-center leading-tight max-w-[60px] truncate">
                    {displayName || username || "User"}
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mb-0.5" aria-hidden="true" />
                  <span className="text-[10px] font-semibold text-center leading-tight">
                    {address?.slice(0, 4)}...{address?.slice(-3)}
                  </span>
                </>
              )}
            </button>
          ) : isAutoConnecting ? (
            <div className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground" role="status" aria-live="polite">
              <Wallet className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium text-center leading-tight opacity-0">Connecting...</span>
            </div>
          ) : null}
        </div>
      </nav>
    </>
  )
}
