"use client"

import { useState } from "react"
import { ContentGenerator } from "./content-generator"
import { ContentLibrary } from "./content-library"
import { MarketingPlan } from "./marketing-plan"
import { ContentTimeline } from "./content-timeline"

type SubTab = "generator" | "library" | "marketing-plan" | "timeline"

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "timeline", label: "Content Timeline" },
  { key: "generator", label: "AI Generator" },
  { key: "library", label: "Content Library" },
  { key: "marketing-plan", label: "Marketing Plan" },
]

export function ContentTab() {
  const [activeTab, setActiveTab] = useState<SubTab>("timeline")
  const [savedCount, setSavedCount] = useState(0)

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-1 border-b border-border/30 overflow-x-auto">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[var(--cm-highlight)] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "library" && savedCount > 0 && (
              <span className="ml-1.5 text-xs bg-[var(--nav-purple)] px-1.5 py-0.5">{savedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "timeline" && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-2">Content Timeline</h3>
          <p className="text-xs text-muted-foreground mb-4 px-1">
            Day-by-day post schedule derived from the AI content strategy. Covers pre-launch (March 2),
            qualification (April 1 – end of May), and post-qualification (June 1–10) through the June 11 main
            tournament launch. Click any day to see the post template.
          </p>
          <ContentTimeline />
        </div>
      )}

      {activeTab === "generator" && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-4">AI Content Generator</h3>
          <p className="text-xs text-muted-foreground mb-4 px-1">
            Generate blog posts and Twitter threads for Onchain World Cup using AI. Content is tailored to drive user
            acquisition through football fans and the crypto/Web3 community.
          </p>
          <ContentGenerator
            onSave={async () => {
              setSavedCount((n) => n + 1)
            }}
          />
        </div>
      )}

      {activeTab === "library" && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-4">Content Library</h3>
          <ContentLibrary />
        </div>
      )}

      {activeTab === "marketing-plan" && (
        <div>
          <div className="cm-panel p-4 mb-4">
            <h3 className="cm-section-header px-3 py-2 mb-2">AI Marketing Plan</h3>
            <p className="text-xs text-muted-foreground">
              Generate a comprehensive content marketing strategy for user acquisition. Covers target audiences,
              content pillars, a phased content calendar through the World Cup, distribution channels, growth
              tactics, and KPIs.
            </p>
          </div>
          <MarketingPlan />
        </div>
      )}
    </div>
  )
}
