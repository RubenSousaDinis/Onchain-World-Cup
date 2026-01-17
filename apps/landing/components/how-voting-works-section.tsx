export function HowVotingWorksSection() {
  return (
    <section className="border-b border-border bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-primary">How Voting Works</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">Votes are made using ETH</p>
            </div>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">Multiple votes per wallet are allowed</p>
            </div>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">Voting fees increase over time</p>
            </div>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">Early participation matters more</p>
            </div>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">Anti-sybil protections are enforced</p>
            </div>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
              <p className="text-foreground font-medium">All logic lives in smart contracts</p>
            </div>
          </div>

          <div className="mt-16 space-y-8">
            <div className="text-center">
              <h3 className="mb-6 text-3xl font-bold text-accent">How to Win ETH</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
                <div className="mb-3 text-4xl font-bold text-primary">1</div>
                <h4 className="mb-2 text-lg font-semibold cm-highlight">Vote Early</h4>
                <p className="text-sm text-muted-foreground">
                  Every vote adds ETH to the prize pool. Vote prices increase as more people participate, so early voters get better prices.
                </p>
              </div>

              <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
                <div className="mb-3 text-4xl font-bold text-primary">2</div>
                <h4 className="mb-2 text-lg font-semibold cm-highlight">Prize Pool Grows</h4>
                <p className="text-sm text-muted-foreground">
                  All ETH from votes goes into the prize pool. The more people vote, the bigger the prize pool becomes for winners.
                </p>
              </div>

              <div className="rounded-sm border-2 border-primary/30 bg-background p-6 text-center">
                <div className="mb-3 text-4xl font-bold text-primary">3</div>
                <h4 className="mb-2 text-lg font-semibold cm-highlight">Winners Share Rewards</h4>
                <p className="text-sm text-muted-foreground">
                  If your country/team wins, you share the prize pool proportionally to your votes. More votes = bigger share of winnings.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-2xl rounded-sm border-2 border-primary/30 bg-card p-6">
              <h4 className="mb-3 text-center text-xl font-bold text-accent">Prize Pool Distribution</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong className="text-foreground">90%</strong> goes to winning voters (split proportionally by vote amount)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong className="text-foreground">5%</strong> platform fee for development and operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong className="text-foreground">5%</strong> reserved for future tournaments and community rewards</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-bold text-accent">No admin control.</p>
            <p className="text-xl font-bold text-accent">No hidden rules.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
