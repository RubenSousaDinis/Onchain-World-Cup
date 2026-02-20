import { X, Check } from "lucide-react"

export function WhatIsSection() {
  return (
    <section id="how-it-works" className="border-b border-border py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-4xl font-bold text-primary">What Is Onchain World Cup</h2>
          <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>Onchain World Cup is a community-driven football tournament where fans decide the winner — onchain.</p>
            <div className="rounded-sm border-2 border-primary/30 bg-background p-8">
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xl font-semibold text-primary">There are:</p>
                  <div className="space-y-2 text-base">
                    <p className="flex items-start gap-3">
                      <X className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>No odds</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <X className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>No predictions</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <X className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>No bookmakers</span>
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="mb-3 text-xl font-semibold text-primary">Instead:</p>
                  <div className="space-y-2 text-base">
                    <p className="flex items-start gap-3">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>Fans vote for the national teams they support</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>Teams advance based on community backing</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                      <span>The most supported team becomes the <span className="cm-highlight font-semibold">Onchain World Cup Champion</span></span>
                    </p>
                  </div>
                </div>
              </div>
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
