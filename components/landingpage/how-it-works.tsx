"use client"

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

export function HowItWorks() {
  const steps = [
    { 
      t: "Tell us your goals", 
      d: "Share what you want to learn or teach in AI/ML and niche tech.",
      image: "/goals-setup-screen.jpg",
    },
    { 
      t: "Get matched or book", 
      d: "We pair you with peers or you pick a masterclass that fits.",
      image: "/matching-algorithm-visualization.jpg",
    },
    { 
      t: "Learn. Apply. Repeat.", 
      d: "Actionable sessions with takeaways you can use immediately.",
      image: "/learning-progress-dashboard.jpg",
    },
  ]

  return (
    <section id="how" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <CardContainer key={s.t} className="inter-var w-full">
              <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.1] border-border w-full min-h-[400px] h-full rounded-xl border flex flex-col overflow-hidden">
                <CardItem translateZ="50" className="relative h-64 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0">
                  <img
                    src={s.image || "/placeholder.svg"}
                    alt={`${s.t} illustration`}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                </CardItem>
                <div className="p-6 flex-1 flex flex-col">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-card-foreground mb-2"
                  >
                    {s.t}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-muted-foreground text-sm leading-relaxed"
                  >
                    {s.d}
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </section>
  )
}
