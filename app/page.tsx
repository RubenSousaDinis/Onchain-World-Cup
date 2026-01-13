import { redirect } from "next/navigation"

export const metadata = {
  title: "Onchain World Cup 2026 | Onchain Qualification Phase",
  description:
    "Vote for countries in the Onchain World Cup 2026 Qualification Phase. Community decides which 48 nations qualify for the tournament on Base network.",
  openGraph: {
    title: "Onchain World Cup 2026 | Onchain Qualification Phase",
    description: "Vote for countries to qualify for World Cup 2026. Onchain users decide who advances.",
  },
}

export default function HomePage() {
  redirect("/qualification")
}
