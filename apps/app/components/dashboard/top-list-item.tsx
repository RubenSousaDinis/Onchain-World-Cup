import Link from "next/link"
import type { ReactNode } from "react"

interface TopListItemProps {
  rank: number
  icon?: ReactNode
  title: string
  subtitle?: string
  value: string | number
  valueLabel?: string
  href?: string
  highlighted?: boolean
  className?: string
}

export function TopListItem({
  rank,
  icon,
  title,
  subtitle,
  value,
  valueLabel,
  href,
  highlighted = false,
  className = "",
}: TopListItemProps) {
  const content = (
    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-sm hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`text-sm font-bold min-w-[24px] flex-shrink-0 ${highlighted ? "cm-highlight" : "text-muted-foreground"}`}
        >
          #{rank}
        </span>
        {icon && <div className="text-2xl flex-shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className="text-sm font-mono font-bold cm-highlight whitespace-nowrap">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {valueLabel && <span className="text-xs text-muted-foreground whitespace-nowrap">{valueLabel}</span>}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
