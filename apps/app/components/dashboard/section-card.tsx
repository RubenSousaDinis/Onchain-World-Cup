import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface SectionCardProps {
  title: string
  children: ReactNode
  headerAction?: {
    label: string
    href: string
  }
  footer?: ReactNode
  className?: string
}

export function SectionCard({ title, children, headerAction, footer, className = "" }: SectionCardProps) {
  return (
    <div className={`cm-panel rounded-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center justify-between">
        <h3 className="text-sm font-bold cm-highlight uppercase">{title}</h3>
        {headerAction && (
          <Link
            href={headerAction.href}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-bold"
          >
            {headerAction.label}
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>

      {/* Footer */}
      {footer && <div className="p-4 border-t border-border">{footer}</div>}
    </div>
  )
}
