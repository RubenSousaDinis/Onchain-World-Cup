"use client"

import { useState } from "react"

const TOPIC_SUGGESTIONS = {
  blog: [
    "How Onchain World Cup works: early voter advantage explained",
    "Why we built World Cup voting on Base network",
    "The economics of onchain sports betting vs traditional bookmakers",
    "World Cup 2026 preview: top contenders and how to vote",
    "NFT rewards: what participants earn on Onchain World Cup",
    "Farcaster Mini App: vote on World Cup from your feed",
    "Community-driven qualification: how 48 countries are chosen",
    "Getting started with Onchain World Cup: a beginner's guide",
    "The future of sports fan engagement on blockchain",
    "Base network: why we chose it for Onchain World Cup",
  ],
  twitter_thread: [
    "How the two-phase pricing system rewards early voters",
    "World Cup 2026 is onchain — here's what that means",
    "5 reasons to vote on Onchain World Cup this season",
    "The qualification phase explained in simple terms",
    "How prize pools work and how winners are paid out",
    "Farcaster + World Cup: the ultimate fan experience",
    "Why ETH voting changes the game for football fans",
    "Our community just voted — here's who qualified",
    "Behind the scenes: building a World Cup dApp on Base",
    "Top 10 countries leading the qualification vote right now",
  ],
}

interface GeneratedBlog {
  title: string
  excerpt: string
  sections: { heading: string; body: string }[]
  cta: string
  tags: string[]
  estimatedReadTime: number
}

interface GeneratedTweet {
  number: number
  text: string
  isHook: boolean
}

interface GeneratedThread {
  title: string
  tweets: GeneratedTweet[]
  hashtags: string[]
  estimatedImpressions: string
}

interface GeneratedContent {
  type: "blog" | "twitter_thread"
  topic: string
  generated: GeneratedBlog | GeneratedThread
}

interface ContentGeneratorProps {
  onSave: (content: GeneratedContent) => Promise<void>
}

function BlogPreview({ blog }: { blog: GeneratedBlog }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border/20 pb-3">
        <h2 className="text-xl font-bold cm-highlight">{blog.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {blog.tags?.map((tag) => (
            <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {blog.estimatedReadTime && (
            <span className="text-xs text-muted-foreground">{blog.estimatedReadTime} min read</span>
          )}
        </div>
      </div>
      {blog.sections?.map((section, i) => (
        <div key={i}>
          <h3 className="font-semibold mb-2 text-sm text-[var(--cm-highlight)]">{section.heading}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{section.body}</p>
        </div>
      ))}
      {blog.cta && (
        <div className="border-t border-border/20 pt-3">
          <p className="text-sm font-medium cm-highlight">{blog.cta}</p>
        </div>
      )}
    </div>
  )
}

function ThreadPreview({ thread }: { thread: GeneratedThread }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap mb-2">
        {thread.hashtags?.map((tag) => (
          <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
        {thread.estimatedImpressions && (
          <span className="text-xs text-muted-foreground">Est. reach: {thread.estimatedImpressions}</span>
        )}
      </div>
      {thread.tweets?.map((tweet) => (
        <div
          key={tweet.number}
          className={`p-3 border rounded ${tweet.isHook ? "border-[var(--cm-highlight)] bg-[var(--nav-purple)]/30" : "border-border/30"}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{tweet.number}/</span>
            <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">{tweet.text}</p>
          </div>
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${tweet.text.length > 260 ? "text-red-400" : "text-muted-foreground"}`}>
              {tweet.text.length}/280
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ContentGenerator({ onSave }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<"blog" | "twitter_thread">("blog")
  const [topic, setTopic] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setError(null)
    setGenerated(null)

    try {
      const res = await fetch("/api/admin/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, topic: topic.trim(), customPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setGenerated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!generated) return
    setSaving(true)
    try {
      const g = generated.generated as GeneratedBlog & GeneratedThread
      await onSave(generated)

      // Post to API
      const title = "title" in g ? g.title : topic
      const content =
        contentType === "blog"
          ? JSON.stringify(g, null, 2)
          : (g as GeneratedThread).tweets?.map((t) => t.text).join("\n\n") ?? ""

      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          title,
          content,
          status,
          topic: topic.trim(),
          aiGenerated: true,
          prompt: customPrompt || null,
          metadata: generated.generated,
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const suggestions = TOPIC_SUGGESTIONS[contentType]

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {(["blog", "twitter_thread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setContentType(t); setGenerated(null) }}
            className={`px-4 py-2 text-sm font-semibold border transition-colors ${
              contentType === t
                ? "border-[var(--cm-highlight)] text-foreground bg-[var(--nav-purple)]/50"
                : "border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "blog" ? "Blog Post" : "Twitter Thread"}
          </button>
        ))}
      </div>

      {/* Topic input */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={contentType === "blog" ? "e.g. How the two-phase pricing system works" : "e.g. Why vote on Onchain World Cup"}
          className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)]"
        />
      </div>

      {/* Topic suggestions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Suggested topics:</p>
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="text-xs px-2 py-1 bg-[var(--nav-purple)]/40 border border-border/20 hover:border-border/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Additional instructions <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g. Focus on the Farcaster angle, mention the qualification phase, write in a casual tone..."
          rows={2}
          className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)] resize-none"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || generating}
        className="cm-highlight bg-[var(--nav-purple)] border border-[var(--cm-highlight)] px-6 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-[var(--nav-purple)]/80 transition-colors"
      >
        {generating ? "Generating..." : `Generate ${contentType === "blog" ? "Blog Post" : "Twitter Thread"}`}
      </button>

      {error && (
        <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {/* Generated content preview */}
      {generated && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold cm-highlight">Generated Content</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold border border-border/50 hover:border-border/80 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold bg-[var(--nav-purple)] border border-[var(--cm-highlight)] cm-highlight disabled:opacity-40 hover:bg-[var(--nav-purple)]/80"
              >
                {saving ? "Saving..." : "Publish"}
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-3 py-1.5 text-xs font-semibold border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Regenerate
              </button>
            </div>
          </div>
          <div className="cm-panel p-4 max-h-[600px] overflow-y-auto">
            {contentType === "blog" ? (
              <BlogPreview blog={generated.generated as GeneratedBlog} />
            ) : (
              <ThreadPreview thread={generated.generated as GeneratedThread} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
