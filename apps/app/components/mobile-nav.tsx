"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Calendar, Users, Wallet, BarChart3, Flag } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useFarcaster } from "@/lib/farcaster-provider"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Flag, label: "Countries", href: "/countries" },
  { icon: Trophy, label: "Qualify", href: "/qualification" },
  { icon: Users, label: "Leaders", href: "/leaderboard" },
  { icon: BarChart3, label: "Stats", href: "/stats" },
  { icon: Wallet, label: "Votes", href: "/my-bets" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 cm-sidebar border-t border-border mobile-nav-safe"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
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
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-sm transition-colors min-w-[44px] ${
                  isActive ? "bg-primary text-primary-foreground" : "text-sidebar-text"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Wallet Connection Button */}
          {!isFrameContext && !isConnected && !isAutoConnecting ? (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-sm transition-colors min-w-[44px] cm-nav-tab"
              aria-label="Connect wallet"
            >
              <Wallet className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">Connect</span>
            </button>
          ) : isConnected ? (
            <button
              onClick={() => !isFrameContext && disconnect()}
              disabled={isFrameContext}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-sm transition-colors min-w-[44px] bg-accent text-accent-foreground disabled:opacity-70"
              aria-label={`Disconnect wallet ${address?.slice(0, 6)}...${address?.slice(-4)}`}
            >
              <Wallet className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium truncate max-w-[60px]">
                {address?.slice(0, 4)}...{address?.slice(-2)}
              </span>
            </button>
          ) : isAutoConnecting ? (
            <div className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground" role="status" aria-live="polite">
              <Wallet className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">Connecting...</span>
            </div>
          ) : null}
        </div>
      </nav>
    </>
  )
}
