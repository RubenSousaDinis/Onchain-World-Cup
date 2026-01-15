import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="cm-panel rounded-sm p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="cm-panel rounded-sm border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/40 border-b-2 border-accent/30">
            <th className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></th>
            <th className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></th>
            <th className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              <td className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></td>
              <td className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></td>
              <td className="p-3"><div className="h-4 bg-muted rounded animate-pulse"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />
}

export function InlineLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}
