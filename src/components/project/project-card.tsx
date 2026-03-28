import { ArrowRight } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

export interface ProjectCardProps {
  project: Project
  imagePriority?: boolean
}

export function ProjectCard({ project, imagePriority }: ProjectCardProps) {
  const categoryLabel =
    project.category === "backend" ? "Backend" : "DevOps"

  return (
    <Card
      className={cn(
        "group/card-animate border-border/60 bg-card/60 shadow-none ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-accent/40",
        imagePriority && "overflow-hidden p-0"
      )}
    >
      {project.previewImage ? (
        <div
          className={cn(
            "relative aspect-[5/3] w-full overflow-hidden bg-muted",
            !imagePriority && "mx-4 mt-4 w-[calc(100%-2rem)]"
          )}
        >
          <img
            alt=""
            className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover/card-animate:opacity-100"
            decoding="async"
            loading="lazy"
            src={project.previewImage}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      ) : null}
      <div className={cn(imagePriority && "px-4 pt-4")}>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{categoryLabel}</Badge>
          </div>
          <CardTitle className="font-display text-base tracking-tight sm:text-lg">
            {project.name}
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {project.summary}
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent className={cn("flex flex-wrap gap-2", imagePriority && "px-4")}>
        {project.technologies.slice(0, 4).map((tech) => (
          <Badge key={tech} variant="secondary">
            {tech}
          </Badge>
        ))}
        {project.technologies.length > 4 ? (
          <Badge variant="ghost">+{project.technologies.length - 4}</Badge>
        ) : null}
      </CardContent>
      <CardFooter className={cn("justify-end gap-2", imagePriority && "px-4 pb-4")}>
        <Link
          className={cn(buttonVariants({ size: "sm" }), "gap-1")}
          to={`/projects/${project.slug}`}
        >
          View details
          <ArrowRight aria-hidden className="size-3.5" weight="bold" />
        </Link>
      </CardFooter>
    </Card>
  )
}
