import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  variant?: "default" | "primary" | "disabled"
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  variant = "default",
  onClick,
  className = "",
}: QuickActionCardProps) {
  const variantStyles = {
    default: {
      container: "bg-secondary/20 hover:bg-secondary/40",
      icon: "text-muted-foreground",
      title: "text-foreground",
      disabled: false,
    },
    primary: {
      container: "bg-accent/10 border border-accent/30 hover:bg-accent/20",
      icon: "text-accent",
      title: "cm-highlight",
      disabled: false,
    },
    disabled: {
      container: "bg-secondary/20 opacity-50 cursor-not-allowed",
      icon: "text-muted-foreground",
      title: "text-foreground",
      disabled: true,
    },
  }

  const styles = variantStyles[variant]

  const content = (
    <>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${styles.icon}`} aria-hidden="true" />
        <h4 className={`text-sm lg:text-base font-bold ${styles.title}`}>{title}</h4>
      </div>
      <p className="text-sm lg:text-base text-muted-foreground">{description}</p>
    </>
  )

  if (styles.disabled) {
    return (
      <div
        className={`block p-4 rounded-sm transition-colors ${styles.container} ${className}`}
        onClick={(e) => e.preventDefault()}
        aria-disabled="true"
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`block p-4 rounded-sm transition-colors ${styles.container} ${className}`}
      onClick={onClick}
    >
      {content}
    </Link>
  )
}
