"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, Wallet, Shield, HelpCircle } from "lucide-react"

const navItems = [
  { icon: Calendar, label: "Cup", href: "/tournament" },
  { icon: Shield, label: "Teams", href: "/teams" },
  { icon: Users, label: "Leaders", href: "/leaderboard" },
  { icon: Wallet, label: "My Bets", href: "/my-bets" },
  { icon: HelpCircle, label: "How", href: "/how-it-works" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 cm-sidebar border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-sidebar-text"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
