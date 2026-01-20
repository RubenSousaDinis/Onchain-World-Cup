"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { QUALIFICATION_OPEN_DATE } from "@/lib/constants"

interface CountdownTimerLargeProps {
  targetDate?: Date
  title?: string
}

export function CountdownTimerLarge({
  targetDate = QUALIFICATION_OPEN_DATE,
  title = "Qualification Opens In",
}: CountdownTimerLargeProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return null
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className="cm-panel p-6 text-center">
        <div className="cm-highlight text-2xl font-bold">QUALIFICATION IS LIVE!</div>
      </div>
    )
  }

  return (
    <div className="cm-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-accent" />
        <h3 className="font-bold uppercase tracking-wide">{title}</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div className="cm-highlight text-3xl lg:text-4xl font-bold mb-1">
              {value.toString().padStart(2, "0")}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground uppercase">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
