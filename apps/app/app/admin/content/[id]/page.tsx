import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/server/prisma"
import { PostEditor, SerializedContentPost } from "@/components/admin/post-editor"

export const metadata: Metadata = {
  title: "Edit Post — Onchain World Cup Admin",
  robots: { index: false, follow: false },
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.contentPost.findUnique({ where: { id } })
  if (!post) notFound()

  // Serialize: convert Date fields to ISO strings for the client component
  const serialized: SerializedContentPost = {
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    status: post.status,
    topic: post.topic,
    aiGenerated: post.aiGenerated,
    metadata: post.metadata,
    prompt: post.prompt,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    performanceRating: post.performanceRating,
    performanceNotes: post.performanceNotes,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }

  return <PostEditor post={serialized} />
}
