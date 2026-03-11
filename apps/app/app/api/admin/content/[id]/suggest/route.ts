import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { prisma } from "@/lib/server/prisma"

const PLATFORM_CONTEXT = `Onchain World Cup is a Web3 application where users vote/bet on World Cup 2026 matches using ETH on the Base network.

Key features:
- Vote on match outcomes using ETH on Base network
- Two-phase pricing: early voters get more votes for less ETH (linear Phase 1), later voters pay exponentially more (Phase 2)
- 90% of ETH goes to winners proportionally by vote count, 10% platform fee
- NFT rewards for participants
- Available as a Farcaster Mini App
- Qualification phase where community votes to decide which 48 countries qualify
- Fully onchain — smart contracts handle all voting and payouts

Target audiences: crypto/Web3 enthusiasts who follow football, football fans curious about crypto, DeFi/Base users, Farcaster community, World Cup 2026 fans.
Brand voice: "Onchain World Cup" (never "Crypto World Cup"). Tone: energetic, approachable, passionate about football.`

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.contentPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { instructions = "", currentTitle, currentMetadata } = body

    const title = currentTitle ?? post.title
    const metadata = currentMetadata ?? post.metadata

    let prompt: string

    if (post.type === "blog") {
      const blog = metadata as {
        excerpt?: string
        sections?: { heading: string; body: string }[]
        cta?: string
      }
      const sectionsText =
        blog.sections
          ?.map((s, i) => `Section ${i} — "${s.heading}":\n${s.body}`)
          .join("\n\n") ?? ""

      prompt = `You are a senior content editor reviewing a blog post for Onchain World Cup.

${PLATFORM_CONTEXT}

Review this blog post and suggest targeted improvements:

TITLE: ${title}
EXCERPT: ${blog.excerpt ?? ""}

${sectionsText}

CTA: ${blog.cta ?? ""}
${instructions ? `\nEditor notes: ${instructions}` : ""}

Return a JSON object with this structure (omit any key that does not need improvement — use null for fields that are already good):
{
  "overall": ["2-3 high-level observations about the post"],
  "title": "improved title text, or null if fine",
  "excerpt": "improved excerpt text, or null if fine",
  "sections": [
    {"index": 0, "body": "full improved body text for this section", "note": "one-line reason"}
  ],
  "cta": "improved CTA text, or null if fine"
}

Be specific and actionable. Focus on: engagement, clarity, natural flow, relevance to both football fans and crypto users. Only include sections that genuinely need improvement. Return only valid JSON.`
    } else {
      const thread = metadata as {
        tweets?: { number: number; text: string; isHook: boolean }[]
        estimatedImpressions?: string
      }
      const tweetsText =
        thread.tweets?.map((t) => `Tweet ${t.number}${t.isHook ? " (hook)" : ""}: ${t.text}`).join("\n") ?? ""

      prompt = `You are a senior social media editor reviewing a Twitter thread for Onchain World Cup.

${PLATFORM_CONTEXT}

Review this Twitter thread and suggest improvements for weaker tweets:

${tweetsText}
${instructions ? `\nEditor notes: ${instructions}` : ""}

Return a JSON object (only include tweets that need improvement):
{
  "overall": ["2-3 high-level observations about the thread"],
  "tweets": [
    {"number": 1, "text": "full improved tweet text (MUST be under 280 characters)", "note": "one-line reason"}
  ]
}

Focus on: hook strength, clarity, pacing, engagement, natural flow between tweets. Ensure every improved tweet is strictly under 280 characters. Return only valid JSON.`
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    const rawContent = completion.choices[0].message.content ?? ""
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const suggestions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions })
  } catch (err) {
    console.error("[content/suggest]", err)
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
}
