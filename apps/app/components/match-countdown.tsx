"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface MatchCountdownProps {
  endTime: number // Unix timestamp
  phase: "linear" | "exponential"
}

export function MatchCountdown({ endTime, phase }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const difference = endTime - now

      if (difference > 0) {
        return {
          total: difference,
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  const getPhaseColor = () => {
    if (timeLeft.total <= 3600000) return "text-red-400" // Last hour - red
    if (phase === "exponential") return "text-orange-400" // Phase 2 - orange
    return "text-green-400" // Phase 1 - green
  }

  const getUrgencyMessage = () => {
    if (timeLeft.total <= 3600000) return "FINAL HOUR!"
    if (timeLeft.total <= 7200000) return "Hurry! 2 hours left"
    if (phase === "exponential") return "Prices rising fast"
    return "Early bird pricing"
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-card/90 px-3 py-2 rounded-sm border-2 border-accent/50">
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${getPhaseColor()}`} />
        <span className="text-xs text-muted-foreground">Voting ends in</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`font-mono font-bold text-lg ${getPhaseColor()}`}>
          {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <span className={`text-xs font-bold uppercase ${getPhaseColor()}`}>{getUrgencyMessage()}</span>
      </div>
    </div>
  )
}
