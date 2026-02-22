import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/server/prisma"

const PLATFORM_CONTEXT = `
Onchain World Cup is a Web3 application where users vote/bet on World Cup 2026 matches using ETH on the Base network.

Key features:
- Vote on match outcomes using ETH (Base network)
- Two-phase pricing: early voters get more votes for less ETH (linear pricing Phase 1), later voters pay exponentially more (Phase 2)
- 90% of ETH goes to winners proportionally by vote count, 10% platform fee
- NFT rewards for participants
- Available as a Farcaster Mini App
- Qualification phase where community votes to decide which 48 countries qualify
- Fully onchain — smart contracts handle all voting and payouts

Target audiences:
- Crypto/Web3 enthusiasts who follow football/soccer
- Football fans curious about crypto
- DeFi/Base network users
- Farcaster community members
- World Cup 2026 fans

Tone: energetic, passionate about football, approachable for both crypto natives and football fans, emphasizes fairness and fun.
Brand voice: "Onchain World Cup" (never "Crypto World Cup")
`

async function buildMemoryContext(type: string): Promise<string> {
  const posts = await prisma.contentPost.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      topic: true,
      status: true,
      performanceRating: true,
      performanceNotes: true,
      publishedAt: true,
    },
  })

  if (posts.length === 0) return ""

  const published = posts.filter((p) => p.status === "published" || p.status === "archived")
  const drafts = posts.filter((p) => p.status === "draft")

  const goodPerformers = published.filter((p) => p.performanceRating === "good")
  const poorPerformers = published.filter((p) => p.performanceRating === "poor")

  const lines: string[] = ["--- CONTENT MEMORY (use this to inform your generation) ---"]

  if (published.length > 0) {
    lines.push(`\nAlready published ${type === "blog" ? "blog posts" : "Twitter threads"} (DO NOT repeat these topics):`)
    published.forEach((p) => {
      const rating = p.performanceRating ? ` [${p.performanceRating.toUpperCase()}]` : ""
      const topic = p.topic ?? p.title
      lines.push(`  - "${topic}"${rating}`)
    })
  }

  if (drafts.length > 0) {
    lines.push(`\nExisting drafts (consider these topics already being worked on):`)
    drafts.forEach((p) => {
      lines.push(`  - "${p.topic ?? p.title}"`)
    })
  }

  if (goodPerformers.length > 0) {
    lines.push(`\nHigh-performing content (emulate these angles and styles):`)
    goodPerformers.forEach((p) => {
      const note = p.performanceNotes ? ` — ${p.performanceNotes}` : ""
      lines.push(`  - "${p.topic ?? p.title}"${note}`)
    })
  }

  if (poorPerformers.length > 0) {
    lines.push(`\nPoor-performing content (avoid these angles):`)
    poorPerformers.forEach((p) => {
      const note = p.performanceNotes ? ` — ${p.performanceNotes}` : ""
      lines.push(`  - "${p.topic ?? p.title}"${note}`)
    })
  }

  lines.push("--- END CONTENT MEMORY ---")

  return "\n\n" + lines.join("\n")
}

function getBlogPrompt(topic: string, customPrompt: string, memoryContext: string): string {
  return `You are a content writer for Onchain World Cup, a Web3 voting platform for World Cup 2026.

${PLATFORM_CONTEXT}${memoryContext}

Write a compelling blog post about: ${topic}
${customPrompt ? `\nAdditional instructions: ${customPrompt}` : ""}

Format the blog post as JSON with this structure:
{
  "title": "Engaging blog post title",
  "excerpt": "2-3 sentence summary for previews",
  "sections": [
    {
      "heading": "Section heading",
      "body": "Section content (2-4 paragraphs)"
    }
  ],
  "cta": "Call-to-action sentence linking back to the platform",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedReadTime": 5
}

Write approximately 800-1200 words total. Make it engaging, informative, and relevant to both football fans and crypto users. Include specific details about how Onchain World Cup works where relevant. Ensure this post covers a fresh angle not already addressed in the content memory above. Return only valid JSON, no markdown code fences.`
}

function getTwitterThreadPrompt(topic: string, customPrompt: string, memoryContext: string): string {
  return `You are a social media manager for Onchain World Cup, a Web3 voting platform for World Cup 2026.

${PLATFORM_CONTEXT}${memoryContext}

Write a Twitter/X thread about: ${topic}
${customPrompt ? `\nAdditional instructions: ${customPrompt}` : ""}

Format as JSON with this structure:
{
  "title": "Thread topic summary",
  "tweets": [
    {
      "number": 1,
      "text": "Hook tweet — must grab attention, max 280 chars",
      "isHook": true
    },
    {
      "number": 2,
      "text": "Follow-up tweet content, max 280 chars",
      "isHook": false
    }
  ],
  "hashtags": ["WorldCup2026", "Base", "OnchainWorldCup"],
  "estimatedImpressions": "1k-5k"
}

Write 6-10 tweets. The first tweet must be a compelling hook. Each tweet must be under 280 characters. The last tweet should have a clear CTA. Use emojis sparingly but effectively. Focus on the topic while naturally weaving in Onchain World Cup. Ensure this thread takes a fresh angle not already covered in the content memory above. Return only valid JSON, no markdown code fences.`
}

async function generateWithGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" } as object,
  })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function generateWithClaude(prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })
  return message.content[0].type === "text" ? message.content[0].text : ""
}

async function generateContent(prompt: string): Promise<{ raw: string; provider: string }> {
  if (process.env.GOOGLE_AI_API_KEY) {
    const raw = await generateWithGemini(prompt)
    return { raw, provider: "gemini-2.0-flash" }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const raw = await generateWithClaude(prompt)
    return { raw, provider: "claude-haiku-4-5" }
  }
  throw new Error("No AI provider configured. Set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY.")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, topic, customPrompt = "" } = body

    if (!type || !topic) {
      return NextResponse.json({ error: "type and topic are required" }, { status: 400 })
    }

    if (!["blog", "twitter_thread"].includes(type)) {
      return NextResponse.json({ error: "type must be blog or twitter_thread" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "No AI provider configured. Set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY." },
        { status: 500 }
      )
    }

    const memoryContext = await buildMemoryContext(type)

    const prompt =
      type === "blog"
        ? getBlogPrompt(topic, customPrompt, memoryContext)
        : getTwitterThreadPrompt(topic, customPrompt, memoryContext)

    const { raw: rawContent, provider } = await generateContent(prompt)

    // Extract JSON from the response (handles both raw JSON and markdown fences)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      type,
      topic,
      prompt: customPrompt,
      generated: parsed,
      rawContent,
      memoryUsed: memoryContext.length > 0,
      provider,
    })
  } catch (err) {
    console.error("[content/generate]", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
