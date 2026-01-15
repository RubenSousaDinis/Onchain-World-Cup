import Link from "next/link"
import Image from "next/image"
import { Twitter, Mail } from "lucide-react"
import { Button } from "./ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Onchain World Cup" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">Onchain World Cup</span>
          </Link>
          <nav className="hidden gap-6 md:flex items-center">
            <Link
              href="#how-it-works"
              className="text-base font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#phases"
              className="text-base font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Phases
            </Link>
            <Link href="#faq" className="text-base font-medium text-foreground/80 transition-colors hover:text-primary">
              FAQ
            </Link>
            <a
              href="https://app.onchainworldcup.xyz"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-sm font-semibold text-base hover:bg-accent transition-colors"
            >
              Launch App
            </a>
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
              className="flex items-center justify-center"
            >
              <Image src="/farcaster.png" alt="Farcaster" width={20} height={20} className="h-5 w-5 object-contain" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://zora.co/@onchainworldcup" target="_blank" rel="noopener noreferrer" aria-label="Zora" className="flex items-center justify-center">
              <Image src="/zora.png" alt="Zora" width={20} height={20} className="h-5 w-5 object-contain" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="mailto:onchainworldcup@gmail.com" aria-label="Email">
              <Mail className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
