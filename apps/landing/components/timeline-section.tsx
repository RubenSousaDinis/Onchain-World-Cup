"use client"

import { Calendar } from "lucide-react"

const milestones = [
  {
    date: "Mid-February 2026",
    title: "Qualification Opens",
    description: "Vote for countries with ETH. Linear pricing in Phase 1.",
    status: "upcoming" as const,
  },
  {
    date: "TBD",
    title: "Qualification Ends",
    description: "Top 48 countries qualify for the tournament.",
    status: "future" as const,
  },
  {
    date: "Early June 2026",
    title: "Onchain World Cup Final",
    description: "1 week before the real World Cup begins.",
    status: "future" as const,
  },
  {
    date: "June 11 - July 19, 2026",
    title: "Real World Cup",
    description: "FIFA World Cup 2026 in North America.",
    status: "future" as const,
  },
]

export function TimelineSection() {
  return (
    <section id="timeline" className="border-b border-border bg-card py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Calendar className="h-4 w-4" />
            TIMELINE
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Road to the Onchain World Cup
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            From qualification to the final tournament — here's what happens next
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="relative py-8">
            {/* Connection line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-border" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary transition-all duration-1000"
              style={{ width: "25%" }}
            />

            <div className="relative grid grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  {/* Dot */}
                  <div
                    className={`relative z-10 mb-6 flex h-8 w-8 items-center justify-center rounded-full border-4 ${
                      milestone.status === "upcoming"
                        ? "border-primary bg-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    {milestone.status === "upcoming" && (
                      <div className="h-3 w-3 animate-pulse rounded-full bg-primary-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="w-full rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg">
                    <div
                      className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
                        milestone.status === "upcoming" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {milestone.date}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">{milestone.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden">
          <div className="relative space-y-8 border-l-2 border-border pl-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-10 top-0 flex h-6 w-6 items-center justify-center rounded-full border-4 ${
                    milestone.status === "upcoming"
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {milestone.status === "upcoming" && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary">
                  <div
                    className={`mb-2 text-sm font-semibold uppercase tracking-wide ${
                      milestone.status === "upcoming" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {milestone.date}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-primary">
            Get notified when qualification opens
          </p>
        </div>
      </div>
    </section>
  )
}
