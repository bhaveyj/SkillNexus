"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "About",          href: "#" },
  { label: "Contact",        href: "mailto:support@skillnexus.com" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use",   href: "#" },
];

const SOCIAL = [
  {
    label: "Twitter / X",
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "GitHub",
    d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative">
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/18 to-transparent"/>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-violet-600/20 blur group-hover:blur-md transition-all"/>
              <img src="/logo.svg" alt="SkillNexus" className="relative h-6 w-6"/>
            </div>
            <span className="font-bold text-[14px] gradient-text-violet">SkillNexus</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {FOOTER_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-xs text-foreground/35 hover:text-foreground/65 transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {SOCIAL.map(s => (
              <a key={s.label} href="#" aria-label={s.label}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/30 hover:text-violet-300 bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/22 transition-all duration-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.d}/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"/>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-foreground/20">
            © 2026 SkillNexus. All rights reserved.
          </span>
          <span className="text-[11px] text-foreground/20">
            Where skills meet opportunity ✦
          </span>
        </div>
      </div>
    </footer>
  );
}