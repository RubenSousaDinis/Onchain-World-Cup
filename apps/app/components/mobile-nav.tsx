"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Calendar, Users, Wallet, BarChart3 } from "lucide-react"

const navItems = [
  { icon: Trophy, label: "Qualify", href: "/qualification" },
  { icon: Calendar, label: "Cup", href: "/tournament" },
  { icon: Users, label: "Leaders", href: "/leaderboard" },
  { icon: BarChart3, label: "Stats", href: "/stats" },
  { icon: Wallet, label: "Votes", href: "/my-bets" },
]

export function MobileNav() {
  const pathname = usePathname()

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
        </div>
      </nav>
    </>
  )
}
