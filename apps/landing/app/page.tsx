import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhatIsSection } from "@/components/what-is-section"
import { WhyExistsSection } from "@/components/why-exists-section"
import { PhasesSection } from "@/components/phases-section"
import { HowVotingWorksSection } from "@/components/how-voting-works-section"
import { BuiltForCryptoSection } from "@/components/built-for-crypto-section"
import { FinalCTASection } from "@/components/final-cta-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WhatIsSection />
        <WhyExistsSection />
        <PhasesSection />
        <HowVotingWorksSection />
        <BuiltForCryptoSection />
        <FinalCTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
