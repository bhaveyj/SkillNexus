"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-5">
        <div className="absolute inset-x-8 top-6 bottom-6 rounded-2xl bg-violet-600/6 blur-3xl pointer-events-none"/>

        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#110d26] via-[#0e0b20] to-[#0d0920]"/>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/8 via-transparent to-rose-600/5"/>
          <div className="absolute inset-0 border border-white/[0.07] rounded-2xl pointer-events-none"/>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none"/>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-violet-600/12 to-transparent pointer-events-none"/>
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-rose-600/6 to-transparent pointer-events-none"/>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 md:px-12 py-9 md:py-10">
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug mb-2">
                Ready to <span className="gradient-text">accelerate</span> your growth?
              </h2>
              <p className="text-sm text-foreground/45 max-w-md">
                Join SkillNexus to exchange skills with peers and attend expert-led masterclasses.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button asChild size="lg"
                className="shadow-xl shadow-violet-600/28 pulse-glow h-11 px-6 font-bold text-sm">
                <Link href="/auth/signup">Get started free →</Link>
              </Button>
              <Button asChild variant="glass" size="lg"
                className="h-11 px-5 text-sm text-foreground/55 hover:text-foreground">
                <Link href="/dashboard/masterclasses">Browse Masterclasses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}