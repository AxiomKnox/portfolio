import { ArrowRight, Cpu, TreeStructure } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { ProjectCard } from "@/components/project/project-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getFeaturedByCategory } from "@/data/projects"
import { cn } from "@/lib/utils"

export function HomePage() {
  const backendFeatured = getFeaturedByCategory("backend", 3)
  const devopsFeatured = getFeaturedByCategory("devops", 3)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <section className="relative overflow-hidden border border-border/70 bg-card/30 p-8 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rotate-12 border-2 border-accent/30 sm:-right-8 sm:top-12"
        />
        <div className="relative max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
            Portfolio · Static · GitHub Pages
          </p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Systems that survive traffic, audits, and 3am pages.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            I design and ship backend platforms and DevOps foundations: APIs you
            can reason about, pipelines you can trust, and observability that
            answers questions before Slack does.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link to="/projects" />} size="lg">
              Browse projects
              <ArrowRight aria-hidden className="size-4" weight="bold" />
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
              Two lanes of work I ship most often—platform APIs and automation
              that keeps them honest.
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
            <ArrowRight aria-hidden className="size-3.5" weight="bold" />
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu aria-hidden className="size-5 text-accent" weight="duotone" />
              <h3 className="font-display text-lg tracking-tight">
                Backend projects
              </h3>
            </div>
            <Separator className="bg-border/80" />
            <div className="grid gap-6 stagger-cards">
              {backendFeatured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TreeStructure
                aria-hidden
                className="size-5 text-accent"
                weight="duotone"
              />
              <h3 className="font-display text-lg tracking-tight">
                DevOps projects
              </h3>
            </div>
            <Separator className="bg-border/80" />
            <div className="grid gap-6 stagger-cards">
              {devopsFeatured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
