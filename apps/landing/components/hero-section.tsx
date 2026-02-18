import { Button } from "./ui/button"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.onchainworldcup.xyz"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">Onchain World Cup</h1>
          <p className="mb-4 text-2xl font-semibold text-primary md:text-3xl">World Cup 2026 Qualification Now Open</p>
          <p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Early supporters shape the tournament.
            <br />
            Back your country with ETH. Top 48 qualify.
            <br />
            Vote now and be first to support your nation.
          </p>

          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Testnet live now — Mainnet launching late March 2026
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-accent"
              asChild
            >
              <a href={appUrl}>Vote Now</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary px-8 py-6 text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all"
              asChild
            >
              <a href="#timeline">View Timeline</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
