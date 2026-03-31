import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { AppIcon } from "@/components/ui/app-icon"
import { ProjectCard } from "@/components/project/project-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getFeaturedByCategory } from "@/data/projects"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

function HorizontalProjectRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 pt-1 [scrollbar-width:thin] sm:mx-0 sm:px-0"
      role="list"
    >
      {children}
    </div>
  )
}

export function HomePage() {
  const backendFeatured = getFeaturedByCategory("backend", 3)
  const devopsFeatured = getFeaturedByCategory("devops", 3)
  const { highlights } = site

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <section className="relative overflow-hidden border border-border/70 bg-card/30 p-8 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rotate-12 border-2 border-accent/30 sm:-right-8 sm:top-12"
        />
        <div className="relative max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
            {highlights.heroKicker}
          </p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {highlights.heroTitle}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {highlights.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link to="/projects" />} size="lg">
              Browse projects
              <AppIcon aria-hidden className="size-4" icon="mdi:arrow-right" />
            </Button>
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-dashed"
              )}
              to="/about"
            >
              About me
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Projects
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {highlights.projectsSectionIntro}
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-mono text-[11px] uppercase tracking-[0.18em]"
            )}
            to="/projects"
          >
            View all
            <AppIcon aria-hidden className="size-3.5" icon="mdi:arrow-right" />
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AppIcon
                aria-hidden
                className="size-5 text-accent"
                icon="mdi:cpu-64-bit"
              />
              <h3 className="font-display text-lg tracking-tight">
                Backend projects
              </h3>
            </div>
            <Separator className="bg-border/80" />
            <HorizontalProjectRow>
              {backendFeatured.map((project) => (
                <div
                  key={project.slug}
                  className="min-w-[min(100%,260px)] max-w-[300px] shrink-0 snap-start"
                  role="listitem"
                >
                  <ProjectCard project={project} variant="strip" />
                </div>
              ))}
            </HorizontalProjectRow>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AppIcon
                aria-hidden
                className="size-5 text-accent"
                icon="mdi:file-tree"
              />
              <h3 className="font-display text-lg tracking-tight">
                DevOps projects
              </h3>
            </div>
            <Separator className="bg-border/80" />
            <HorizontalProjectRow>
              {devopsFeatured.map((project) => (
                <div
                  key={project.slug}
                  className="min-w-[min(100%,260px)] max-w-[300px] shrink-0 snap-start"
                  role="listitem"
                >
                  <ProjectCard project={project} variant="strip" />
                </div>
              ))}
            </HorizontalProjectRow>
          </div>
        </div>
      </section>
    </div>
  )
}
