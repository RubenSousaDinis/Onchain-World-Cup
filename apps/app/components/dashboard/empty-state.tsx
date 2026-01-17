import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon className="w-12 h-12 text-accent/50 mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-muted-foreground mb-1 font-bold">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
