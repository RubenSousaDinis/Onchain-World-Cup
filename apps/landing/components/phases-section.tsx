export function PhasesSection() {
  return (
    <section id="phases" className="border-b border-border py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-primary">Tournament Phases</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Season 1 */}
            <div className="rounded-sm border-2 border-primary/30 bg-background p-8">
              <h3 className="mb-6 text-2xl font-bold text-primary">Season 1 — Onchain World Cup</h3>
              <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-accent">Current</p>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-semibold text-primary">Phase 1: Qualification Phase</h4>
                  <ul className="space-y-1 text-sm text-foreground/80">
                    <li>• Testnet live: mid-February 2026</li>
                    <li>• <span className="font-semibold text-primary">Mainnet launch: mid-March 2026</span></li>
                    <li>• Fans vote for national teams with ETH</li>
                    <li>• Linear pricing: 0.001 ETH + (vote count × 0.0005 ETH)</li>
                    <li>• No matches yet - pure fan support</li>
                    <li>• The top 48 teams by vote count qualify</li>
                    <li>• Unified prize pool shared by all qualified country voters</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-primary">Phase 2: Onchain World Cup Tournament</h4>
                  <ul className="space-y-1 text-sm text-foreground/80">
                    <li>• Group stage + knockout rounds</li>
                    <li>• Matches exist only onchain</li>
                    <li>• Community voting decides winners</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-primary">Final</h4>
                  <ul className="space-y-1 text-sm text-foreground/80">
                    <li>• Onchain World Cup Final</li>
                    <li>• Ends 1 week before the real World Cup</li>
                  </ul>
                </div>
              </div>

              <p className="mt-6 border-t border-border pt-4 text-sm italic text-accent">
                The champion is crowned before the first real kick-off.
              </p>
            </div>

            {/* Season 2 */}
            <div className="rounded-sm border-2 border-primary/30 bg-background p-8">
              <h3 className="mb-6 text-2xl font-bold text-primary">Season 2 — Real World Cup</h3>
              <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Coming Next</p>

              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/80">After Season 1 concludes:</p>

                <ul className="space-y-3 text-sm text-foreground/80">
                  <li>• The same mechanics are reused</li>
                  <li>
                    • Teams now match the <span className="font-semibold text-primary">real World Cup tournament</span>
                  </li>
                  <li>• Fans vote as real matches happen</li>
                  <li>• Season 2 starts once the real World Cup begins</li>
                </ul>

                <div className="mt-8 space-y-2 border-t border-border pt-6">
                  <p className="font-semibold text-accent">Season 1 builds the community.</p>
                  <p className="font-semibold text-accent">Season 2 brings it into the real tournament.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
