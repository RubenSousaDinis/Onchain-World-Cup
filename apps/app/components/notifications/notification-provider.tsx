"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Notification, type NotificationProps, type NotificationType } from "./notification"

interface NotificationContextType {
  notifications: NotificationProps[]
  addNotification: (notification: Omit<NotificationProps, "id" | "onDismiss">) => string
  removeNotification: (id: string) => void
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<NotificationProps, "id" | "onDismiss">) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onDismiss: removeNotification,
    }
    setNotifications((prev) => [...prev, newNotification])
    return id
  }, [removeNotification])

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({ type: "success", title, message, duration })
    },
    [addNotification]
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({ type: "error", title, message, duration })
    },
    [addNotification]
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({ type: "warning", title, message, duration })
    },
    [addNotification]
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({ type: "info", title, message, duration })
    },
    [addNotification]
  )

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, success, error, warning, info }}
    >
      {children}

      {/* Notification Container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 lg:px-0"
        aria-live="polite"
        aria-label="Notifications"
      >
        {notifications.map((notification) => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
