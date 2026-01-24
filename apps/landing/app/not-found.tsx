import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          {/* Error Code */}
          <div className="mb-8">
            <div className="text-9xl md:text-[12rem] font-bold text-primary/10 mb-4 font-mono leading-none">
              404
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-foreground/70 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors"
          >
            ⚽ Back to Home
          </Link>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-secondary/50 border border-border rounded-sm">
            <p className="text-sm text-foreground/80">
              Looking for the app?{" "}
              <a
                href="https://app.onchainworldcup.xyz"
                className="text-primary hover:text-primary/80 underline font-semibold"
              >
                Visit app.onchainworldcup.xyz
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
