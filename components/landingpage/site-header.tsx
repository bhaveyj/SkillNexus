"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2">
          <span aria-hidden className="h-6 w-6 rounded-md bg-primary" />
          <span className="font-semibold tracking-tight">SkillNexus</span>
          <span className="sr-only">SkillNexus home</span>
        </Link>

        <nav className={cn("hidden md:flex items-center gap-6 text-sm")}>
          <a
            href="#how"
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
          >
            How it works
          </a>
          <a
            href="#masterclasses"
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
          >
            Masterclasses
          </a>
          <a
            href="#faq"
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
          >
            FAQs
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button>Join free</Button>
        </div>
      </div>
    </header>
  )
}
