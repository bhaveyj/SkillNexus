import { SiteHeader } from "@/components/landingpage/site-header"
import { Hero } from "@/components/landingpage/hero"
import { ValueProps } from "@/components/landingpage/value-props"
import { HowItWorks } from "@/components/landingpage/how-it-works"
import { Masterclasses } from "@/components/landingpage/masterclasses"
import { CtaBanner } from "@/components/landingpage/cta-banner"
import { SiteFooter } from "@/components/landingpage/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <ValueProps />
      <HowItWorks />
      <Masterclasses />
      <CtaBanner />
      <SiteFooter />
    </main>
  )
}
