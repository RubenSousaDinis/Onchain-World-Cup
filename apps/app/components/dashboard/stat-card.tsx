import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  valueColor?: "default" | "accent" | "green" | "red"
  formatValue?: boolean
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = "default",
  formatValue = false,
  className = "",
}: StatCardProps) {
  const iconColors = {
    default: "text-accent",
    accent: "text-accent",
    green: "text-green-500",
    red: "text-red-500",
  }

  const valueColors = {
    default: "cm-highlight",
    accent: "text-accent",
    green: "text-green-500",
    red: "text-red-500",
  }

  const formattedValue =
    formatValue && typeof value === "number" ? value.toLocaleString("en-US") : value

  return (
    <div className={`cm-panel rounded-sm p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColors[valueColor]}`} aria-hidden="true" />
        <div className="text-sm lg:text-base text-muted-foreground uppercase font-bold">{label}</div>
      </div>
      <div className={`text-xl lg:text-2xl font-bold font-mono ${valueColors[valueColor]}`}>
        {formattedValue}
      </div>
    </div>
  )
}
