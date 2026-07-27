import { z } from "astro/zod";
import { resolveGitMeta } from "@/content/assemble/git-meta";
import type { Project, ProjectArchitecture } from "@/content/types/project";

const categorySchema = z.enum(["devops", "web", "ml"]);
const statusSchema = z.enum(["dev", "alpha", "beta", "prod", "archived"]);

const architectureSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    }),
  ),
  steps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
    }),
  ),
});

/** Authored frontmatter only — no version/releaseDate (PROG-80). */
export const projectFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  category: categorySchema,
  type: z.string().min(1),
  status: statusSchema,
  techStack: z.array(z.string()),
  featured: z.boolean().optional(),
  links: z
    .object({
      github: z.string().optional(),
      live: z.string().optional(),
    })
    .optional(),
  preview: z.string().optional(),
  associated: z.array(z.string()).optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export type ProjectAssembleInput = {
  folderId: string;
  frontmatter: unknown;
  body: string;
  gitMetaRaw?: unknown;
  architectureRaw?: unknown;
  hasPreviewPng: boolean;
  hasPreviewWebp: boolean;
  now?: Date;
};

/**
 * Assemble domain Project from on-disk pieces (PROG-79 / PROG-80).
 * Preview image presence is validated (both → fail-closed); UI image wire is PROG-84.
 */
export function assembleProject(input: ProjectAssembleInput): Project {
  const fm = projectFrontmatterSchema.parse(input.frontmatter);

  if (fm.id !== input.folderId) {
    throw new Error(`Project id mismatch: folder "${input.folderId}" vs frontmatter "${fm.id}"`);
  }

  if (input.hasPreviewPng && input.hasPreviewWebp) {
    throw new Error(`Project "${fm.id}" has both preview.png and preview.webp — keep only one`);
  }

  let architecture: ProjectArchitecture | undefined;
  if (input.architectureRaw !== undefined) {
    architecture = architectureSchema.parse(input.architectureRaw);
  }

  const meta = resolveGitMeta(input.gitMetaRaw, input.now);
  const preview = input.hasPreviewPng
    ? "preview.png"
    : input.hasPreviewWebp
      ? "preview.webp"
      : (fm.preview ?? "grad-1");

  return {
    id: fm.id,
    title: fm.title,
    summary: fm.summary,
    description: input.body
      .replace(/^\uFEFF?/, "")
      .replace(/^\n+/, "")
      .replace(/\n+$/, ""),
    category: fm.category,
    type: fm.type,
    status: fm.status,
    version: meta.version,
    releaseDate: meta.releaseDate,
    techStack: fm.techStack,
    ...(fm.featured !== undefined ? { featured: fm.featured } : {}),
    links: fm.links ?? {},
    preview,
    associated: fm.associated ?? [],
    ...(architecture ? { architecture } : {}),
  };
}
