import Link from "next/link"
import { Twitter, MessageCircle, Zap } from "lucide-react"
import { Button } from "./ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            Onchain World Cup
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#phases"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Phases
            </Link>
            <Link href="#faq" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
              FAQ
            </Link>
            <Link
              href="https://app.onchainworldcup.xyz"
              className="text-sm font-medium text-primary transition-colors hover:text-accent"
            >
              App
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://x.com/OnchainC29697" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Farcaster"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://zora.co/@onchainworldcup" target="_blank" rel="noopener noreferrer" aria-label="Zora">
              <Zap className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
