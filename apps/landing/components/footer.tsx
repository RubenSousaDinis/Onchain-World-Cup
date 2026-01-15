import Link from "next/link"
import Image from "next/image"
import { Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-xl font-bold text-primary">Onchain World Cup</p>
            <p className="text-sm text-muted-foreground">The World Cup, decided onchain.</p>
          </div>

          <div className="flex gap-6 items-center">
            <Link
              href="https://x.com/OnchainC29697"
              className="text-foreground transition-opacity hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on X (Twitter)"
            >
              <Twitter className="h-6 w-6" />
            </Link>
            <Link
              href="https://farcaster.xyz/onchainworldcup"
              className="transition-opacity hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Farcaster"
            >
              <Image src="/farcaster.png" alt="Farcaster" width={24} height={24} className="h-6 w-6 object-contain" />
            </Link>
            <Link
              href="https://zora.co/@onchainworldcup"
              className="transition-opacity hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Zora"
            >
              <Image src="/zora.png" alt="Zora" width={24} height={24} className="h-6 w-6 object-contain" />
            </Link>
            <Link
              href="mailto:onchainworldcup@gmail.com"
              className="text-foreground transition-opacity hover:opacity-70"
              aria-label="Email us"
            >
              <Mail className="h-6 w-6" />
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
