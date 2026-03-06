"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  endDate?: Date
  initialTime?: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  showSeconds?: boolean
  className?: string
}

function computeTimeLeft(end: Date) {
  const diffSecs = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
  return {
    days: Math.floor(diffSecs / 86400),
    hours: Math.floor((diffSecs % 86400) / 3600),
    minutes: Math.floor((diffSecs % 3600) / 60),
    seconds: diffSecs % 60,
  }
}

export function CountdownTimer({
  endDate,
  initialTime = { days: 0, hours: 0, minutes: 0, seconds: 0 },
  showSeconds = true,
  className = "",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    endDate ? computeTimeLeft(endDate) : initialTime
  )

  useEffect(() => {
    if (endDate) {
      setTimeRemaining(computeTimeLeft(endDate))
      const timer = setInterval(() => setTimeRemaining(computeTimeLeft(endDate)), 1000)
      return () => clearInterval(timer)
    }

    // Fallback: count down from initialTime
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        let { days, hours, minutes, seconds } = prev
        // Guard: already at zero, don't go negative
        if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
          clearInterval(timer)
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; days-- }
        if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
          clearInterval(timer)
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  const timeUnits = [
    { value: timeRemaining.days, label: "DAYS" },
    { value: timeRemaining.hours, label: "HRS" },
    { value: timeRemaining.minutes, label: "MIN" },
    ...(showSeconds ? [{ value: timeRemaining.seconds, label: "SEC" }] : []),
  ]

  return (
    <div className={`flex gap-2 lg:gap-4 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2 lg:gap-4">
          {index > 0 && <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>}
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold cm-highlight">{unit.value}</div>
            <div className="text-sm lg:text-base text-muted-foreground">{unit.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
