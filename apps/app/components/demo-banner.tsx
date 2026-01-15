"use client"

import { Info, X } from "lucide-react"
import { useState } from "react"

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b-2 border-primary/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold text-primary">Demo Mode:</span>{" "}
              <span className="text-foreground/90">
                This app is currently in demo for feedback only. The Qualification Phase launches{" "}
                <span className="font-bold text-accent">mid-February 2026</span>.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-primary/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>
        </div>
      </div>
    </div>
  )
}
