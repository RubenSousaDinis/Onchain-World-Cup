"use client"

import React, { useState } from "react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SerializedContentPost {
  id: string
  type: string
  title: string
  content: string
  status: string
  topic: string | null
  aiGenerated: boolean
  metadata: unknown
  prompt: string | null
  publishedAt: string | null
  scheduledAt: string | null
  performanceRating: string | null
  performanceNotes: string | null
  createdAt: string
  updatedAt: string
}

interface BlogSection {
  heading: string
  body: string
}

interface BlogData {
  title: string
  excerpt: string
  sections: BlogSection[]
  cta: string
  tags: string[]
  estimatedReadTime: number
}

interface TweetData {
  number: number
  text: string
  isHook: boolean
}

interface ThreadData {
  title: string
  tweets: TweetData[]
  hashtags: string[]
  estimatedImpressions: string
}

interface BlogSuggestions {
  overall: string[]
  title?: string | null
  excerpt?: string | null
  sections: { index: number; body: string; note: string }[]
  cta?: string | null
}

interface ThreadSuggestions {
  overall: string[]
  tweets: { number: number; text: string; note: string }[]
}

// ─── Suggestion inline badge ──────────────────────────────────────────────────

function SuggestionBlock({
  label,
  note,
  suggested,
  onApply,
  onDismiss,
}: {
  label: string
  note?: string
  suggested: string
  onApply: () => void
  onDismiss: () => void
}) {
  return (
    <div className="mt-2 border border-[var(--cm-highlight)]/50 bg-[var(--nav-purple)]/20 rounded p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[var(--cm-highlight)] font-semibold">AI: {label}</span>
        <div className="flex gap-1">
          <button
            onClick={onApply}
            className="px-2 py-0.5 border border-[var(--cm-highlight)] text-[var(--cm-highlight)] hover:bg-[var(--nav-purple)]/40"
          >
            Apply
          </button>
          <button
            onClick={onDismiss}
            className="px-2 py-0.5 border border-border/30 text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      </div>
      {note && <p className="text-muted-foreground italic">{note}</p>}
      <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{suggested}</p>
    </div>
  )
}

// ─── Blog editor ─────────────────────────────────────────────────────────────

function BlogEditor({
  data,
  onChange,
  suggestions,
  onDismissSuggestion,
}: {
  data: BlogData
  onChange: (updated: BlogData) => void
  suggestions: BlogSuggestions | null
  onDismissSuggestion: (key: string) => void
}) {
  const updateSection = (i: number, field: keyof BlogSection, value: string) => {
    const sections = data.sections.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    onChange({ ...data, sections })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Title</label>
        <input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full bg-background border border-border/50 px-3 py-2 text-base font-bold focus:outline-none focus:border-[var(--cm-highlight)]"
        />
        {suggestions?.title && (
          <SuggestionBlock
            label="Improved title"
            suggested={suggestions.title}
            onApply={() => {
              onChange({ ...data, title: suggestions.title! })
              onDismissSuggestion("title")
            }}
            onDismiss={() => onDismissSuggestion("title")}
          />
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Excerpt</label>
        <textarea
          value={data.excerpt}
          onChange={(e) => onChange({ ...data, excerpt: e.target.value })}
          rows={3}
          className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)] resize-none"
        />
        {suggestions?.excerpt && (
          <SuggestionBlock
            label="Improved excerpt"
            suggested={suggestions.excerpt}
            onApply={() => {
              onChange({ ...data, excerpt: suggestions.excerpt! })
              onDismissSuggestion("excerpt")
            }}
            onDismiss={() => onDismissSuggestion("excerpt")}
          />
        )}
      </div>

      {/* Tags */}
      {data.tags?.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Tags</label>
          <div className="flex gap-2 flex-wrap">
            {data.tags.map((tag) => (
              <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {data.sections?.map((section, i) => {
        const sectionSuggestion = suggestions?.sections?.find((s) => s.index === i)
        return (
          <div key={i} className="space-y-2 border-l-2 border-border/20 pl-4">
            <label className="text-xs text-muted-foreground">Section {i + 1}</label>
            <input
              value={section.heading}
              onChange={(e) => updateSection(i, "heading", e.target.value)}
              className="w-full bg-background border border-border/50 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-[var(--cm-highlight)]"
              placeholder="Section heading"
            />
            <textarea
              value={section.body}
              onChange={(e) => updateSection(i, "body", e.target.value)}
              rows={6}
              className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)] resize-y leading-relaxed"
            />
            {sectionSuggestion && (
              <SuggestionBlock
                label={`Section ${i + 1} rewrite`}
                note={sectionSuggestion.note}
                suggested={sectionSuggestion.body}
                onApply={() => {
                  updateSection(i, "body", sectionSuggestion.body)
                  onDismissSuggestion(`section-${i}`)
                }}
                onDismiss={() => onDismissSuggestion(`section-${i}`)}
              />
            )}
          </div>
        )
      })}

      {/* CTA */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">CTA</label>
        <input
          value={data.cta}
          onChange={(e) => onChange({ ...data, cta: e.target.value })}
          className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)]"
          placeholder="Call to action"
        />
        {suggestions?.cta && (
          <SuggestionBlock
            label="Improved CTA"
            suggested={suggestions.cta}
            onApply={() => {
              onChange({ ...data, cta: suggestions.cta! })
              onDismissSuggestion("cta")
            }}
            onDismiss={() => onDismissSuggestion("cta")}
          />
        )}
      </div>
    </div>
  )
}

// ─── Thread editor ────────────────────────────────────────────────────────────

function ThreadEditor({
  data,
  onChange,
  suggestions,
  onDismissSuggestion,
}: {
  data: ThreadData
  onChange: (updated: ThreadData) => void
  suggestions: ThreadSuggestions | null
  onDismissSuggestion: (key: string) => void
}) {
  const updateTweet = (number: number, text: string) => {
    const tweets = data.tweets.map((t) => (t.number === number ? { ...t, text } : t))
    onChange({ ...data, tweets })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {data.hashtags?.map((tag) => (
          <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
        {data.estimatedImpressions && (
          <span className="text-xs text-muted-foreground">Est. reach: {data.estimatedImpressions}</span>
        )}
      </div>

      {data.tweets?.map((tweet) => {
        const tweetSuggestion = suggestions?.tweets?.find((s) => s.number === tweet.number)
        const len = tweet.text.length
        const lenColor = len > 280 ? "text-red-400" : len > 260 ? "text-yellow-400" : "text-muted-foreground"

        return (
          <div
            key={tweet.number}
            className={`border rounded ${tweet.isHook ? "border-[var(--cm-highlight)]/60 bg-[var(--nav-purple)]/10" : "border-border/30"}`}
          >
            <div className="p-3">
              {tweet.isHook && (
                <span className="text-xs text-[var(--cm-highlight)] font-semibold mb-2 block">Hook</span>
              )}
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 pt-2.5">{tweet.number}/</span>
                <textarea
                  value={tweet.text}
                  onChange={(e) => updateTweet(tweet.number, e.target.value)}
                  rows={3}
                  className="flex-1 bg-background border border-border/30 px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--cm-highlight)] resize-none"
                />
              </div>
              <div className="flex justify-end mt-1 pr-1">
                <span className={`text-xs font-mono ${lenColor}`}>{len}/280</span>
              </div>
            </div>
            {tweetSuggestion && (
              <div className="border-t border-border/20 px-3 pb-3">
                <SuggestionBlock
                  label={`Tweet ${tweet.number} rewrite`}
                  note={tweetSuggestion.note}
                  suggested={tweetSuggestion.text}
                  onApply={() => {
                    updateTweet(tweet.number, tweetSuggestion.text)
                    onDismissSuggestion(`tweet-${tweet.number}`)
                  }}
                  onDismiss={() => onDismissSuggestion(`tweet-${tweet.number}`)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main PostEditor ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-400 border-yellow-500/30",
  published: "text-green-400 border-green-500/30",
  archived: "text-muted-foreground border-border/30",
}

export function PostEditor({ post }: { post: SerializedContentPost }) {
  const isBlog = post.type === "blog"

  const [blogData, setBlogData] = useState<BlogData>(
    isBlog ? (post.metadata as BlogData) : ({ title: "", excerpt: "", sections: [], cta: "", tags: [], estimatedReadTime: 0 } as BlogData)
  )
  const [threadData, setThreadData] = useState<ThreadData>(
    !isBlog ? (post.metadata as ThreadData) : ({ title: "", tweets: [], hashtags: [], estimatedImpressions: "" } as ThreadData)
  )
  const [status, setStatus] = useState(post.status)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [instructions, setInstructions] = useState("")
  const [showSuggestPanel, setShowSuggestPanel] = useState(false)

  const [blogSuggestions, setBlogSuggestions] = useState<BlogSuggestions | null>(null)
  const [threadSuggestions, setThreadSuggestions] = useState<ThreadSuggestions | null>(null)
  const [overallSuggestions, setOverallSuggestions] = useState<string[]>([])

  const currentTitle = isBlog ? blogData.title : threadData.title
  const currentMetadata = isBlog ? blogData : threadData

  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    setSaveMsg(null)
    const targetStatus = newStatus ?? status

    const metadata = isBlog ? blogData : threadData
    const title = isBlog ? blogData.title : threadData.title
    const content = isBlog
      ? JSON.stringify(blogData, null, 2)
      : threadData.tweets?.map((t) => t.text).join("\n\n") ?? ""

    const res = await fetch(`/api/admin/content/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, metadata, status: targetStatus }),
    })

    setSaving(false)
    if (res.ok) {
      setStatus(targetStatus)
      setSaveMsg(targetStatus === "published" ? "Published!" : "Saved!")
      setTimeout(() => setSaveMsg(null), 3000)
    } else {
      setSaveMsg("Save failed")
    }
  }

  const handleSuggest = async () => {
    setSuggesting(true)
    setSuggestError(null)
    setBlogSuggestions(null)
    setThreadSuggestions(null)
    setOverallSuggestions([])

    const res = await fetch(`/api/admin/content/${post.id}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions, currentTitle, currentMetadata }),
    })

    const data = await res.json()
    setSuggesting(false)

    if (!res.ok) {
      setSuggestError(data.error ?? "Suggestion failed")
      return
    }

    const s = data.suggestions
    setOverallSuggestions(s.overall ?? [])
    if (isBlog) {
      setBlogSuggestions(s)
    } else {
      setThreadSuggestions(s)
    }
  }

  const dismissSuggestion = (key: string) => {
    if (isBlog && blogSuggestions) {
      if (key === "title") setBlogSuggestions({ ...blogSuggestions, title: null })
      else if (key === "excerpt") setBlogSuggestions({ ...blogSuggestions, excerpt: null })
      else if (key === "cta") setBlogSuggestions({ ...blogSuggestions, cta: null })
      else if (key.startsWith("section-")) {
        const idx = parseInt(key.replace("section-", ""))
        setBlogSuggestions({
          ...blogSuggestions,
          sections: blogSuggestions.sections.filter((s) => s.index !== idx),
        })
      }
    } else if (!isBlog && threadSuggestions) {
      if (key.startsWith("tweet-")) {
        const num = parseInt(key.replace("tweet-", ""))
        setThreadSuggestions({
          ...threadSuggestions,
          tweets: threadSuggestions.tweets.filter((t) => t.number !== num),
        })
      }
    }
  }

  const hasSuggestions =
    overallSuggestions.length > 0 ||
    (isBlog && blogSuggestions != null) ||
    (!isBlog && threadSuggestions != null)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/admin/content"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            ← Content Library
          </Link>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {post.type === "twitter_thread" ? "Twitter Thread" : "Blog Post"}
              {post.topic ? ` · ${post.topic}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs px-2 py-0.5 border ${STATUS_COLORS[status] ?? "text-foreground border-border/30"}`}
            >
              {status}
            </span>
            {saveMsg && (
              <span className={`text-xs ${saveMsg.includes("fail") ? "text-red-400" : "text-green-400"}`}>
                {saveMsg}
              </span>
            )}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="text-xs px-3 py-1.5 border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {status === "draft" && (
              <button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="text-xs px-3 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-500/10 disabled:opacity-40"
              >
                Publish
              </button>
            )}
            {status === "published" && (
              <button
                onClick={() => handleSave("archived")}
                disabled={saving}
                className="text-xs px-3 py-1.5 border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Archive
              </button>
            )}
            {status === "archived" && (
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="text-xs px-3 py-1.5 border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Restore
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* AI Suggest panel */}
        <div className="cm-panel border border-border/30">
          <button
            onClick={() => setShowSuggestPanel((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-[var(--nav-purple)]/10 transition-colors"
          >
            <span className="cm-highlight">AI Suggest Edits</span>
            <span className="text-xs text-muted-foreground font-normal">
              {showSuggestPanel ? "Hide" : "Expand to analyse and improve this post"}
            </span>
          </button>

          {showSuggestPanel && (
            <div className="border-t border-border/20 px-4 py-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Instructions <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Make the hook punchier, focus on the DeFi angle, shorten tweet 3..."
                  rows={2}
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--cm-highlight)] resize-none"
                />
              </div>
              <button
                onClick={handleSuggest}
                disabled={suggesting}
                className="cm-highlight bg-[var(--nav-purple)] border border-[var(--cm-highlight)] px-5 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-[var(--nav-purple)]/80 transition-colors"
              >
                {suggesting ? "Analysing..." : "Suggest Edits"}
              </button>
              {suggestError && (
                <p className="text-xs text-red-400">{suggestError}</p>
              )}
            </div>
          )}
        </div>

        {/* Overall suggestions */}
        {overallSuggestions.length > 0 && (
          <div className="border border-border/30 rounded p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">AI observations</p>
            <ul className="space-y-1">
              {overallSuggestions.map((obs, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-[var(--cm-highlight)] shrink-0">—</span>
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasSuggestions && (
          <p className="text-xs text-[var(--cm-highlight)]/70 -mt-4">
            Inline suggestions appear below each field. Click Apply to use them.
          </p>
        )}

        {/* Content editor */}
        <div className="cm-panel p-6">
          {isBlog ? (
            <BlogEditor
              data={blogData}
              onChange={setBlogData}
              suggestions={blogSuggestions}
              onDismissSuggestion={dismissSuggestion}
            />
          ) : (
            <ThreadEditor
              data={threadData}
              onChange={setThreadData}
              suggestions={threadSuggestions}
              onDismissSuggestion={dismissSuggestion}
            />
          )}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end gap-2 pb-16">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 text-sm border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          {status !== "published" && (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="px-4 py-2 text-sm cm-highlight bg-[var(--nav-purple)] border border-[var(--cm-highlight)] disabled:opacity-40 hover:bg-[var(--nav-purple)]/80"
            >
              {saving ? "Saving..." : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
