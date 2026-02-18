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
 *
 * SEO content (intro, how-it-works, stats) is kept in the HTML via sr-only
 * so crawlers index it without it taking up visual space.
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

            {/* Compact stats strip — visible, server-rendered */}
            <div className="border-t border-border/30 px-6 lg:px-8 py-3 flex items-center gap-6 text-xs lg:text-sm text-foreground/70">
              <span><span className="cm-highlight font-bold">64</span> countries</span>
              <span className="text-border/50">·</span>
              {stats?.total_votes != null && (
                <>
                  <span><span className="cm-highlight font-bold">{stats.total_votes.toLocaleString()}</span> votes cast</span>
                  <span className="text-border/50">·</span>
                </>
              )}
              {stats?.total_eth != null && (
                <span><span className="cm-highlight font-bold">{parseFloat(stats.total_eth).toFixed(3)} ETH</span> prize pool</span>
              )}
            </div>
          </div>

          {/* SEO content — indexed by crawlers, invisible to users */}
          <div className="sr-only">
            <section aria-labelledby="about-heading">
              <h2 id="about-heading">What Is Onchain World Cup?</h2>
              <p>
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

            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading">Live Tournament Stats</h2>
              <ul>
                <li>64 countries competing</li>
                {stats?.total_votes != null && <li>{stats.total_votes.toLocaleString()} total votes cast</li>}
                {stats?.total_eth != null && <li>{parseFloat(stats.total_eth).toFixed(3)} ETH prize pool</li>}
              </ul>
            </section>

            <section aria-labelledby="how-heading">
              <h2 id="how-heading">How It Works</h2>
              <ol>
                <li>Connect your wallet — use Coinbase Wallet, MetaMask, or any Base-compatible wallet.</li>
                <li>Choose a country and vote with ETH — earlier votes are cheaper thanks to bonding-curve pricing.</li>
                <li>Top 48 countries qualify for the tournament and advance to group stages and knockout rounds.</li>
                <li>Winners share 90% of the prize pool proportionally to how many votes they cast.</li>
              </ol>
            </section>
          </div>

          {/* Dynamic content — stats, leaderboard preview, quick actions */}
          <HomeLazy />
        </main>
      </div>
    </div>
  )
}
