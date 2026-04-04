import Image from "next/image"

export function BuiltForCryptoSection() {
  return (
    <section className="border-b border-border py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-primary">Share With Your Fanbase</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Social momentum is part of the game. Share, rally your community, and watch your country rise.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-sm border-2 border-primary/30 bg-background p-8 text-left transition-colors duration-200 hover:border-primary cursor-pointer"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                  <svg viewBox="0 0 111 111" fill="none" className="h-6 w-6" aria-hidden="true">
                    <path d="M54.921 110.034C85.437 110.034 110.034 85.437 110.034 54.921C110.034 24.405 85.437 -0.191895 54.921 -0.191895C26.0432 -0.191895 2.35281 21.7781 0 50.0528H72.8467V59.7892H0C2.35281 88.0639 26.0432 110.034 54.921 110.034Z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Built on Base</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ethereum L2 by Coinbase. Gas fees under $0.01 per vote, fast confirmations, full Ethereum security.
              </p>
            </a>

            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-sm border-2 border-primary/30 bg-background p-8 text-left transition-colors duration-200 hover:border-primary cursor-pointer"
            >
              <div className="mb-4 flex items-center gap-3">
                <Image src="/farcaster.png" alt="Farcaster" width={40} height={40} className="h-10 w-10 object-contain" />
                <h3 className="text-xl font-bold text-foreground">Designed for Farcaster</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Native Farcaster Mini App. Cast your support, rally your followers, coordinate your country's community onchain.
              </p>
            </a>
          </div>

          <p className="mt-10 font-semibold text-primary">
            Your network is your edge. Early coordination wins.
          </p>
        </div>
      </div>
    </section>
  )
}
