"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Trophy, Calendar, Users, Wallet, Info, User } from "lucide-react"
import { useAccount } from "wagmi"
import { modal } from "@/lib/reown-config"
import { useFarcaster } from "@/lib/farcaster-provider"

const navItems = [
  { icon: null, label: "Home", href: "/", isLogo: true },
  { icon: Trophy, label: "Qualification", href: "/qualification" },
  { icon: Calendar, label: "Tournament", href: "/tournament" },
  { icon: Users, label: "Leaderboard", href: "/leaderboard" },
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Info, label: "How It Works", href: "/how-it-works" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const open = () => modal.open()
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 cm-sidebar border-t border-border mobile-nav-safe overflow-visible"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 h-14 relative">
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
                className={`group relative flex flex-col items-center justify-center gap-0 min-h-[44px] min-w-[44px] px-3 rounded-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-text hover:bg-secondary hover:text-secondary-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.isLogo ? (
                  <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center overflow-hidden pointer-events-none shrink-0">
                    <Image src="/logo.jpg" alt="Onchain World Cup logo" width={24} height={24} priority className="w-full h-full object-contain p-0.5" />
                  </div>
                ) : (
                  Icon && <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                )}
                <span className="text-xs font-medium text-center leading-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Login button — only when not connected and not inside Farcaster/Base App */}
          {!isFrameContext && !isConnected && !isAutoConnecting && (
            <button
              onClick={() => open()}
              className="group relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-sm transition-colors cm-nav-tab"
              aria-label="Login"
            >
              <Wallet className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs font-medium text-center leading-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                LOGIN
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
