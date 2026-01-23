import Link from "next/link"
import { Trophy, Home, Users, Calendar, BarChart3, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        {/* Main Error Panel */}
        <div className="cm-panel rounded-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-accent/20 border-b-2 border-accent/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-accent/30 border border-accent/50 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-accent">404 - Page Not Found</h1>
                <p className="text-sm text-foreground/70">Match abandoned due to missing page</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-secondary/50 border border-border rounded-sm p-4">
              <p className="text-foreground/80">
                The page you're looking for has been substituted. It might have been removed, renamed, or didn't
                qualify for the tournament.
              </p>
            </div>

            {/* Error Code Display - Retro Style */}
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-8xl font-bold text-primary/20 mb-2 font-mono">404</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Error: Page Offside</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Panel */}
        <div className="cm-panel rounded-sm overflow-hidden">
          <div className="bg-secondary border-b border-border p-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Quick Navigation</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Link */}
              <Link
                href="/"
                className="cm-button bg-primary/10 hover:bg-primary/20 border border-primary/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Home</div>
                    <div className="text-xs text-foreground/70">Return to dashboard</div>
                  </div>
                </div>
              </Link>

              {/* Qualification Link */}
              <Link
                href="/qualification"
                className="cm-button bg-accent/10 hover:bg-accent/20 border border-accent/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Qualification</div>
                    <div className="text-xs text-foreground/70">Vote for countries</div>
                  </div>
                </div>
              </Link>

              {/* Teams Link */}
              <Link
                href="/teams"
                className="cm-button bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-green-500/20 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Teams</div>
                    <div className="text-xs text-foreground/70">Browse all countries</div>
                  </div>
                </div>
              </Link>

              {/* Leaderboard Link */}
              <Link
                href="/leaderboard"
                className="cm-button bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-orange-500/20 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Leaderboard</div>
                    <div className="text-xs text-foreground/70">View top voters</div>
                  </div>
                </div>
              </Link>

              {/* Schedule Link */}
              <Link
                href="/schedule"
                className="cm-button bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-blue-500/20 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Schedule</div>
                    <div className="text-xs text-foreground/70">Upcoming matches</div>
                  </div>
                </div>
              </Link>

              {/* How It Works Link */}
              <Link
                href="/how-it-works"
                className="cm-button bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 p-4 rounded-sm transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <AlertCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">How It Works</div>
                    <div className="text-xs text-foreground/70">Learn the rules</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Still lost? Head back to the{" "}
            <Link href="/" className="text-primary hover:text-primary/80 underline">
              home page
            </Link>{" "}
            to get back in the game.
          </p>
        </div>
      </div>
    </div>
  )
}
