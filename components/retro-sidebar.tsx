"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Calendar, Users, HelpCircle, Wallet, Shield } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useFarcaster } from "@/lib/farcaster-provider"

const sidebarItems = [
  { icon: Trophy, label: "Matches", href: "/" },
  { icon: Shield, label: "Teams", href: "/teams" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: Users, label: "Leaderboard", href: "/leaderboard" },
  { icon: Wallet, label: "My Bets", href: "/my-bets" },
  { icon: HelpCircle, label: "How it Works", href: "/how-it-works" },
]

export function RetroSidebar() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  return (
    <div className="cm-sidebar fixed left-0 top-0 h-screen w-24 border-r border-border lg:flex hidden flex-col items-center py-6 gap-6">
      {/* Logo/Brand */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center">
          <Trophy className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="text-[10px] text-center leading-tight">
          <div className="cm-highlight">CRYPTO</div>
          <div className="text-sidebar-text text-[9px]">WORLD CUP</div>
        </div>
      </div>

      {/* Date/Time Display (retro style) */}
      <div className="text-[10px] text-center border border-border px-2 py-1.5 rounded-sm bg-card">
        <div className="text-accent font-bold">2026</div>
        <div className="text-muted-foreground text-[9px]">WORLD CUP</div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3 w-full px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-text hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium text-center leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="w-full px-2">
        {!isFrameContext && !isConnected ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="cm-nav-tab px-3 py-2 rounded-sm text-[10px] font-bold w-full"
          >
            <Wallet className="w-4 h-4 mx-auto mb-1" />
            <div>CONNECT</div>
          </button>
        ) : isConnected ? (
          <button
            onClick={() => !isFrameContext && disconnect()}
            disabled={isFrameContext}
            className="bg-accent text-accent-foreground px-2 py-2 rounded-sm text-[9px] font-bold w-full disabled:opacity-70"
          >
            <div className="truncate">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-[8px] opacity-70">{chain?.name || "Connected"}</div>
          </button>
        ) : isAutoConnecting ? (
          <div className="text-center text-[9px] text-muted-foreground px-2 py-2">
            <div>Connecting...</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
