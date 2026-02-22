import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // "blog" | "twitter_thread" | null (all)
    const status = searchParams.get("status")
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
    const offset = parseInt(searchParams.get("offset") ?? "0")

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const [posts, total] = await Promise.all([
      prisma.contentPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          topic: true,
          aiGenerated: true,
          publishedAt: true,
          scheduledAt: true,
          performanceRating: true,
          performanceNotes: true,
          createdAt: true,
          updatedAt: true,
          // Exclude full content for list view for performance
        },
      }),
      prisma.contentPost.count({ where }),
    ])

    return NextResponse.json({ data: posts, total, limit, offset })
  } catch (err) {
    console.error("[content GET]", err)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, title, content, status = "draft", topic, aiGenerated = false, prompt, metadata, scheduledAt } = body

    if (!type || !title || !content) {
      return NextResponse.json({ error: "type, title, and content are required" }, { status: 400 })
    }

    const post = await prisma.contentPost.create({
      data: {
        type,
        title,
        content,
        status,
        topic: topic ?? null,
        aiGenerated,
        prompt: prompt ?? null,
        metadata: metadata ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === "published" ? new Date() : null,
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (err) {
    console.error("[content POST]", err)
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 })
  }
}
