"use client"

import { Button } from "@/components/ui/button"

export function CtaBanner() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="rounded-2xl border border-border bg-secondary p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-pretty text-2xl md:text-3xl font-semibold">Ready to accelerate your growth?</h3>
            <p className="text-muted-foreground mt-2">
              Join SkillNexus to exchange skills with peers and attend expert-led masterclasses.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button className="flex-1 md:flex-none">
              Get started free
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none">
              Browse topics
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
