export function HowVotingWorksSection() {
  return (
    <section className="border-b border-border bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-primary">How Voting Works</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">Votes are made using ETH</p>
            </div>
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">Multiple votes per wallet are allowed</p>
            </div>
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">Voting fees increase over time</p>
            </div>
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">Early participation matters more</p>
            </div>
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">Anti-sybil protections are enforced</p>
            </div>
            <div className="cm-panel rounded-sm p-6">
              <p className="text-foreground/90">All logic lives in smart contracts</p>
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
