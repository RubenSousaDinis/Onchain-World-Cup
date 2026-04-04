import { Button } from "./ui/button"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.onchainworldcup.xyz"

export function FinalCTASection() {
  return (
    <section className="border-b border-border bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Back Your Country.
            <br />
            Win ETH.
            <br />
            <span className="text-primary">Crown the Champion Before June 11.</span>
          </h2>

          <Button
            size="lg"
            className="mt-8 bg-primary px-12 py-6 text-xl font-bold text-primary-foreground hover:bg-accent transition-colors duration-200"
            asChild
          >
            <a href={appUrl}>Vote for Your Country</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
