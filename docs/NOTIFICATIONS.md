# Notification System

This application includes a comprehensive notification system with Championship Manager 01/02 styling. The system provides toast notifications for success, error, warning, and info messages with automatic dismissal and full accessibility support.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Accessibility](#accessibility)
- [Customization](#customization)
- [Best Practices](#best-practices)

## Features

- **Four notification types**: success, error, warning, info
- **Auto-dismiss**: Notifications automatically dismiss after a configurable duration
- **Manual dismiss**: Users can close notifications via the X button
- **Accessibility**: Full ARIA live region support with appropriate politeness levels
- **CM 01/02 styling**: Retro Championship Manager aesthetic with colored borders and icons
- **Animations**: Smooth slide-in animations from the right
- **Stacking**: Multiple notifications stack vertically
- **Type-safe**: Full TypeScript support
- **Hook-based API**: Simple `useNotifications()` hook for easy integration

## Quick Start

### Basic Usage

```tsx
"use client"

import { useNotifications } from "@/components/notifications"

export function MyComponent() {
  const { success, error, warning, info } = useNotifications()

  const handleSuccess = () => {
    success("Vote Submitted", "Your vote has been recorded successfully")
  }

  const handleError = () => {
    error("Transaction Failed", "Unable to process your vote. Please try again.")
  }

  return (
    <div>
      <button onClick={handleSuccess}>Submit Vote</button>
      <button onClick={handleError}>Trigger Error</button>
    </div>
  )
}
```

## API Reference

### `useNotifications()`

The main hook to access the notification system. Must be used within a component tree wrapped by `NotificationProvider`.

**Returns:**

```typescript
{
  notifications: NotificationProps[]
  addNotification: (notification: Omit<NotificationProps, "id" | "onDismiss">) => string
  removeNotification: (id: string) => void
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
}
```

### Helper Methods

#### `success(title, message?, duration?)`

Shows a success notification with a green color scheme and checkmark icon.

- **title** (string): The main heading of the notification
- **message** (string, optional): Additional descriptive text
- **duration** (number, optional): Time in milliseconds before auto-dismiss (default: 5000)
- **Returns**: string - The notification ID

```tsx
const id = success("Vote Recorded", "Your vote for Brazil has been counted", 3000)
```

#### `error(title, message?, duration?)`

Shows an error notification with a red color scheme and X icon. Uses `aria-live="assertive"` for immediate screen reader announcement.

- **title** (string): The main heading of the notification
- **message** (string, optional): Additional descriptive text
- **duration** (number, optional): Time in milliseconds before auto-dismiss (default: 5000)
- **Returns**: string - The notification ID

```tsx
const id = error("Transaction Failed", "Insufficient funds in wallet", 7000)
```

#### `warning(title, message?, duration?)`

Shows a warning notification with a yellow color scheme and triangle icon.

- **title** (string): The main heading of the notification
- **message** (string, optional): Additional descriptive text
- **duration** (number, optional): Time in milliseconds before auto-dismiss (default: 5000)
- **Returns**: string - The notification ID

```tsx
const id = warning("Vote Closing Soon", "Only 5 minutes remaining to vote")
```

#### `info(title, message?, duration?)`

Shows an info notification with an accent color scheme and info icon.

- **title** (string): The main heading of the notification
- **message** (string, optional): Additional descriptive text
- **duration** (number, optional): Time in milliseconds before auto-dismiss (default: 5000)
- **Returns**: string - The notification ID

```tsx
const id = info("New Feature", "Check out the updated match statistics")
```

#### `addNotification(notification)`

Low-level method to add a custom notification with full control.

```tsx
const id = addNotification({
  type: "success",
  title: "Custom Notification",
  message: "This is a custom message",
  duration: 10000
})
```

#### `removeNotification(id)`

Manually dismiss a notification by its ID.

```tsx
const id = success("Processing...")
// Later...
removeNotification(id)
```

## Usage Examples

### Form Submission

```tsx
"use client"

import { useNotifications } from "@/components/notifications"
import { useState } from "react"

export function VoteForm() {
  const { success, error } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await submitVote()
      success("Vote Submitted", "Your vote has been recorded successfully")
    } catch (err) {
      error("Submission Failed", err instanceof Error ? err.message : "Please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isSubmitting}>
        Submit Vote
      </button>
    </form>
  )
}
```

### Async Operations with Progress

```tsx
"use client"

import { useNotifications } from "@/components/notifications"

export function DataLoader() {
  const { info, success, error, removeNotification } = useNotifications()

  const loadData = async () => {
    const loadingId = info("Loading Data", "Please wait while we fetch the latest results")

    try {
      await fetchData()
      removeNotification(loadingId)
      success("Data Loaded", "All results are now up to date")
    } catch (err) {
      removeNotification(loadingId)
      error("Load Failed", "Unable to fetch results. Please refresh the page")
    }
  }

  return <button onClick={loadData}>Refresh Data</button>
}
```

### Blockchain Transaction

```tsx
"use client"

import { useNotifications } from "@/components/notifications"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"

export function VoteButton() {
  const { info, success, error } = useNotifications()
  const { writeContract, data: hash } = useWriteContract()
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash })

  const handleVote = async () => {
    try {
      await writeContract({
        // contract details...
      })
      info("Transaction Submitted", "Waiting for confirmation...")
    } catch (err) {
      error("Transaction Failed", "Unable to submit transaction")
    }
  }

  // Watch for transaction status
  if (isSuccess) {
    success("Vote Confirmed", "Your vote has been recorded on-chain")
  }
  if (isError) {
    error("Transaction Reverted", "Your vote could not be confirmed")
  }

  return <button onClick={handleVote}>Vote Now</button>
}
```

### Custom Duration

```tsx
"use client"

import { useNotifications } from "@/components/notifications"

export function CustomDurationExample() {
  const { success, warning } = useNotifications()

  // Quick notification (2 seconds)
  const showQuick = () => {
    success("Quick Message", "This will disappear quickly", 2000)
  }

  // Persistent notification (30 seconds)
  const showPersistent = () => {
    warning("Important Notice", "This will stay visible longer", 30000)
  }

  // Non-dismissing notification (0 duration = manual dismiss only)
  const showPermanent = () => {
    success("Permanent Message", "Close this manually", 0)
  }

  return (
    <div>
      <button onClick={showQuick}>Quick (2s)</button>
      <button onClick={showPersistent}>Persistent (30s)</button>
      <button onClick={showPermanent}>Manual Only</button>
    </div>
  )
}
```

### Notification IDs for Tracking

```tsx
"use client"

import { useNotifications } from "@/components/notifications"
import { useEffect } from "react"

export function TrackedNotification() {
  const { success, removeNotification } = useNotifications()

  useEffect(() => {
    // Show notification and save its ID
    const notificationId = success("Welcome!", "Thanks for visiting our app")

    // Clean up on unmount
    return () => {
      removeNotification(notificationId)
    }
  }, [])

  return <div>My Component</div>
}
```

## Accessibility

The notification system is built with accessibility as a core feature:

### ARIA Live Regions

All notifications use ARIA live regions to announce changes to screen readers:

- **Error notifications**: Use `aria-live="assertive"` for immediate announcement of critical issues
- **Other notifications**: Use `aria-live="polite"` to avoid interrupting the user

### Keyboard Navigation

- All dismiss buttons are keyboard accessible
- Focus visible styles (yellow outline) appear when using keyboard navigation
- Notifications can be dismissed with Enter or Space when focused

### Screen Reader Support

- Each notification has `role="alert"` for proper screen reader identification
- `aria-atomic="true"` ensures the entire notification is read as a single unit
- Icons are marked with `aria-hidden="true"` to avoid redundant announcements
- Dismiss button has `aria-label="Dismiss notification"` for clear purpose

### Visual Accessibility

- Color is not the only indicator - icons provide additional context
- High contrast borders and backgrounds work with Windows High Contrast Mode
- Text meets WCAG AA contrast requirements against backgrounds

## Customization

### Styling

The notification system uses Tailwind CSS and can be customized via the notification component:

```tsx
// apps/app/components/notifications/notification.tsx

const notificationStyles = {
  success: {
    container: "bg-green-500/10 border-green-500/30",
    icon: "text-green-500",
    Icon: CheckCircle2,
  },
  // Modify these to customize appearance
}
```

### Duration Defaults

Change the default auto-dismiss duration (currently 5000ms) in the component:

```tsx
export function Notification({
  duration = 5000,  // Change this default
  // ...
}: NotificationProps) {
```

### Position

Notifications appear in the top-right by default. Change position in the provider:

```tsx
// apps/app/components/notifications/notification-provider.tsx

<div
  className="fixed top-4 right-4 z-[9999]"  // Modify positioning here
  // ...
>
```

Common positions:
- Top-right: `top-4 right-4`
- Top-left: `top-4 left-4`
- Top-center: `top-4 left-1/2 -translate-x-1/2`
- Bottom-right: `bottom-4 right-4`
- Bottom-left: `bottom-4 left-4`

### Maximum Visible Notifications

Currently, all notifications are shown. To limit the number:

```tsx
// In notification-provider.tsx
{notifications.slice(-3).map((notification) => (  // Show last 3 only
  <Notification key={notification.id} {...notification} />
))}
```

## Best Practices

### 1. Use Appropriate Types

Choose the notification type that matches the situation:

- **Success**: Completed actions, confirmations, achievements
- **Error**: Failed operations, validation errors, system errors
- **Warning**: Important notices, upcoming deadlines, non-critical issues
- **Info**: General information, tips, status updates

### 2. Keep Messages Concise

```tsx
// Good
success("Vote Recorded")
error("Transaction Failed", "Insufficient funds")

// Too verbose
success("Your Vote Has Been Successfully Recorded Into Our Database System")
```

### 3. Provide Context in Messages

```tsx
// Good
error("Transaction Failed", "Insufficient ETH balance in wallet")

// Too vague
error("Error", "Something went wrong")
```

### 4. Use Appropriate Durations

```tsx
// Quick info - 2-3 seconds
info("Copied to clipboard", undefined, 2000)

// Standard notifications - 5 seconds (default)
success("Vote submitted")

// Important warnings - 7-10 seconds
warning("Voting ends soon", "Only 2 minutes remaining", 8000)

// Critical errors - longer or manual dismiss
error("Connection Lost", "Please check your internet connection", 15000)
```

### 5. Avoid Notification Spam

```tsx
// Bad - creates multiple notifications
for (const item of items) {
  success(`Processed ${item}`)
}

// Good - single summary notification
success("Batch Complete", `Processed ${items.length} items`)
```

### 6. Handle Async Operations

```tsx
// Good - show progress, then result
const loadingId = info("Loading...")
try {
  await operation()
  removeNotification(loadingId)
  success("Complete!")
} catch {
  removeNotification(loadingId)
  error("Failed!")
}

// Bad - notification appears before operation completes
success("Saved!")
await saveData()  // What if this fails?
```

### 7. Don't Replace System Dialogs

Notifications are for non-blocking feedback. For critical confirmations, use dialogs:

```tsx
// Bad - important destructive action
const handleDelete = () => {
  deleteAllData()
  success("All data deleted")
}

// Good - use a confirmation dialog
const handleDelete = () => {
  if (confirm("Delete all data? This cannot be undone.")) {
    deleteAllData()
    success("All data deleted")
  }
}
```

### 8. Consider Mobile Users

- Keep titles short (they're more visible than messages on small screens)
- Test notification positioning on mobile devices
- Ensure touch targets are large enough for easy dismissal

### 9. Test Accessibility

Always test notifications with:
- Keyboard navigation (Tab, Enter, Space)
- Screen readers (NVDA, JAWS, VoiceOver)
- High contrast mode
- Zoom (200%+)

## Integration with the App

The notification system is integrated into the app layout at `apps/app/app/layout.tsx`:

```tsx
<NotificationProvider>
  {children}
</NotificationProvider>
```

This makes the `useNotifications()` hook available throughout the entire application.

## Troubleshooting

### "useNotifications must be used within a NotificationProvider"

**Cause**: Attempting to use `useNotifications()` outside the provider context.

**Solution**: Ensure your component is rendered within the app that has `NotificationProvider` in the layout.

### Notifications Not Appearing

**Checklist**:
1. Is the component using `"use client"` directive?
2. Is the notification being triggered (check console)?
3. Is the notification container visible (check z-index conflicts)?
4. Are there any CSS conflicts hiding the notifications?

### Notifications Not Dismissing

**Cause**: Duration set to 0 or negative value.

**Solution**: Pass a positive duration value or omit for default (5000ms).

### Multiple Notifications Overlapping

**Cause**: Custom CSS affecting the notification container's flex layout.

**Solution**: Check for conflicting styles on the `.fixed.top-4.right-4` container.

## Technical Details

### File Structure

```
apps/app/components/notifications/
├── index.ts                      # Barrel export
├── notification.tsx              # Individual notification component
└── notification-provider.tsx     # Context provider and hook
```

### Dependencies

- React (Context API, hooks)
- Lucide React (icons)
- Tailwind CSS (styling)
- TypeScript (type safety)

### Performance

- Notifications use `useCallback` to prevent unnecessary re-renders
- Auto-dismiss timers are cleaned up on unmount
- Context value is memoized to prevent cascading updates

## Future Enhancements

Potential improvements for future versions:

- [ ] Queue system for limiting simultaneous notifications
- [ ] Sound effects for different notification types
- [ ] Swipe-to-dismiss on mobile
- [ ] Notification history/log
- [ ] Progress bar showing remaining time
- [ ] Grouped notifications (collapse similar messages)
- [ ] Custom icons and colors per notification
- [ ] Pause auto-dismiss on hover
- [ ] Persist important notifications across page navigation
