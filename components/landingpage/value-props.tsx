"use client";

import { cn } from "@/lib/utils";

function ExchangeIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="28" cy="28" r="26" fill={color} fillOpacity="0.08" />
      <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="1" strokeOpacity="0.15" />
      <path d="M18 23h20M18 23l4-4M18 23l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 33H18M38 33l-4-4M38 33l-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MasterclassIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="28" cy="28" r="26" fill={color} fillOpacity="0.08" />
      <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="1" strokeOpacity="0.15" />
      <rect x="16" y="18" width="24" height="15" rx="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M25 22l7 3.5-7 3.5V22z" fill={color} fillOpacity="0.7" />
      <path d="M24 33v4M32 33v4M22 37h12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="37" cy="19" r="3.5" fill={color} fillOpacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function OutcomesIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14">
      <circle cx="28" cy="28" r="26" fill={color} fillOpacity="0.08" />
      <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="1" strokeOpacity="0.15" />
      <path d="M17 36l5-6 5 3 6-8 5 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="30" r="2" fill={color} fillOpacity="0.8" />
      <circle cx="27" cy="33" r="2" fill={color} fillOpacity="0.8" />
      <circle cx="33" cy="25" r="2" fill={color} fillOpacity="0.8" />
      <circle cx="38" cy="29" r="2" fill={color} fillOpacity="0.8" />
      <circle cx="37" cy="19" r="5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
      <path d="M34.5 19l2 2 3.5-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ITEMS = [
  {
    title: "1:1 Skill Exchange",
    desc: "Swap expertise with verified peers for focused, hands-on learning sessions. You teach what you know, learn what you need — powered by credits.",
    badge: "Peer-to-peer",
    badgeCls: "badge-violet",
    color: "#8b5cf6",
    cardBorder: "hover:border-violet-500/25",
    cardShadow: "hover:shadow-violet-500/8",
    accentBg: "from-violet-600/12 to-purple-900/8",
    accentLine: "via-violet-500/50",
    highlights: ["Earn credits", "No middleman", "1:1 focused"],
    Icon: ExchangeIcon,
  },
  {
    title: "Industry Masterclasses",
    desc: "Live sessions led by practitioners from top tech teams. Deep dive into AI, ML, LLMs, and emerging technologies with people building them.",
    badge: "Expert-led",
    badgeCls: "badge-rose",
    color: "#f43f5e",
    cardBorder: "hover:border-rose-500/25",
    cardShadow: "hover:shadow-rose-500/8",
    accentBg: "from-rose-600/12 to-pink-900/8",
    accentLine: "via-rose-500/50",
    highlights: ["Live sessions", "Q&A included", "Limited seats"],
    Icon: MasterclassIcon,
  },
  {
    title: "Structured Outcomes",
    desc: "Every session delivers measurable, actionable value. Templates, goal frameworks, and progress tracking ensure you walk away with real skills.",
    badge: "Goal-driven",
    badgeCls: "badge-cyan",
    color: "#22d3ee",
    cardBorder: "hover:border-cyan-500/25",
    cardShadow: "hover:shadow-cyan-500/8",
    accentBg: "from-cyan-600/10 to-sky-900/6",
    accentLine: "via-cyan-500/50",
    highlights: ["Templates", "Progress tracking", "Ratings"], 
    Icon: OutcomesIcon,
  },
];

export function ValueProps() {
  return (
    <section className="relative">
      <div className="section-divider" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-24 md:pt-24 md:pb-32">

        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-violet-500/60" />
            <span className="text-sm font-semibold text-violet-400 tracking-wide">Why SkillNexus</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/60" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text-violet">level up fast</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            From peer exchanges to expert masterclasses — a complete ecosystem for skill development.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="animate-fade-in-up opacity-0 flex"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
            >
              <div className={cn(
                "group relative rounded-2xl overflow-hidden flex flex-col w-full card-inner-glow",
                "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
                "hover:-translate-y-1 hover:shadow-2xl transition-all duration-300",
                item.cardBorder, item.cardShadow,
              )}>

                <div className={cn("relative w-full h-52 overflow-hidden flex-shrink-0 flex items-center justify-center",)}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br", item.accentBg)} />
                  <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

                  {[60, 90, 120].map((size, ri) => (
                    <div key={ri}
                      className="absolute rounded-full border"
                      style={{
                        width: size, height: size,
                        borderColor: item.color,
                        borderWidth: 1,
                        opacity: 0.08 - ri * 0.02,
                      }}
                    />
                  ))}

                  <div className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                    style={{ filter: `drop-shadow(0 0 20px ${item.color}60)` }}>
                    <item.Icon color={item.color} />
                  </div>

                  <div className="absolute top-3 left-3 z-10">
                    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-sm", item.badgeCls)}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080612]/40 to-transparent" />
                </div>

                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                    {item.highlights.map(h => (
                      <span key={h} className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-white/[0.04] border-white/[0.08]"
                        style={{ color: item.color }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent",
                  item.accentLine, "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider" />
    </section>
  );
}