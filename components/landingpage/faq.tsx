"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How does skill exchange work?",
    answer:
      "SkillNexus connects you with others who want to learn what you know and can teach what you want to learn. Simply list your skills, browse the marketplace, and send exchange requests. Once matched, you can schedule one-on-one sessions and learn from each other.",
    icon: "🔄",
  },
  {
    question: "Is SkillNexus free to use?",
    answer:
      "Yes! SkillNexus is completely free for skill exchanges. We believe in democratizing learning by removing financial barriers. Masterclasses may have optional fees set by instructors, but peer-to-peer skill swapping is always free.",
    icon: "💸",
  },
  {
    question: "What skills can I exchange?",
    answer:
      "Any tech skill! From programming languages like Python, JavaScript, and Rust to specialized areas like machine learning, DevOps, cloud architecture, UI/UX design, and more. If it's a technical skill, you can exchange it on SkillNexus.",
    icon: "💡",
  },
  {
    question: "How are sessions conducted?",
    answer:
      "Sessions are conducted via video calls. Once you match with someone, you'll receive a Google Meet link to connect. Sessions are typically 30-60 minutes, and you can schedule them at times that work for both parties.",
    icon: "📹",
  },
  {
    question: "What are Masterclasses?",
    answer:
      "Masterclasses are in-depth learning sessions led by industry practitioners. Unlike peer exchanges, these are one-to-many sessions where experts share specialized knowledge with a group. They're perfect for learning cutting-edge topics from experienced professionals.",
    icon: "🎓",
  },
  {
    question: "How do I ensure quality exchanges?",
    answer:
      "We have a rating and review system after each session. Users build reputation over time, and you can see ratings before accepting exchange requests. We also verify professional profiles through LinkedIn integration.",
    icon: "⭐",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="border-t border-border/60 relative overflow-hidden">
      {/* Background gradient decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Everything you need to know about SkillNexus
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "group rounded-2xl overflow-hidden transition-all duration-300",
                "bg-gradient-to-r from-card to-card/80",
                "border border-border/40 hover:border-primary/30",
                "hover:shadow-lg hover:shadow-primary/5",
                openIndex === index && "border-primary/40 shadow-lg shadow-primary/10"
              )}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center gap-4 text-left transition-colors cursor-pointer"
              >
                <span className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl text-lg transition-all duration-300",
                  "bg-muted/50 group-hover:bg-primary/10",
                  openIndex === index && "bg-primary/10 scale-110"
                )}>
                  {faq.icon}
                </span>
                <span className="flex-1 font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  "bg-muted/50 group-hover:bg-primary/10",
                  openIndex === index && "bg-primary/20 rotate-180"
                )}>
                  <svg
                    className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 pl-20">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="mailto:support@skillnexus.com" className="text-primary hover:underline font-medium">
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
