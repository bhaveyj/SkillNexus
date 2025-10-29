"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  const topics = ["AI", "Machine Learning", "Data Engineering", "Web3", "MLOps"]

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-pretty text-4xl md:text-5xl font-semibold tracking-tight">
              Exchange niche tech skills one-on-one. Learn fast. Teach what you know.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              SkillNexus matches you with peers for focused 1:1 sessions and curates masterclasses from industry experts
              on AI, ML, and emerging technologies.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button asChild>
                <Link href="/auth/signup">Find a skill partner</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard">Explore masterclasses</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {topics.map((t) => (
                <Badge key={t} variant="secondary" className="border-border bg-secondary text-secondary-foreground">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 md:p-6">
            <img
              src="/people-discussing-technology-in-a-workshop.jpg"
              alt="Peers exchanging skills during a focused tech session"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
