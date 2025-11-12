"use client"

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

const items = [
  {
    title: "1:1 Skill Exchange",
    desc: "Swap expertise with vetted peers for focused, hands-on learning.",
    image: "/skill-exchange-illustration.jpg",
  },
  {
    title: "Industry Masterclasses",
    desc: "Live sessions led by practitioners from top tech teams.",
    image: "/masterclass-illustration.jpg",
  },
  {
    title: "Structured Outcomes",
    desc: "Templates and goals to ensure every session delivers value.",
    image: "/structured-outcomes-illustration.jpg",
  },
]

export function ValueProps() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Why SkillNexus</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <CardContainer key={it.title} className="inter-var w-full">
              <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.1] border-border w-full min-h-[400px] h-full rounded-xl border flex flex-col overflow-hidden">
                <CardItem translateZ="50" className="relative h-64 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0">
                  <img
                    src={it.image || "/placeholder.svg"}
                    alt={`${it.title} illustration`}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                </CardItem>
                <div className="p-6 flex-1 flex flex-col">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-card-foreground mb-2"
                  >
                    {it.title}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-muted-foreground text-sm"
                  >
                    {it.desc}
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
