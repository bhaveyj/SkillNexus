"use client"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="SkillNexus" className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} SkillNexus</span>
        </div>
        <nav className="text-sm flex items-center gap-4 text-muted-foreground">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
