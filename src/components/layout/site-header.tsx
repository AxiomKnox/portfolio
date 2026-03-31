import { Link, NavLink } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
    isActive
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )

export function SiteHeader() {
  const { person, meta } = site

  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="group flex flex-col gap-0.5 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span className="font-display text-lg leading-none tracking-tight text-foreground">
            {person.displayName}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {person.tagline}
          </span>
        </Link>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-6">
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-8"
          >
            <NavLink className={navLinkClass} end to="/">
              Home
            </NavLink>
            <NavLink className={navLinkClass} to="/projects">
              All projects
            </NavLink>
            <NavLink className={navLinkClass} to="/about">
              About
            </NavLink>
          </nav>
          <Badge
            className="inline-flex max-w-[9rem] shrink-0 border-dashed font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground"
            title="This site was built with AI assistance"
            variant="outline"
          >
            {meta.aiAssistedLabel}
          </Badge>
        </div>
      </div>
    </header>
  )
}
