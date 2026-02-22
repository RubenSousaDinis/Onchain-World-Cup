import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

function getBlogPrompt(topic: string, customPrompt: string): string {
  return `You are a content writer for Onchain World Cup, a Web3 voting platform for World Cup 2026.

${PLATFORM_CONTEXT}

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

Write approximately 800-1200 words total. Make it engaging, informative, and relevant to both football fans and crypto users. Include specific details about how Onchain World Cup works where relevant.`
}

function getTwitterThreadPrompt(topic: string, customPrompt: string): string {
  return `You are a social media manager for Onchain World Cup, a Web3 voting platform for World Cup 2026.

${PLATFORM_CONTEXT}

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

Write 6-10 tweets. The first tweet must be a compelling hook. Each tweet must be under 280 characters. The last tweet should have a clear CTA. Use emojis sparingly but effectively. Focus on the topic while naturally weaving in Onchain World Cup.`
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
    }

    const prompt = type === "blog"
      ? getBlogPrompt(topic, customPrompt)
      : getTwitterThreadPrompt(topic, customPrompt)

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const rawContent = message.content[0].type === "text" ? message.content[0].text : ""

    // Extract JSON from the response
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
    })
  } catch (err) {
    console.error("[content/generate]", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
