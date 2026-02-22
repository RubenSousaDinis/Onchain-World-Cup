import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.contentPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error("[content/[id] GET]", err)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, content, status, topic, metadata, scheduledAt, performanceRating, performanceNotes } = body

    const existing = await prisma.contentPost.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.contentPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(topic !== undefined && { topic }),
        ...(metadata !== undefined && { metadata }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(performanceRating !== undefined && { performanceRating: performanceRating ?? null }),
        ...(performanceNotes !== undefined && { performanceNotes: performanceNotes ?? null }),
        ...(status !== undefined && {
          status,
          publishedAt:
            status === "published" && existing.status !== "published"
              ? new Date()
              : existing.publishedAt,
        }),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error("[content/[id] PATCH]", err)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await prisma.contentPost.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.contentPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[content/[id] DELETE]", err)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
