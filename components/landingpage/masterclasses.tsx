"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ArrowRight } from "lucide-react";

type LandingMasterclass = {
  id: string; title: string; instructorName: string; date: string;
  avatar?: string | null; category?: string; level?: string; duration?: string;
  instructor?: { name?: string | null } | null;
};

const formatDate = (d: string) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
};

const ACCENTS = [
  { topGrad:"from-violet-900/70 via-violet-900/20", dot:"bg-violet-400", dateCls:"text-violet-400", border:"hover:border-violet-500/25", badge:"bg-violet-500/12 text-violet-300 border border-violet-500/22" },
  { topGrad:"from-rose-900/70 via-rose-900/20",     dot:"bg-rose-400",   dateCls:"text-rose-400",   border:"hover:border-rose-500/25",   badge:"bg-rose-500/12 text-rose-300 border border-rose-500/22" },
  { topGrad:"from-cyan-900/60 via-cyan-900/18",     dot:"bg-cyan-400",   dateCls:"text-cyan-400",   border:"hover:border-cyan-500/25",   badge:"bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" },
];

const LEVEL_BADGE: Record<string,string> = {
  BEGINNER:"bg-emerald-500/10 text-emerald-400 border border-emerald-500/18",
  INTERMEDIATE:"bg-amber-500/10 text-amber-400 border border-amber-500/18",
  ADVANCED:"bg-rose-500/10 text-rose-400 border border-rose-500/18",
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
      <div className="h-40 shimmer-skeleton"/>
      <div className="p-5 space-y-3">
        <div className="h-5 shimmer-skeleton rounded-lg w-3/4"/>
        <div className="h-4 shimmer-skeleton rounded-lg w-1/2"/>
        <div className="h-10 shimmer-skeleton rounded-xl mt-4"/>
      </div>
    </div>
  );
}

export function Masterclasses() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<LandingMasterclass[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/masterclass", {signal:ctrl.signal, cache:"no-store"});
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClasses((data.masterclasses || []).slice(0, 3));
      } catch { if (!ctrl.signal.aborted) { setHasError(true); setClasses([]); } }
      finally { if (!ctrl.signal.aborted) setLoading(false); }
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <section id="masterclasses" className="relative">
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[480px] h-[480px] rounded-full bg-rose-600/5 blur-[130px] pointer-events-none"/>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-rose-500/60"/>
              <span className="text-sm font-semibold text-rose-400 tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse inline-block"/>
                Live sessions
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-rose-500/60"/>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Upcoming <span className="gradient-text-rose">masterclasses</span>
            </h2>
            <p className="text-muted-foreground text-base">
              Deep dives led by practitioners.{" "}
              <span className="text-rose-400 font-semibold">Seats are limited.</span>
            </p>
          </div>
          <Button asChild variant="glass" className="shrink-0 hidden sm:inline-flex">
            <Link href="/dashboard/masterclasses">View all →</Link>
          </Button>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0,1,2].map(i => <SkeletonCard key={i}/>)}
          </div>
        )}

        {!loading && classes.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
            {hasError ? "Unable to load masterclasses right now." : "No upcoming masterclasses yet — check back soon!"}
          </div>
        )}

        {!loading && classes.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {classes.map((c, i) => {
              const ac = ACCENTS[i % ACCENTS.length];
              const name = c.instructor?.name || c.instructorName || "Instructor";
              const initials = name.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2);
              const levelKey = (c.level || "").toUpperCase();

              return (
                <div key={c.id}
                  className="animate-fade-in-up opacity-0 flex"
                  style={{ animationDelay:`${i * 100}ms`, animationFillMode:"forwards" }}>
                  <div className={cn(
                    "group relative rounded-2xl overflow-hidden flex flex-col w-full card-inner-glow",
                    "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
                    "hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25 transition-all duration-300",
                    ac.border,
                  )}>

                    <div className="relative h-40 overflow-hidden shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#080612]"/>
                      <div className={cn("absolute inset-0 bg-gradient-to-b", ac.topGrad, "to-transparent")}/>
                      <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none"/>

                      <div className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                        {c.avatar ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/[0.14] shadow-lg">
                            <img src={c.avatar} alt={name} className="w-full h-full object-cover"/>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.07] ring-2 ring-white/[0.1] shadow-lg text-xl font-black text-foreground/50">
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="absolute top-3 left-3 z-10">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm", ac.badge)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", ac.dot)}/>
                          {c.category || "Masterclass"}
                        </span>
                      </div>

                      {c.level && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black backdrop-blur-sm", LEVEL_BADGE[levelKey] || "bg-white/5 text-foreground/40")}>
                            {c.level}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#080612]/70 to-transparent"/>
                    </div>

                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                      <h3 className="text-base font-bold leading-snug group-hover:text-violet-300 transition-colors">
                        {c.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-foreground/40">
                        <div className="w-5 h-5 rounded-full bg-white/[0.07] flex items-center justify-center text-[8px] font-bold shrink-0 text-foreground/50">
                          {initials.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground/55 truncate">{name}</span>
                        <span className="text-foreground/20">·</span>
                        <span className={cn("flex items-center gap-1 font-bold shrink-0", ac.dateCls)}>
                          <Calendar size={10}/>
                          {formatDate(c.date)}
                        </span>
                      </div>

                      <div className="mt-auto pt-3">
                        <Button asChild className="w-full h-10 rounded-xl gap-2 text-sm">
                          <Link href="/dashboard/masterclasses">
                            Register now <ArrowRight size={13}/>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-7 text-center sm:hidden">
          <Button asChild variant="glass">
            <Link href="/dashboard/masterclasses">View all masterclasses →</Link>
          </Button>
        </div>
      </div>
      <div className="section-divider"/>
    </section>
  );
}