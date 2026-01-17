import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface InfoBannerProps {
  icon: LucideIcon
  title: string
  description: string | ReactNode
  variant?: "default" | "accent" | "warning" | "success"
  action?: ReactNode
  className?: string
}

export function InfoBanner({
  icon: Icon,
  title,
  description,
  variant = "default",
  action,
  className = "",
}: InfoBannerProps) {
  const variantStyles = {
    default: {
      container: "border-accent/30 bg-accent/10",
      icon: "text-accent",
      title: "cm-highlight",
    },
    accent: {
      container: "border-accent/30 bg-accent/10",
      icon: "text-accent",
      title: "cm-highlight",
    },
    warning: {
      container: "border-yellow-500/30 bg-yellow-500/10",
      icon: "text-yellow-500",
      title: "text-yellow-500",
    },
    success: {
      container: "border-green-500/30 bg-green-500/10",
      icon: "text-green-500",
      title: "text-green-500",
    },
  }

  const styles = variantStyles[variant]

  return (
    <div className={`cm-panel rounded-sm border-2 overflow-hidden ${styles.container} ${className}`}>
      <div className="p-4 lg:p-6">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} aria-hidden="true" />
          <div className="flex-1">
            <h3 className={`text-sm font-bold mb-2 ${styles.title}`}>{title}</h3>
            <div className="text-xs text-foreground/80 mb-3">{description}</div>
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
