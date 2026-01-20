"use client"

export function SupporterBadge({ type }: { type: "founding" | "early" }) {
  if (type === "founding") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-sm">
        <span className="text-sm font-bold tracking-wide">🏆 FOUNDING SUPPORTER</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm">
      <span className="text-sm font-bold tracking-wide">⚡ EARLY QUALIFICATION INSIDER</span>
    </div>
  )
}
