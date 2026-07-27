import type { Project } from "@/content/types";
import { withBase } from "@/lib/base";
import { BrandIcon, UiIcon } from "@/lib/icon-renderers";
import type { OptimizedImageAttrs } from "@/lib/optimized-image";
import { statusLabel } from "@/lib/status-display";
import { GradientPreview } from "./GradientPreview";

const CATEGORY_LABEL: Record<Project["category"], string> = {
  devops: "DevOps",
  web: "Web",
  ml: "ML",
};

function PreviewMedia({
  project,
  previewImage,
  className,
  label,
}: {
  project: Project;
  previewImage?: OptimizedImageAttrs;
  className: string;
  label?: string;
}) {
  if (previewImage) {
    return (
      <img
        src={previewImage.src}
        width={previewImage.width}
        height={previewImage.height}
        alt={project.title}
        className={`object-cover ${className}`}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }
  return <GradientPreview id={project.preview} className={className} label={label} />;
}

export function ProjectCard({
  project,
  previewImage,
}: {
  project: Project;
  previewImage?: OptimizedImageAttrs;
}) {
  const shown = project.techStack.slice(0, 3);
  const more = project.techStack.length - shown.length;
  return (
    <a
      href={withBase(`/projects/${project.id}`)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[0_0_0_1px_var(--color-border),0_8px_30px_-15px_rgba(0,0,0,0.35)]"
    >
      <PreviewMedia
        project={project}
        previewImage={previewImage}
        className="aspect-video w-full"
        label={project.id}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>{CATEGORY_LABEL[project.category]}</span>
            <span className="text-border">·</span>
            <span className="status-dot" data-status={project.status} />
            <span>{statusLabel(project.status, "compact")}</span>
          </div>
          <UiIcon
            name="arrow-up-right"
            size={14}
            className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </div>
        <p className="mt-3 text-base font-medium tracking-tight text-foreground">{project.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {shown.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              <BrandIcon name={t} size={11} />
              {t}
            </span>
          ))}
          {more > 0 && <span className="font-mono text-[10px] text-muted-foreground">+{more}</span>}
        </div>
      </div>
    </a>
  );
}

export function ProjectRow({
  project,
  previewImage,
}: {
  project: Project;
  previewImage?: OptimizedImageAttrs;
}) {
  return (
    <a
      href={withBase(`/projects/${project.id}`)}
      className="group flex gap-5 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/30"
    >
      <PreviewMedia
        project={project}
        previewImage={previewImage}
        className="hidden h-24 w-40 shrink-0 rounded-md sm:block"
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{CATEGORY_LABEL[project.category]}</span>
          <span className="text-border">·</span>
          <span className="status-dot" data-status={project.status} />
          <span>{statusLabel(project.status, "compact")}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-base font-medium tracking-tight text-foreground">{project.title}</p>
          <UiIcon
            name="arrow-up-right"
            size={14}
            className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {project.techStack.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              <BrandIcon name={t} size={10} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
