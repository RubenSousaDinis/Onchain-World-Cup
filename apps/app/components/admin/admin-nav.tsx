"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/contracts", label: "Contracts" },
  { href: "/admin/qualification", label: "Qualification" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-border/30 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`cm-nav-tab px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-[var(--cm-highlight)] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
