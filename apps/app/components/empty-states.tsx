import { Search, Vote, Trophy, Inbox, AlertCircle } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="cm-panel rounded-sm p-12 text-center">
      <div className="max-w-sm mx-auto space-y-4">
        {icon && <div className="flex justify-center text-muted-foreground">{icon}</div>}
        <h3 className="text-xl font-bold cm-highlight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && (
          <div className="pt-2">
            {action.href ? (
              <Link
                href={action.href}
                className="cm-nav-tab px-6 py-2 font-bold inline-block"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="cm-nav-tab px-6 py-2 font-bold"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function NoVotesEmpty() {
  return (
    <EmptyState
      icon={<Vote className="w-16 h-16" />}
      title="No Votes Yet"
      description="You haven't placed any votes yet. Start supporting your favorite countries to qualify for the tournament!"
      action={{
        label: "Browse Countries",
        href: "/qualification"
      }}
    />
  )
}

export function NoMatchesEmpty() {
  return (
    <EmptyState
      icon={<Trophy className="w-16 h-16" />}
      title="No Matches Found"
      description="There are no matches available right now. Check back soon for upcoming matches!"
    />
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="No Results Found"
      description={`No countries found matching "${query}". Try a different search term.`}
    />
  )
}

export function NoClaimablePayouts() {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title="No Claimable Payouts"
      description="You don't have any payouts to claim right now. Keep voting and you might win!"
      action={{
        label: "View Active Votes",
        href: "/my-bets"
      }}
    />
  )
}

export function NoLeaderboardData() {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16" />}
      title="No Data Available"
      description="Leaderboard data is not available yet. Start voting to appear on the leaderboard!"
    />
  )
}
