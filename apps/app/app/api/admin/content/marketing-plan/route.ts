import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"

const MARKETING_PLAN_PROMPT = `You are a growth marketing strategist for Onchain World Cup, a Web3 application where users vote on World Cup 2026 matches using ETH on the Base blockchain network.

Context:
- World Cup 2026 is approaching (June–July 2026)
- The app is available on Base network and as a Farcaster Mini App
- Target: football fans + crypto/Web3 users
- Key mechanics: ETH voting with dynamic pricing (early voters get more votes per ETH), NFT rewards, prize pools
- Qualification phase: community votes to decide which 48 countries qualify
- Platform fee: 10% of prize pool

Current date: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}

Generate a comprehensive content marketing plan focused on user acquisition. Return as JSON:

{
  "executiveSummary": "2-3 sentence overview of the strategy",
  "targetAudiences": [
    {
      "segment": "Segment name",
      "description": "Who they are",
      "size": "Estimated addressable market",
      "channels": ["primary channels to reach them"],
      "painPoints": ["what they care about"],
      "messagingHook": "Key message for this segment"
    }
  ],
  "contentPillars": [
    {
      "pillar": "Pillar name",
      "description": "What this content category covers",
      "rationale": "Why this drives acquisition"
    }
  ],
  "contentCalendar": {
    "prelaunch": {
      "timeframe": "Now - April 2026",
      "themes": ["theme1", "theme2"],
      "weeklyContent": [
        {
          "week": "Week label",
          "blog": "Blog post topic",
          "twitter": "Twitter thread topic",
          "notes": "Any special notes"
        }
      ]
    },
    "launchPhase": {
      "timeframe": "May - June 2026",
      "themes": ["theme1", "theme2"],
      "weeklyContent": [
        {
          "week": "Week label",
          "blog": "Blog post topic",
          "twitter": "Twitter thread topic",
          "notes": "Any special notes"
        }
      ]
    },
    "worldCupPhase": {
      "timeframe": "June - July 2026",
      "themes": ["theme1", "theme2"],
      "weeklyContent": [
        {
          "week": "Week label",
          "blog": "Blog post topic",
          "twitter": "Twitter thread topic",
          "notes": "Any special notes"
        }
      ]
    }
  },
  "distributionChannels": [
    {
      "channel": "Channel name",
      "priority": "high|medium|low",
      "strategy": "How to use this channel",
      "kpis": ["KPI 1", "KPI 2"]
    }
  ],
  "growthTactics": [
    {
      "tactic": "Tactic name",
      "description": "How to execute",
      "expectedImpact": "Expected outcome",
      "effort": "low|medium|high"
    }
  ],
  "kpis": [
    {
      "metric": "Metric name",
      "target": "Target value",
      "timeframe": "When to achieve"
    }
  ],
  "competitiveAdvantages": ["advantage 1", "advantage 2", "advantage 3"]
}

Make the plan specific to World Cup 2026 timing, the Farcaster ecosystem, Base network community, and the unique mechanics of the platform. Focus on tactics that work with limited budget but high engagement. Return only valid JSON, no markdown code fences.`

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
    max_tokens: 8192,
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
    if (!process.env.GOOGLE_AI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "No AI provider configured. Set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY." },
        { status: 500 }
      )
    }

    const { raw: rawContent, provider } = await generateContent(MARKETING_PLAN_PROMPT)

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const plan = JSON.parse(jsonMatch[0])

    return NextResponse.json({ plan, generatedAt: new Date().toISOString(), provider })
  } catch (err) {
    console.error("[content/marketing-plan]", err)
    return NextResponse.json({ error: "Marketing plan generation failed" }, { status: 500 })
  }
}
