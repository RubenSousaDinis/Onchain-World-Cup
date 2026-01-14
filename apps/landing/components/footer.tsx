import Link from "next/link"
import { Twitter, MessageCircle, Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-xl font-bold text-primary">Onchain World Cup</p>
            <p className="text-sm text-muted-foreground">The World Cup, decided onchain.</p>
          </div>

          <div className="flex gap-4">
            <Link
              href="https://x.com/OnchainC29697"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://farcaster.xyz/onchainworldcup"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link
              href="https://zora.co/@onchainworldcup"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Zap className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Onchain World Cup. Built on Base.</p>
        </div>
      </div>
    </footer>
  )
}
