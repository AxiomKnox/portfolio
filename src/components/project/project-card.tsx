import { Link } from "react-router-dom"

import { AppIcon } from "@/components/ui/app-icon"
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
  /** Horizontal home strips: compact cards with shorter copy. */
  variant?: "default" | "strip"
}

export function ProjectCard({
  project,
  imagePriority,
  variant = "default",
}: ProjectCardProps) {
  const categoryLabel =
    project.category === "backend" ? "Backend" : "DevOps"

  const isStrip = variant === "strip"

  const techPreview = isStrip
    ? project.technologies.slice(0, 3)
    : project.technologies.slice(0, 4)
  const techOverflow = isStrip
    ? project.technologies.length - 3
    : project.technologies.length - 4

  return (
    <Card
      className={cn(
        "group/card-animate border-border/60 bg-card/60 shadow-none ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-accent/40",
        imagePriority && "overflow-hidden p-0",
        isStrip && "h-full min-h-0"
      )}
    >
      {project.previewImage ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            isStrip ? "aspect-[5/2] max-h-28" : "aspect-[5/3]",
            !imagePriority && !isStrip && "mx-4 mt-4 w-[calc(100%-2rem)]",
            imagePriority && "max-h-44"
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
        <CardHeader className={cn("gap-2", isStrip && "py-3")}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{categoryLabel}</Badge>
          </div>
          <CardTitle
            className={cn(
              "font-display tracking-tight",
              isStrip ? "text-sm sm:text-base" : "text-base sm:text-lg"
            )}
          >
            {project.name}
          </CardTitle>
          <CardDescription
            className={cn(isStrip ? "line-clamp-2" : "line-clamp-3")}
          >
            {project.summary}
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent
        className={cn(
          "flex flex-wrap gap-2",
          imagePriority && "px-4",
          isStrip && "pt-0"
        )}
      >
        {techPreview.map((tech) => (
          <Badge key={tech} variant="secondary">
            {tech}
          </Badge>
        ))}
        {techOverflow > 0 ? (
          <Badge variant="ghost">+{techOverflow}</Badge>
        ) : null}
      </CardContent>
      <CardFooter
        className={cn(
          "justify-end gap-2",
          imagePriority && "px-4 pb-4",
          isStrip && "pt-0"
        )}
      >
        <Link
          className={cn(buttonVariants({ size: "sm" }), "gap-1")}
          to={`/projects/${project.slug}`}
        >
          View details
          <AppIcon aria-hidden className="size-3.5" icon="mdi:arrow-right" />
        </Link>
      </CardFooter>
    </Card>
  )
}
