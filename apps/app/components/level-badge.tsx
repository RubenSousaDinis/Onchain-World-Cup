"use client"

import * as Tooltip from '@radix-ui/react-tooltip'
import { LEVELS, type Level } from '@/lib/achievements'

interface LevelBadgeProps {
  level: Level
  points: number
  size?: 'sm' | 'md'
  showPoints?: boolean
}

export function LevelBadge({ level, points, size = 'sm', showPoints = false }: LevelBadgeProps) {
  const isSmall = size === 'sm'

  const nextLevel = LEVELS.find(l => l.level === level.level + 1) ?? null
  const progressPct = nextLevel
    ? Math.round(((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100)
    : 100

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          className={`inline-flex items-center gap-1 border rounded-sm font-bold uppercase tracking-wide ${level.borderColor} ${level.color} ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
        >
          <span className={level.textColor}>Lv.{level.level}</span>
          <span className={`${level.textColor} hidden sm:inline`}>{level.name}</span>
          {showPoints && (
            <span className="text-muted-foreground ml-1">{points}pts</span>
          )}
        </span>
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 w-52 cm-panel border border-border rounded-sm shadow-lg p-3 animate-in fade-in-0 zoom-in-95"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Achievement Level
          </p>

          <div className="space-y-1">
            {LEVELS.map(l => {
              const isCurrent = l.level === level.level
              return (
                <div
                  key={l.level}
                  className={`flex items-center justify-between gap-2 px-1.5 py-1 rounded-sm text-xs ${isCurrent ? `${l.color} border ${l.borderColor}` : 'text-muted-foreground'}`}
                >
                  <span className={`font-bold ${isCurrent ? l.textColor : ''}`}>
                    Lv.{l.level} {l.name}
                  </span>
                  <span className={isCurrent ? l.textColor : ''}>
                    {l.maxPoints !== null ? `${l.minPoints}–${l.maxPoints}` : `${l.minPoints}+`} pts
                  </span>
                </div>
              )
            })}
          </div>

          {nextLevel ? (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{points} pts</span>
                <span>{nextLevel.minPoints - points} to {nextLevel.name}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${level.textColor.replace('text-', 'bg-')}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-center font-bold text-yellow-400">
              ★ Max level reached
            </p>
          )}

          <Tooltip.Arrow className="fill-border" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
