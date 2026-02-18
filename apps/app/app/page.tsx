import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { HomeLazy } from "./home-lazy"

/**
 * Homepage — server component wrapper.
 *
 * The Hero section (h1 LCP element) is static HTML rendered on the server,
 * so it paints immediately without waiting for any JS bundle.
 * All dynamic/interactive content (wagmi hooks, contracts, stats, leaderboard
 * preview) is handled by HomeLazy, which is code-split with ssr:false and
 * loads as a separate JS chunk after hydration.
 */

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "https://app.onchainworldcup.xyz"
    const res = await fetch(`${baseUrl}/api/qualification/summary`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const { data } = await res.json()
    return data
  } catch {
    return null
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
          {/* Hero Section — static, server-rendered, LCP element */}
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="soccer-field-bg p-6 lg:p-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                  <span className="cm-highlight">Onchain World Cup</span>
                </h1>
                <p className="text-base lg:text-xl text-foreground/90 mb-2">
                  The World Cup, decided onchain.
                </p>
                <p className="text-sm lg:text-base text-foreground/70">
                  Vote with ETH on Base network • Community determines qualification • Winners share prize pool
                </p>
              </div>
            </div>
          </div>

          {/* Intro Section — server-rendered for SEO */}
          <section aria-labelledby="about-heading" className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 p-6 lg:p-8">
            <h2 id="about-heading" className="text-xl lg:text-2xl font-bold mb-3 cm-highlight">
              What Is Onchain World Cup?
            </h2>
            <p className="text-sm lg:text-base text-foreground/80 leading-relaxed">
              Onchain World Cup is a community-driven football tournament that runs entirely on the Base blockchain.
              Fans from around the world vote with ETH to decide which 48 national teams qualify for the tournament —
              no matches needed, pure community support. The earlier you vote, the cheaper each vote costs thanks
              to dynamic bonding-curve pricing. Once the top 48 countries are determined, they advance to group
              stages and knockout rounds decided by the community, culminating in a champion crowned before the
              real FIFA World Cup 2026 kicks off on June 11. All voting logic and prize distribution are handled
              by open-source smart contracts on Base. 90% of the prize pool is shared proportionally among voters
              who backed the winning country.
            </p>
          </section>

          {/* Live Stats Section — server-side fetched for SEO */}
          <section aria-labelledby="stats-heading" className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 p-6 lg:p-8">
            <h2 id="stats-heading" className="text-xl lg:text-2xl font-bold mb-4 cm-highlight">
              Live Tournament Stats
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl lg:text-3xl font-bold cm-highlight">64</p>
                <p className="text-xs lg:text-sm text-foreground/70 mt-1">Countries Competing</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold cm-highlight">
                  {stats?.total_votes != null ? stats.total_votes.toLocaleString() : "—"}
                </p>
                <p className="text-xs lg:text-sm text-foreground/70 mt-1">Total Votes Cast</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold cm-highlight">
                  {stats?.total_eth != null ? `${parseFloat(stats.total_eth).toFixed(3)} ETH` : "—"}
                </p>
                <p className="text-xs lg:text-sm text-foreground/70 mt-1">Prize Pool</p>
              </div>
            </div>
          </section>

          {/* How It Works Section — static, server-rendered for SEO */}
          <section aria-labelledby="how-heading" className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 p-6 lg:p-8">
            <h2 id="how-heading" className="text-xl lg:text-2xl font-bold mb-4 cm-highlight">
              How It Works
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="cm-highlight font-bold text-lg shrink-0">1.</span>
                <div>
                  <h3 className="font-bold text-sm lg:text-base">Connect your wallet</h3>
                  <p className="text-xs lg:text-sm text-foreground/70 mt-0.5">Use Coinbase Wallet, MetaMask, or any Base-compatible wallet to get started.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="cm-highlight font-bold text-lg shrink-0">2.</span>
                <div>
                  <h3 className="font-bold text-sm lg:text-base">Choose a country and vote with ETH</h3>
                  <p className="text-xs lg:text-sm text-foreground/70 mt-0.5">Pick any of the 64 competing nations and cast votes. Earlier votes are cheaper — dynamic bonding-curve pricing rewards early supporters.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="cm-highlight font-bold text-lg shrink-0">3.</span>
                <div>
                  <h3 className="font-bold text-sm lg:text-base">Top 48 countries qualify for the tournament</h3>
                  <p className="text-xs lg:text-sm text-foreground/70 mt-0.5">The 48 countries with the most community votes advance to group stages and knockout rounds.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="cm-highlight font-bold text-lg shrink-0">4.</span>
                <div>
                  <h3 className="font-bold text-sm lg:text-base">Winners share 90% of the prize pool proportionally</h3>
                  <p className="text-xs lg:text-sm text-foreground/70 mt-0.5">If your country wins, you earn a share of the entire prize pool — proportional to how many votes you cast.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Dynamic content — stats, leaderboard preview, quick actions */}
          <HomeLazy />
        </main>
      </div>
    </div>
  )
}
