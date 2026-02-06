import { Metadata } from 'next'
import countriesData from '@/data/countries.json'

type Props = {
  params: Promise<{ countryId: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryId } = await params
  const countryIdUpper = countryId.toUpperCase()

  // Find country data from JSON - support both country code (PT) and name (PORTUGAL)
  const country = countriesData.find(
    (c) => c.code.toUpperCase() === countryIdUpper || c.name.toUpperCase() === countryIdUpper
  )

  const countryName = country?.name || countryId
  const countryFlag = country?.flagEmoji || '🏳️'

  return {
    title: `Vote for ${countryName} ${countryFlag} | World Cup 2026 Qualification`,
    description: `Support ${countryName} in World Cup 2026 qualification voting. Vote with ETH on Base Network. Dynamic pricing - early voters get better rates.`,
    openGraph: {
      title: `${countryFlag} ${countryName} - World Cup 2026 Qualification`,
      description: `Vote for ${countryName} with ETH on Base Network. Support your country in qualification voting.`,
      type: 'website',
      url: `https://app.onchainworldcup.xyz/qualification/${countryId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${countryFlag} Vote for ${countryName} - World Cup 2026`,
      description: `Support ${countryName} in qualification voting with ETH on Base Network.`,
    },
  }
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children
}
