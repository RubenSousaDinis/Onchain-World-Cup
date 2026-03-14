"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg">
        <div className="cm-panel rounded-sm overflow-hidden">
          <div className="bg-red-500/20 border-b-2 border-red-500/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-red-500/30 border border-red-500/50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400">Match Error</h1>
                <p className="text-sm text-foreground/70">Something went wrong on the pitch</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-secondary/50 border border-border rounded-sm p-4">
              <p className="text-foreground/80">
                An unexpected error occurred. Try refreshing the page or head back to the home page.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 cm-button bg-primary/10 hover:bg-primary/20 border border-primary/30 px-4 py-3 rounded-sm transition-colors flex-1 justify-center"
              >
                <RefreshCw className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">Try Again</span>
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 cm-button bg-secondary hover:bg-secondary/80 border border-border px-4 py-3 rounded-sm transition-colors flex-1 justify-center"
              >
                <Home className="w-4 h-4 text-foreground/70" />
                <span className="font-bold text-foreground">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
