export function WhatIsSection() {
  return (
    <section id="how-it-works" className="border-b border-border py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-4xl font-bold text-primary">What Is Onchain World Cup</h2>
          <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>Onchain World Cup is a community-driven football tournament where fans decide the winner — onchain.</p>
            <div className="cm-panel rounded-sm p-6">
              <p className="mb-4 font-semibold text-primary">There are:</p>
              <ul className="mb-6 list-inside list-disc space-y-2">
                <li>No odds</li>
                <li>No predictions</li>
                <li>No bookmakers</li>
              </ul>
              <p className="mb-4 font-semibold text-primary">Instead:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Fans vote for the national teams they support</li>
                <li>Teams advance based on community backing</li>
                <li>
                  The most supported team becomes the <span className="cm-highlight">Onchain World Cup Champion</span>
                </li>
              </ul>
            </div>
            <p className="text-xl font-semibold text-accent">
              A country can win the Onchain World Cup and still get eliminated early in the real one.
            </p>
            <p className="text-xl font-semibold text-accent">That's intentional.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
