"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does skill exchange work?",
    a: "SkillNexus connects you with others who want to learn what you know and can teach what you want to learn. List your skills, browse the marketplace, send exchange requests, then schedule 1:1 sessions and learn from each other.",
    icon: "⇄", iconBg: "bg-violet-500/12", iconColor: "text-violet-400",
    hoverBorder: "hover:border-violet-500/25", openBorder: "border-violet-500/30",
  },
  {
    q: "Is SkillNexus free to use?",
    a: "Sign-up is free. You earn credits by teaching and spend them to learn through exchanges or masterclasses. This keeps the platform fair while rewarding educators.",
    icon: "✦", iconBg: "bg-rose-500/12", iconColor: "text-rose-400",
    hoverBorder: "hover:border-rose-500/25", openBorder: "border-rose-500/30",
  },
  {
    q: "What skills can I exchange?",
    a: "Any tech skill — Python, JavaScript, Rust, machine learning, DevOps, cloud architecture, UI/UX design, and much more. If it's a technical skill, you can exchange it on SkillNexus.",
    icon: "◈", iconBg: "bg-cyan-500/12", iconColor: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500/25", openBorder: "border-cyan-500/30",
  },
  {
    q: "How are sessions conducted?",
    a: "Sessions are conducted via video calls. Once matched, you'll receive a Google Meet link. Sessions are typically 30–60 minutes and scheduled at times that work for both parties.",
    icon: "◉", iconBg: "bg-violet-500/12", iconColor: "text-violet-400",
    hoverBorder: "hover:border-violet-500/25", openBorder: "border-violet-500/30",
  },
  {
    q: "What are Masterclasses?",
    a: "Masterclasses are in-depth sessions led by industry practitioners. Unlike peer exchanges, these are one-to-many sessions where experts share specialized knowledge with a group — perfect for cutting-edge topics.",
    icon: "◆", iconBg: "bg-rose-500/12", iconColor: "text-rose-400",
    hoverBorder: "hover:border-rose-500/25", openBorder: "border-rose-500/30",
  },
  {
    q: "How do I ensure quality exchanges?",
    a: "We have a rating and review system after each session. Users build reputation over time, you can see ratings before accepting requests, and professional profiles are verified through LinkedIn integration.",
    icon: "★", iconBg: "bg-amber-500/10", iconColor: "text-amber-400",
    hoverBorder: "hover:border-amber-500/25", openBorder: "border-amber-500/30",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="relative">
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[110px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 md:py-32">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/60" />
            <span className="text-sm font-semibold text-cyan-400 tracking-wide">FAQ</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/60" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Frequently asked{" "}
            <span className="gradient-text-violet">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about SkillNexus
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "group rounded-2xl overflow-hidden transition-all duration-300",
                  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
                  faq.hoverBorder,
                  isOpen && [faq.openBorder, "shadow-lg shadow-black/30"],
                  "animate-fade-in-up opacity-0",
                )}
                style={{ animationDelay: `${idx * 55}ms`, animationFillMode: "forwards" }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer"
                >
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shrink-0 transition-all duration-300",
                    faq.iconBg, faq.iconColor, isOpen && "scale-110",
                  )}>
                    {faq.icon}
                  </span>
                  <span className={cn(
                    "flex-1 font-semibold text-base transition-colors duration-200",
                    isOpen ? "text-foreground" : "text-foreground/75 group-hover:text-foreground",
                  )}>
                    {faq.q}
                  </span>
                  <span className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-lg shrink-0 transition-all duration-300",
                    faq.iconBg, isOpen ? [faq.iconColor, "rotate-180"] : "text-muted-foreground",
                  )}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pl-[4.25rem]">
                      <div className="h-px mb-4 bg-white/[0.05]" />
                      <p className="text-sm text-foreground/60 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            Still have questions?{" "}
            <a href="mailto:support@skillnexus.com" className="text-violet-400 font-semibold hover:text-violet-300 hover:underline underline-offset-4 transition-colors">
              Contact our team →
            </a>
          </p>
        </div>
      </div>
      <div className="section-divider" />
    </section>
  );
}