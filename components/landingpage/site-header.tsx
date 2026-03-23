"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV = [
  { label: "How it works",  id: "how" },
  { label: "Masterclasses", id: "masterclasses" },
  { label: "FAQs",          id: "faq" },
];

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const smooth = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className={cn(
        "fixed z-50 transition-all duration-500 ease-out",
        scrolled
          ? "inset-x-4 top-3 rounded-2xl glass-nav shadow-2xl shadow-black/50"
          : "inset-x-0 top-0 bg-transparent border-b border-white/[0.05]",
      )}>
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-violet-600/30 blur group-hover:blur-md transition-all duration-300"/>
              <img src="/logo.svg" alt="SkillNexus" className="relative h-7 w-7 group-hover:scale-105 transition-transform duration-200"/>
            </div>
            <span className="font-bold text-[15px] tracking-tight gradient-text-violet">SkillNexus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(link => (
              <a key={link.id}
                href={`#${link.id}`}
                onClick={e => smooth(e, link.id)}
                className="group px-4 py-2 rounded-xl text-sm font-medium cursor-pointer text-foreground/50 hover:text-foreground/90 transition-all duration-200 hover:bg-white/[0.05] relative"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-[1px] bg-violet-500/0 group-hover:bg-violet-500/40 transition-all duration-200 rounded-full"/>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-9 w-20 rounded-xl bg-white/5 animate-pulse"/>
            ) : session ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-foreground/60 hover:text-foreground" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="border-white/[0.1] text-foreground/60 hover:text-foreground hover:border-white/[0.2]">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-foreground/55 hover:text-foreground" asChild>
                  <Link href="/auth/signin">Log in</Link>
                </Button>
                <Button size="sm" className="shadow-lg shadow-violet-600/30 font-semibold" asChild>
                  <Link href="/auth/signup">Join free →</Link>
                </Button>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.08] transition-all"
            >
              {[0,1,2].map(i => (
                <span key={i} className={cn(
                  "block h-[1.5px] bg-foreground/60 origin-center transition-all duration-300",
                  i===0 && (mobileOpen ? "w-4 rotate-45 translate-y-[6.5px]" : "w-4"),
                  i===1 && (mobileOpen ? "w-0 opacity-0" : "w-3"),
                  i===2 && (mobileOpen ? "w-4 -rotate-45 -translate-y-[6.5px]" : "w-4"),
                )}/>
              ))}
            </button>
          </div>
        </div>
      </header>

      <div className={cn(
        "fixed inset-0 z-40 md:hidden transition-all duration-300",
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}>
        <div className="absolute inset-0 bg-[#080612]/97 backdrop-blur-2xl" onClick={() => setMobileOpen(false)}/>

        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"/>

        <nav className="relative pt-24 pb-10 px-6 flex flex-col gap-1">
          {NAV.map((link, i) => (
            <a key={link.id}
              href={`#${link.id}`}
              onClick={e => smooth(e, link.id)}
              className={cn(
                "px-5 py-4 rounded-2xl text-xl font-semibold cursor-pointer",
                "text-foreground/65 hover:text-violet-300 hover:bg-violet-500/8",
                "transition-all duration-200 animate-fade-in-up opacity-0",
              )}
              style={{ animationDelay:`${60+i*55}ms`, animationFillMode:"forwards" }}
            >
              {link.label}
            </a>
          ))}

          <div className="h-px bg-white/[0.06] my-4"/>

          {!session && (
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="h-12 text-base rounded-2xl border-white/[0.12]">
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>Log in</Link>
              </Button>
              <Button asChild className="h-12 text-base rounded-2xl shadow-xl shadow-violet-600/30">
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>Join free →</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}