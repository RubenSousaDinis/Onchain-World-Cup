"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, HelpCircle, Wallet, Trophy, BarChart3, Flag } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useFarcaster } from "@/lib/farcaster-provider"

const sidebarItems = [
  { icon: Flag, label: "Countries", href: "/countries" },
  { icon: Trophy, label: "Qualification", href: "/qualification" },
  { icon: Calendar, label: "Tournament", href: "/tournament" },
  { icon: Users, label: "Leaderboard", href: "/leaderboard" },
  { icon: BarChart3, label: "Statistics", href: "/stats" },
  { icon: Wallet, label: "My Votes", href: "/my-bets" },
  { icon: HelpCircle, label: "How it Works", href: "/how-it-works" },
]

export function RetroSidebar() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  return (
    <div
      className="cm-sidebar fixed left-0 top-0 h-screen w-24 border-r border-border lg:flex hidden flex-col items-center py-6 gap-6"
      role="navigation"
      aria-label="Main sidebar navigation"
    >
      {/* Logo/Brand */}
      <Link href="/" className="flex flex-col items-center gap-2" aria-label="Go to home">
        <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Onchain World Cup logo" className="w-full h-full object-contain p-1" />
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
            onClick={() => connect({ connector: connectors[0] })}
            className="cm-nav-tab px-3 py-2 rounded-sm text-xs font-bold w-full"
            aria-label="Connect wallet"
          >
            <Wallet className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
            <div className="text-xs">CONNECT</div>
          </button>
        ) : isConnected ? (
          <button
            onClick={() => !isFrameContext && disconnect()}
            disabled={isFrameContext}
            className="bg-accent text-accent-foreground px-2 py-2 rounded-sm text-xs font-bold w-full disabled:opacity-70"
            aria-label={`Disconnect wallet ${address?.slice(0, 6)}...${address?.slice(-4)}`}
          >
            <div className="truncate">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-xs opacity-70">{chain?.name || "Connected"}</div>
          </button>
        ) : isAutoConnecting ? (
          <div className="text-center text-xs text-muted-foreground px-2 py-2" role="status" aria-live="polite">
            <div>Connecting...</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
