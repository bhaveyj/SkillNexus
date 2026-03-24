"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const TAGS = [
  { label: "AI",               cls: "badge-violet" },
  { label: "Machine Learning", cls: "badge-rose" },
  { label: "Data Engineering", cls: "badge-cyan" },
  { label: "Web3",             cls: "badge-amber" },
  { label: "MLOps",            cls: "badge-violet" },
  { label: "LLMs",             cls: "badge-rose" },
  { label: "DevOps",           cls: "badge-cyan" },
  { label: "Cloud",            cls: "badge-amber" },
  { label: "Rust",             cls: "badge-violet" },
  { label: "TypeScript",       cls: "badge-rose" },
  { label: "Kubernetes",       cls: "badge-cyan" },
  { label: "Blockchain",       cls: "badge-amber" },
];

function TagMarquee() {
  return (
    <div className="relative w-full overflow-hidden mt-8">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#080612] to-transparent pointer-events-none"/>
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#080612] to-transparent pointer-events-none"/>
      <div className="flex gap-3 w-max" style={{ animation: "marquee 30s linear infinite" }}>
        {[...TAGS, ...TAGS].map((t, i) => (
          <span key={i} className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap select-none",
            t.cls,
          )}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const NODES = [
  { x:50, y:50, label:"Python",     color:"#8b5cf6", size:44, delay:0 },
  { x:82, y:22, label:"AWS",        color:"#f43f5e", size:38, delay:0.4 },
  { x:20, y:28, label:"React",      color:"#22d3ee", size:36, delay:0.8 },
  { x:78, y:74, label:"MLOps",      color:"#a78bfa", size:40, delay:0.3 },
  { x:18, y:72, label:"Docker",     color:"#fb7185", size:34, delay:0.6 },
  { x:52, y:88, label:"LLMs",       color:"#34d399", size:32, delay:1.0 },
  { x:88, y:48, label:"TypeScript", color:"#60a5fa", size:30, delay:0.5 },
  { x:10, y:50, label:"Rust",       color:"#fbbf24", size:28, delay:0.9 },
];

const CONNECTIONS = [[0,1],[0,2],[0,3],[0,4],[1,6],[2,4],[3,5],[3,6],[4,7],[5,6],[1,3],[2,7]];

function NodeGraph() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % CONNECTIONS.length), 900);
    return () => clearInterval(t);
  }, []);
  const [a, b] = CONNECTIONS[active];
  const na = NODES[a], nb = NODES[b];

  return (
    <div className="w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow:"visible" }}>
        <defs>
          <radialGradient id="heroBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="46" ry="42" fill="url(#heroBg)"/>
        {CONNECTIONS.map(([ai,bi],i) => {
          const isActive = active === i;
          return (
            <line key={i} x1={NODES[ai].x} y1={NODES[ai].y} x2={NODES[bi].x} y2={NODES[bi].y}
              stroke={isActive ? "rgba(139,92,246,0.65)" : "rgba(139,92,246,0.09)"}
              strokeWidth={isActive ? "0.55" : "0.2"}
              style={{ transition:"stroke 0.35s, stroke-width 0.35s" }}/>
          );
        })}
        {NODES.map((node,i) => {
          const r = node.size / 10;
          return (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r={r+2} fill="none" stroke={node.color}
                strokeWidth="0.3" opacity="0.16"
                style={{ animation:`pulseRing 2.5s ease-in-out infinite`, animationDelay:`${node.delay}s` }}/>
              <circle cx={node.x} cy={node.y} r={r} fill="rgba(8,6,18,0.88)" stroke={node.color} strokeWidth="0.6"/>
              <circle cx={node.x} cy={node.y} r={r*0.42} fill={node.color} opacity="0.15"/>
              <text x={node.x} y={node.y+0.5} textAnchor="middle" dominantBaseline="middle"
                fontSize="2.05" fontWeight="700" fill={node.color}>{node.label}</text>
            </g>
          );
        })}
        <circle r="1.1" fill="#8b5cf6" opacity="0.9">
          <animateMotion dur="0.9s" repeatCount="indefinite" path={`M ${na.x} ${na.y} L ${nb.x} ${nb.y}`}/>
        </circle>
      </svg>
      <style>{`@keyframes pulseRing{0%,100%{transform:scale(1);opacity:.16}50%{transform:scale(1.2);opacity:.04}}`}</style>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-50"/>
      <div className="absolute top-1/3 left-1/5 w-[550px] h-[550px] rounded-full bg-violet-700/9 blur-[140px] pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-rose-600/6 blur-[110px] pointer-events-none"/>

      <div className="relative z-10 mx-auto max-w-6xl px-5 w-full pt-24 pb-8">

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          <div className="flex flex-col gap-5 pt-2">
            <h1 className="animate-fade-in-up text-[52px] md:text-[62px] lg:text-[68px] font-extrabold leading-[1.04] tracking-tight">
              Exchange niche{" "}
              <span className="gradient-text-hero">tech skills</span>
              <br />one-on-one.
            </h1>

            <p className="animate-fade-in-up delay-100 text-base md:text-lg text-muted-foreground leading-relaxed max-w-[440px]">
              Match with peers for focused 1:1 skill exchanges, or join live masterclasses curated from industry experts — all in one place, open to everyone.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-200">
              <Button size="lg" className="shadow-xl shadow-violet-600/30" asChild>
                <Link href="/auth/signup">
                  Get started free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="text-foreground/60 hover:text-foreground gap-1.5 px-2">
                <Link href="/dashboard/masterclasses">
                  Explore masterclasses
                  <svg className="w-4 h-4 opacity-55" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-in-up delay-150 hidden lg:block">
            <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-violet-600/10 to-rose-600/5 blur-2xl pointer-events-none"/>

            <div className="relative rounded-3xl border border-white/[0.08] overflow-hidden" style={{isolation:"isolate"}}>
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/55 to-transparent z-10 pointer-events-none"/>
              <div className="absolute inset-0 bg-[#0d0a1e]/70 backdrop-blur-xl pointer-events-none"/>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/7 to-rose-600/3 pointer-events-none"/>
              <div className="absolute inset-0 dot-grid opacity-18 pointer-events-none"/>

              <div className="relative" style={{paddingBottom:"100%"}}>
                <div className="absolute inset-4">
                  <NodeGraph/>
                </div>
              </div>

              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#080612]/90 border border-violet-500/22 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"/>
                <span className="text-[10px] font-bold text-violet-300">Live matching</span>
              </div>
            </div>
          </div>
        </div>

        <TagMarquee/>
      </div>
    </section>
  );
}