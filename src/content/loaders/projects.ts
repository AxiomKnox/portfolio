import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { splitFrontmatter } from "@/content/assemble/frontmatter";
import { assembleProject } from "@/content/assemble/project";

const domainProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  category: z.enum(["devops", "web", "ml"]),
  type: z.string(),
  status: z.enum(["dev", "alpha", "beta", "prod", "archived"]),
  version: z.string(),
  releaseDate: z.string(),
  techStack: z.array(z.string()),
  featured: z.boolean().optional(),
  links: z.object({
    github: z.string().optional(),
    live: z.string().optional(),
  }),
  /** Filename (`preview.png`|`preview.webp`) or GradientPreview token. */
  preview: z.string(),
  associated: z.array(z.string()),
  architecture: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          x: z.number(),
          y: z.number(),
        }),
      ),
      edges: z.array(z.object({ from: z.string(), to: z.string() })),
      steps: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          detail: z.string(),
        }),
      ),
    })
    .optional(),
});

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function resolveContentDir(root: URL, relative: string): string {
  return fileURLToPath(new URL(`${relative.replace(/\\/g, "/").replace(/\/?$/, "/")}`, root));
}

/** Content Layer loader: FM + body + optional git-meta/architecture/preview → domain Project. */
export function projectsLoader(options?: { base?: string }): Loader {
  const base = options?.base ?? "src/content/projects";
  // Soft guard: live Collections root only — never scan `src/content/placeholder/`.
  const normalizedBase = base.replace(/\\/g, "/");
  if (normalizedBase.split("/").includes("placeholder")) {
    throw new Error(`projectsLoader must not load from placeholder (got base=${base})`);
  }

  return {
    name: "portfolio-projects-loader",
    schema: domainProjectSchema,
    load: async ({ store, parseData, watcher, config, logger }) => {
      const projectsRoot = resolveContentDir(config.root, base);

      store.clear();
      let dirs: string[];
      try {
        dirs = await readdir(projectsRoot);
      } catch (err) {
        logger.error(`Projects root missing: ${projectsRoot}`);
        throw err;
      }

      for (const folderId of dirs) {
        const dir = join(projectsRoot, folderId);
        const dirStat = await stat(dir);
        if (!dirStat.isDirectory()) continue;

        const mdPath = join(dir, "project.md");
        if (!(await pathExists(mdPath))) {
          throw new Error(`Project folder "${folderId}" is missing project.md`);
        }

        const raw = await readFile(mdPath, "utf8");
        const { data: frontmatter, body } = splitFrontmatter(raw);

        const gitMetaPath = join(dir, "git-meta.json");
        let gitMetaRaw: unknown | undefined;
        if (await pathExists(gitMetaPath)) {
          gitMetaRaw = JSON.parse(await readFile(gitMetaPath, "utf8"));
        }

        const architecturePath = join(dir, "architecture.json");
        let architectureRaw: unknown | undefined;
        if (await pathExists(architecturePath)) {
          architectureRaw = JSON.parse(await readFile(architecturePath, "utf8"));
        }

        const project = assembleProject({
          folderId,
          frontmatter,
          body,
          gitMetaRaw,
          architectureRaw,
          hasPreviewPng: await pathExists(join(dir, "preview.png")),
          hasPreviewWebp: await pathExists(join(dir, "preview.webp")),
        });

        const data = await parseData({
          id: project.id,
          data: project as unknown as Record<string, unknown>,
        });
        store.set({
          id: project.id,
          data,
          filePath: `${base}/${folderId}/project.md`.replace(/\\/g, "/"),
        });
      }

      watcher?.add(projectsRoot);
      logger.info(`Loaded ${store.entries().length} projects from ${base}`);
    },
  };
}
