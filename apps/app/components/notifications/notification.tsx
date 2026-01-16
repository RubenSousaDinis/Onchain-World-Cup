"use client"

import { useEffect } from "react"
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface NotificationProps {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  onDismiss: (id: string) => void
}

const notificationStyles = {
  success: {
    container: "bg-green-500/10 border-green-500/30",
    icon: "text-green-500",
    Icon: CheckCircle2,
  },
  error: {
    container: "bg-destructive/10 border-destructive/30",
    icon: "text-destructive",
    Icon: XCircle,
  },
  warning: {
    container: "bg-yellow-500/10 border-yellow-500/30",
    icon: "text-yellow-500",
    Icon: AlertTriangle,
  },
  info: {
    container: "bg-accent/10 border-accent/30",
    icon: "text-accent",
    Icon: Info,
  },
}

export function Notification({ id, type, title, message, duration = 5000, onDismiss }: NotificationProps) {
  const style = notificationStyles[type]
  const Icon = style.Icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  return (
    <div
      className={`
        cm-panel rounded-sm border-2 p-4 shadow-lg
        animate-in slide-in-from-right-full duration-300
        ${style.container}
      `}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold cm-highlight">{title}</h4>
          {message && <p className="text-xs text-muted-foreground mt-1">{message}</p>}
        </div>

        <button
          onClick={() => onDismiss(id)}
          className="
            flex-shrink-0 p-1 rounded-sm
            text-muted-foreground hover:text-foreground
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          "
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
