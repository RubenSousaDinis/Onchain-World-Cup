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
export default function HomePage() {
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

          {/* Dynamic content — stats, leaderboard preview, quick actions */}
          <HomeLazy />
        </main>
      </div>
    </div>
  )
}
