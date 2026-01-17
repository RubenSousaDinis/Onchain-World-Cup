"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { getAppUrl } from "@/lib/utils"

export function HeroSection() {
  const [appUrl, setAppUrl] = useState("https://app.onchainworldcup.xyz")
  
  useEffect(() => {
    setAppUrl(getAppUrl())
  }, [])
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">Onchain World Cup</h1>
          <p className="mb-4 text-2xl font-semibold text-primary md:text-3xl">The World Cup, decided onchain.</p>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Support your country.
            <br />
            Coordinate with fans worldwide.
            <br />
            Crown the onchain champion — before the real World Cup even starts.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-accent"
              asChild
            >
              <a href={appUrl}>Join Qualification Phase</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary px-8 py-6 text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all"
              asChild
            >
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
