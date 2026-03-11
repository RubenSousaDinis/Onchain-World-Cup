"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"

interface ContentPost {
  id: string
  type: string
  title: string
  status: string
  topic: string | null
  aiGenerated: boolean
  publishedAt: string | null
  scheduledAt: string | null
  performanceRating: string | null
  performanceNotes: string | null
  createdAt: string
}

interface FullContentPost extends ContentPost {
  content: string
  metadata: unknown
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

function BlogView({ blog }: { blog: GeneratedBlog }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border/20 pb-3">
        <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {blog.tags?.map((tag) => (
            <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">#{tag}</span>
          ))}
          {blog.estimatedReadTime && (
            <span className="text-xs text-muted-foreground">{blog.estimatedReadTime} min read</span>
          )}
        </div>
      </div>
      {blog.sections?.map((section, i) => (
        <div key={i}>
          <h3 className="font-semibold mb-1 text-sm text-[var(--cm-highlight)]">{section.heading}</h3>
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

function ThreadView({ thread }: { thread: GeneratedThread }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap mb-1">
        {thread.hashtags?.map((tag) => (
          <span key={tag} className="text-xs bg-[var(--nav-purple)] px-2 py-0.5 rounded">#{tag}</span>
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

function ContentViewer({ postId, type }: { postId: string; type: string }) {
  const [post, setPost] = useState<FullContentPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/content/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setPost(d.data)
        else setError("Failed to load content")
      })
      .catch(() => setError("Failed to load content"))
      .finally(() => setLoading(false))
  }, [postId])

  if (loading) return <p className="text-xs text-muted-foreground p-4">Loading...</p>
  if (error) return <p className="text-xs text-red-400 p-4">{error}</p>
  if (!post) return null

  const metadata = post.metadata as GeneratedBlog | GeneratedThread | null

  return (
    <div className="p-4 max-h-[500px] overflow-y-auto">
      {type === "blog" && metadata ? (
        <BlogView blog={metadata as GeneratedBlog} />
      ) : type === "twitter_thread" && metadata ? (
        <ThreadView thread={metadata as GeneratedThread} />
      ) : (
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{post.content}</pre>
      )}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-400",
  published: "text-green-400",
  archived: "text-muted-foreground",
}

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog",
  twitter_thread: "Thread",
}

const PERFORMANCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  good: { label: "Good", color: "text-green-400", bg: "border-green-500/50 bg-green-500/10" },
  neutral: { label: "Neutral", color: "text-yellow-400", bg: "border-yellow-500/50 bg-yellow-500/10" },
  poor: { label: "Poor", color: "text-red-400", bg: "border-red-500/50 bg-red-500/10" },
}

function PerformanceRater({
  postId,
  currentRating,
  currentNotes,
  onUpdated,
}: {
  postId: string
  currentRating: string | null
  currentNotes: string | null
  onUpdated: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(currentNotes ?? "")

  const setRating = async (rating: string | null) => {
    setSaving(true)
    await fetch(`/api/admin/content/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ performanceRating: rating }),
    })
    setSaving(false)
    onUpdated()
  }

  const saveNotes = async () => {
    setSaving(true)
    await fetch(`/api/admin/content/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ performanceNotes: notes || null }),
    })
    setSaving(false)
    setShowNotes(false)
    onUpdated()
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1 items-center">
        {(["good", "neutral", "poor"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRating(currentRating === r ? null : r)}
            disabled={saving}
            title={`Mark as ${r}`}
            className={`text-xs px-1.5 py-0.5 border transition-colors disabled:opacity-40 ${
              currentRating === r
                ? PERFORMANCE_CONFIG[r].bg + " " + PERFORMANCE_CONFIG[r].color
                : "border-border/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            {PERFORMANCE_CONFIG[r].label}
          </button>
        ))}
        <button
          onClick={() => setShowNotes((s) => !s)}
          title="Add notes"
          className="text-xs px-1.5 py-0.5 border border-border/20 text-muted-foreground hover:text-foreground"
        >
          Notes
        </button>
      </div>
      {showNotes && (
        <div className="flex gap-1 mt-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why did it perform this way?"
            className="flex-1 text-xs bg-background border border-border/50 px-2 py-1 focus:outline-none focus:border-[var(--cm-highlight)]"
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="text-xs px-2 py-1 border border-[var(--cm-highlight)] text-[var(--cm-highlight)] disabled:opacity-40"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      )}
      {currentNotes && !showNotes && (
        <p className="text-xs text-muted-foreground italic truncate max-w-[200px]" title={currentNotes}>
          {currentNotes}
        </p>
      )}
    </div>
  )
}

export function ContentLibrary() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const PAGE_SIZE = 15

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    })
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (statusFilter !== "all") params.set("status", statusFilter)

    const res = await fetch(`/api/admin/content?${params}`)
    const data = await res.json()
    setPosts(data.data ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, typeFilter, statusFilter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchPosts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return
    setDeleting(id)
    await fetch(`/api/admin/content/${id}`, { method: "DELETE" })
    setDeleting(null)
    fetchPosts()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
            className="bg-background border border-border/50 text-sm px-2 py-1 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="blog">Blog Posts</option>
            <option value="twitter_thread">Twitter Threads</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            className="bg-background border border-border/50 text-sm px-2 py-1 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <span className="text-xs text-muted-foreground self-center ml-auto">{total} posts</span>
      </div>

      {/* Table */}
      {loading && posts.length === 0 ? (
        <p className="text-muted-foreground text-sm p-4">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border/20">
          No content yet. Use the Generator tab to create your first post.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">AI</th>
                <th className="px-3 py-2">Performance</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <React.Fragment key={post.id}>
                <tr className="cm-hover-row border-b border-border/10">
                  <td className="px-3 py-2 text-sm max-w-xs">
                    <div className="truncate">{post.title}</div>
                    {post.topic && (
                      <div className="text-xs text-muted-foreground truncate">{post.topic}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="bg-[var(--nav-purple)]/50 px-2 py-0.5">
                      {TYPE_LABELS[post.type] ?? post.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className={STATUS_COLORS[post.status] ?? "text-foreground"}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-center">
                    {post.aiGenerated ? (
                      <span className="text-[var(--cm-highlight)]">AI</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <PerformanceRater
                      postId={post.id}
                      currentRating={post.performanceRating}
                      currentNotes={post.performanceNotes}
                      onUpdated={fetchPosts}
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      <Link
                        href={`/admin/content/${post.id}`}
                        className="text-xs px-2 py-0.5 border border-[var(--cm-highlight)]/50 text-[var(--cm-highlight)] hover:bg-[var(--nav-purple)]/30"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                        className="text-xs px-2 py-0.5 border border-border/40 text-muted-foreground hover:text-foreground"
                      >
                        {expandedId === post.id ? "Hide" : "Preview"}
                      </button>
                      {post.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(post.id, "published")}
                          className="text-xs px-2 py-0.5 border border-green-500/40 text-green-400 hover:bg-green-500/10"
                        >
                          Publish
                        </button>
                      )}
                      {post.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(post.id, "archived")}
                          className="text-xs px-2 py-0.5 border border-border/30 text-muted-foreground hover:text-foreground"
                        >
                          Archive
                        </button>
                      )}
                      {post.status === "archived" && (
                        <button
                          onClick={() => handleStatusChange(post.id, "draft")}
                          className="text-xs px-2 py-0.5 border border-border/30 text-muted-foreground hover:text-foreground"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="text-xs px-2 py-0.5 border border-red-500/30 text-red-400/70 hover:text-red-400 disabled:opacity-40"
                      >
                        {deleting === post.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === post.id && (
                  <tr className="border-b border-border/20 bg-[var(--nav-purple)]/10">
                    <td colSpan={7} className="px-3">
                      <div className="border border-border/20 rounded my-2">
                        <div className="px-3 py-2 border-b border-border/20 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {post.type === "twitter_thread" ? "Thread tweets" : "Blog content"}
                          </span>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Close
                          </button>
                        </div>
                        <ContentViewer postId={post.id} type={post.type} />
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/20">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
