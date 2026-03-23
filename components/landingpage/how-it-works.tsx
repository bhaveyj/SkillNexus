"use client";

import { cn } from "@/lib/utils";

function GoalsIllustration() {
  return (
    <svg viewBox="0 0 260 148" fill="none" className="w-full h-full">
      <rect x="30" y="15" width="200" height="118" rx="12"
        fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.18)" strokeWidth="1"/>
      <circle cx="72" cy="52" r="18" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.35)" strokeWidth="1.2"/>
      <circle cx="72" cy="47" r="7" fill="rgba(139,92,246,0.5)"/>
      <path d="M56 69c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="rgba(139,92,246,0.2)"/>
      <rect x="102" y="40" width="106" height="9" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(139,92,246,0.18)" strokeWidth="0.5"/>
      <rect x="106" y="43" width="48" height="3.5" rx="1.5" fill="rgba(196,181,253,0.5)"/>
      <rect x="102" y="56" width="38" height="11" rx="4" fill="rgba(139,92,246,0.18)" stroke="rgba(139,92,246,0.28)" strokeWidth="0.5"/>
      <text x="121" y="63.5" textAnchor="middle" fontSize="4.8" fill="#c4b5fd" fontWeight="600">Python</text>
      <rect x="145" y="56" width="28" height="11" rx="4" fill="rgba(244,63,94,0.14)" stroke="rgba(244,63,94,0.22)" strokeWidth="0.5"/>
      <text x="159" y="63.5" textAnchor="middle" fontSize="4.8" fill="#fda4af" fontWeight="600">AWS</text>
      <rect x="178" y="56" width="26" height="11" rx="4" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5"/>
      <text x="191" y="63.5" textAnchor="middle" fontSize="4.8" fill="#67e8f9" fontWeight="600">Rust</text>
      <rect x="50" y="85" width="160" height="7" rx="2" fill="rgba(255,255,255,0.04)"/>
      <rect x="50" y="85" width="104" height="7" rx="2" fill="rgba(139,92,246,0.38)"/>
      <text x="50" y="102" fontSize="4.8" fill="rgba(196,181,253,0.55)" fontWeight="600">Learning goal · 65% matched</text>
      <circle cx="224" cy="38" r="9.5" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.38)" strokeWidth="1"/>
      <path d="M219.5 38l2.5 2.5 6-6" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MatchingIllustration() {
  return (
    <svg viewBox="0 0 260 148" fill="none" className="w-full h-full">
      <circle cx="58" cy="74" r="22" fill="rgba(244,63,94,0.1)" stroke="rgba(244,63,94,0.28)" strokeWidth="1.2"/>
      <circle cx="58" cy="68" r="9" fill="rgba(244,63,94,0.4)"/>
      <path d="M42 90c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="rgba(244,63,94,0.18)"/>
      <text x="58" y="108" textAnchor="middle" fontSize="5.5" fill="#fda4af" fontWeight="700">You</text>
      <circle cx="202" cy="74" r="22" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.28)" strokeWidth="1.2"/>
      <circle cx="202" cy="68" r="9" fill="rgba(139,92,246,0.4)"/>
      <path d="M186 90c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="rgba(139,92,246,0.18)"/>
      <text x="202" y="108" textAnchor="middle" fontSize="5.5" fill="#c4b5fd" fontWeight="700">Match</text>
      <line x1="83" y1="74" x2="177" y2="74" stroke="rgba(139,92,246,0.2)" strokeWidth="1.2" strokeDasharray="4 3"/>
      <circle cx="130" cy="74" r="3.5" fill="#8b5cf6" opacity="0.9">
        <animateMotion dur="1.4s" repeatCount="indefinite" path="M -47 0 L 47 0"/>
      </circle>
      <rect x="108" y="61" width="44" height="19" rx="5.5" fill="rgba(13,10,30,0.92)" stroke="rgba(139,92,246,0.32)" strokeWidth="1"/>
      <circle cx="120" cy="70.5" r="3" fill="rgba(52,211,153,0.85)"/>
      <text x="136" y="73.5" textAnchor="middle" fontSize="5" fill="#a7f3d0" fontWeight="700">Matched!</text>
      <rect x="22" y="34" width="46" height="11" rx="3.5" fill="rgba(244,63,94,0.12)" stroke="rgba(244,63,94,0.22)" strokeWidth="0.5"/>
      <text x="45" y="41.5" textAnchor="middle" fontSize="4.5" fill="#fda4af" fontWeight="600">Teaches React</text>
      <rect x="192" y="34" width="46" height="11" rx="3.5" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.22)" strokeWidth="0.5"/>
      <text x="215" y="41.5" textAnchor="middle" fontSize="4.5" fill="#c4b5fd" fontWeight="600">Teaches MLOps</text>
      {([[100,26,"#22d3ee"],[168,24,"#f43f5e"],[76,128,"#8b5cf6"],[184,126,"#34d399"]] as [number,number,string][]).map(([x,y,c],i) => (
        <circle key={i} cx={x} cy={y} r="5.5" fill={c} fillOpacity="0.14" stroke={c} strokeWidth="0.5" strokeOpacity="0.35"/>
      ))}
    </svg>
  );
}

function LearnIllustration() {
  const skills = [
    {label:"Python", pct:85, color:"#8b5cf6"},
    {label:"MLOps",  pct:60, color:"#f43f5e"},
    {label:"Docker", pct:72, color:"#22d3ee"},
  ];
  return (
    <svg viewBox="0 0 260 148" fill="none" className="w-full h-full">
      <rect x="30" y="14" width="200" height="120" rx="12"
        fill="rgba(255,255,255,0.03)" stroke="rgba(34,211,238,0.14)" strokeWidth="1"/>
      <text x="52" y="36" fontSize="7.5" fill="rgba(240,235,255,0.7)" fontWeight="700">Your Progress</text>
      <circle cx="208" cy="30" r="11" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.32)" strokeWidth="1"/>
      <text x="208" y="34" textAnchor="middle" fontSize="8" fill="#34d399" fontWeight="800">↑</text>
      {skills.map((s, i) => {
        const y = 50 + i * 26;
        return (
          <g key={s.label}>
            <text x="52" y={y + 4} fontSize="5" fill="rgba(240,235,255,0.5)" fontWeight="600">{s.label}</text>
            <rect x="52" y={y + 8} width="138" height="6" rx="3" fill="rgba(255,255,255,0.05)"/>
            <rect x="52" y={y + 8} width={138 * s.pct / 100} height="6" rx="3" fill={s.color} fillOpacity="0.65"/>
            <text x="198" y={y + 14} textAnchor="end" fontSize="5" fill={s.color} fontWeight="700">{s.pct}%</text>
          </g>
        );
      })}
      {[
        {x:52, label:"8 sessions ✓", c:"rgba(139,92,246"},
        {x:110, label:"4.9 ★ rating", c:"rgba(52,211,153"},
        {x:168, label:"12h learned", c:"rgba(251,191,36"},
      ].map(({x, label, c}) => (
        <g key={label}>
          <rect x={x} y="120" width="52" height="12" rx="4"
            fill={`${c},0.1)`} stroke={`${c},0.2)`} strokeWidth="0.5"/>
          <text x={x + 26} y="128" textAnchor="middle" fontSize="4.2" fill={`${c},0.8)`} fontWeight="600">{label}</text>
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  {
    num:"01", title:"Tell us your goals",
    desc:"Share what you want to learn or teach. Set your skill level and availability. Onboarding takes under 2 minutes.",
    numCls:"text-violet-400", numBg:"bg-violet-500/10 border-violet-500/20",
    border:"hover:border-violet-500/28", shadow:"hover:shadow-violet-500/8",
    bg:"from-violet-600/10 to-purple-900/6", Illustration:GoalsIllustration,
  },
  {
    num:"02", title:"Get matched or book",
    desc:"Our algorithm pairs you with the ideal peer, or browse and pick a masterclass that fits your learning path perfectly.",
    numCls:"text-rose-400", numBg:"bg-rose-500/10 border-rose-500/20",
    border:"hover:border-rose-500/28", shadow:"hover:shadow-rose-500/8",
    bg:"from-rose-600/10 to-pink-900/6", Illustration:MatchingIllustration,
  },
  {
    num:"03", title:"Learn. Apply. Repeat.",
    desc:"Actionable 1:1 sessions with structured takeaways. Track progress, build reputation, and keep levelling up.",
    numCls:"text-cyan-400", numBg:"bg-cyan-500/10 border-cyan-500/20",
    border:"hover:border-cyan-500/28", shadow:"hover:shadow-cyan-500/8",
    bg:"from-cyan-600/8 to-sky-900/5", Illustration:LearnIllustration,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative">
      <div className="section-divider"/>
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-24 md:pt-24 md:pb-32">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-rose-500/60"/>
            <span className="text-sm font-semibold text-rose-400 tracking-wide">How it works</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-rose-500/60"/>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Three steps to{" "}
            <span className="gradient-text-rose">accelerate growth</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            From onboarding to your first skill exchange in under 10 minutes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 items-stretch">
          {STEPS.map((step, i) => (
            <div key={step.num}
              className="animate-fade-in-up opacity-0 flex"
              style={{ animationDelay: `${i * 110 + 80}ms`, animationFillMode: "forwards" }}>
              <div className={cn(
                "group relative rounded-2xl overflow-hidden flex flex-col w-full card-inner-glow",
                "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/25 transition-all duration-300",
                step.border, step.shadow,
              )}>
                <div className="relative w-full h-52 overflow-hidden shrink-0 flex items-center justify-center">
                  <div className={cn("absolute inset-0 bg-gradient-to-br", step.bg)}/>
                  <div className="absolute inset-0 dot-grid opacity-12 pointer-events-none"/>
                  {/* SVG — padded, no dark oval, fills cleanly */}
                  <div className="absolute inset-4 flex items-center justify-center">
                    <step.Illustration/>
                  </div>
                  <div className={cn("absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center glass border", step.numBg)}>
                    <span className={cn("text-xs font-black", step.numCls)}>{step.num}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080612]/30 to-transparent pointer-events-none"/>
                </div>

                <div className="p-6 flex flex-col gap-2 flex-1">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider"/>
    </section>
  );
}