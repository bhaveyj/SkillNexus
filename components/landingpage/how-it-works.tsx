"use client"

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Tell us your goals", d: "Share what you want to learn or teach in AI/ML and niche tech." },
    { n: "02", t: "Get matched or book", d: "We pair you with peers or you pick a masterclass that fits." },
    { n: "03", t: "Learn. Apply. Repeat.", d: "Actionable sessions with takeaways you can use immediately." },
  ]

  return (
    <section id="how" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card/40 p-6">
              <div className="text-primary font-mono text-sm">{s.n}</div>
              <h3 className="mt-2 text-lg font-medium">{s.t}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
