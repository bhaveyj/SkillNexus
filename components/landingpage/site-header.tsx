"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { data: session, status } = useSession()

  return (
    <header className="w-full border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="SkillNexus" className="h-6 w-6" />
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
          {status === "loading" ? (
            <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
          ) : session ? (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/signin">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Join free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
