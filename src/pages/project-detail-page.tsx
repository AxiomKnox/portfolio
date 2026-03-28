import {
  ArrowLeft,
  ArrowSquareOut,
  GithubLogo,
} from "@phosphor-icons/react"
import { Link, Navigate, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getProjectBySlug } from "@/data/projects"
import { cn } from "@/lib/utils"

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = getProjectBySlug(slug)

  if (!project) {
    return <Navigate replace to="/projects" />
  }

  const categoryLabel =
    project.category === "backend" ? "Backend" : "DevOps"

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-8 -ml-2 gap-1 font-mono text-[11px] uppercase tracking-[0.16em]"
        )}
        to="/projects"
      >
        <ArrowLeft aria-hidden className="size-3.5" weight="bold" />
        All projects
      </Link>

      <header className="space-y-4 animate-in fade-in duration-500">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{categoryLabel}</Badge>
        </div>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {project.name}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.websiteUrl ? (
            <Button
              render={
                <a href={project.websiteUrl} rel="noreferrer" target="_blank" />
              }
              size="sm"
            >
              Live site
              <ArrowSquareOut aria-hidden className="size-3.5" weight="bold" />
            </Button>
          ) : null}
          <Button
            render={
              <a href={project.repositoryUrl} rel="noreferrer" target="_blank" />
            }
            size="sm"
            variant="outline"
          >
            Repository
            <GithubLogo aria-hidden className="size-3.5" weight="bold" />
          </Button>
        </div>
      </header>

      {project.previewImage ? (
        <figure className="mt-10 overflow-hidden border border-border/70 bg-muted animate-in fade-in duration-700">
          <img
            alt={`Preview for ${project.name}`}
            className="aspect-[16/9] w-full object-cover"
            decoding="async"
            loading="lazy"
            src={project.previewImage}
          />
          <figcaption className="sr-only">Project preview</figcaption>
        </figure>
      ) : null}

      <div className="mt-12 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-xl tracking-tight">Architecture</h2>
          <Separator />
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground marker:text-accent">
            {project.architecture.map((paragraph) => (
              <li key={paragraph}>{paragraph}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl tracking-tight">Details</h2>
          <Separator />
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {project.details.map((paragraph) => (
              <li key={paragraph} className="border-l-2 border-accent/50 pl-4">
                {paragraph}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl tracking-tight">
            Technologies
          </h2>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}
