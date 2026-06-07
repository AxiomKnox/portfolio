import { useMemo, useState } from "react"

import { ProjectCard } from "@/components/project/project-card"
import { Button } from "@/components/ui/button"
import { projects } from "@/data/projects"
import { cn } from "@/lib/utils"
import type { ProjectCategory } from "@/types/project"

type FilterValue = "all" | ProjectCategory

export function AllProjectsPage() {
  const [filter, setFilter] = useState<FilterValue>("all")

  const filtered = useMemo(() => {
    if (filter === "all") {
      return projects
    }

    return projects.filter((project) => project.category === filter)
  }, [filter])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
      <header className="max-w-2xl space-y-3 animate-in fade-in duration-500">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
          Catalog
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          All projects
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Filter by lane, open a card, and dive into architecture, stack, and
          links. Everything here ships as static data—swap copy in{" "}
          <code className="rounded-none bg-muted px-1 py-0.5 font-mono text-[11px]">
            src/data/projects.ts
          </code>
          .
        </p>
      </header>

      <div
        className="mt-8 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
        role="group"
        aria-label="Filter by category"
      >
        {(
          [
            ["all", "All"],
            ["backend", "Backend"],
            ["devops", "DevOps"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            onClick={() => setFilter(value)}
            size="sm"
            variant={filter === value ? "default" : "outline"}
          >
            {label}
          </Button>
        ))}
      </div>

      <ul className="mt-10 grid list-none gap-6 md:grid-cols-2">
        {filtered.map((project, index) => (
          <li
            key={project.slug}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 duration-500",
              index % 2 === 1 && "md:pt-6"
            )}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            <ProjectCard project={project} imagePriority />
          </li>
        ))}
      </ul>
    </div>
  )
}
