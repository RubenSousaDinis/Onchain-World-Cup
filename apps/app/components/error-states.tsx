import { AlertTriangle, RefreshCw, XCircle, WifiOff } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  type?: "error" | "warning" | "offline"
}

export function ErrorState({ title, message, onRetry, type = "error" }: ErrorStateProps) {
  const Icon = type === "offline" ? WifiOff : type === "warning" ? AlertTriangle : XCircle

  return (
    <div className="cm-panel rounded-sm p-8 text-center border-2 border-destructive/30">
      <Icon className={`w-12 h-12 mx-auto mb-4 ${
        type === "offline" ? "text-muted-foreground" :
        type === "warning" ? "text-yellow-500" :
        "text-destructive"
      }`} />
      {title && <h3 className="text-lg font-bold cm-highlight mb-2">{title}</h3>}
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="cm-nav-tab px-6 py-2 font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

export function PageError({ message = "Something went wrong", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Oops!"
        message={message}
        onRetry={onRetry}
      />
    </div>
  )
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 flex items-start gap-2">
      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-sm text-destructive-foreground">{message}</p>
    </div>
  )
}

export function WarningBanner({ message }: { message: string }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-3 flex items-start gap-2">
      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground">{message}</p>
    </div>
  )
}
