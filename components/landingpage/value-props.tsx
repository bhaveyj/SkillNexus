"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const items = [
  {
    title: "1:1 Skill Exchange",
    desc: "Swap expertise with vetted peers for focused, hands-on learning.",
  },
  {
    title: "Industry Masterclasses",
    desc: "Live sessions led by practitioners from top tech teams.",
  },
  {
    title: "Structured Outcomes",
    desc: "Templates and goals to ensure every session delivers value.",
  },
]

export function ValueProps() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mb-8">
          <Badge className="bg-accent text-accent-foreground hover:opacity-90">Why SkillNexus</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.title} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">{it.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{it.desc}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
