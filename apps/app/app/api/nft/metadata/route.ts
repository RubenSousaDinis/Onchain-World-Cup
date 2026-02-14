import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/utils/og-image'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') || 'Achievement'
  const description = searchParams.get('description') || ''
  const icon = searchParams.get('icon') || '🏆'
  const rarity = searchParams.get('rarity') || 'common'
  const address = searchParams.get('address') || ''
  const achievementId = searchParams.get('achievementId') || ''
  const points = parseInt(searchParams.get('points') || '0', 10)

  const baseUrl = getBaseUrl()

  const imageUrl =
    `${baseUrl}/api/og/achievement-card?` +
    new URLSearchParams({ title, description, icon, rarity, address }).toString()

  const metadata = {
    name: title,
    description,
    image: imageUrl,
    external_url: `${baseUrl}/users/${address}`,
    attributes: [
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Achievement', value: achievementId },
      { trait_type: 'Points', value: points, display_type: 'number' },
    ],
  }

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
