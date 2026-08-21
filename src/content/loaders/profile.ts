import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { splitFrontmatter } from "@/content/assemble/frontmatter";
import { assembleProfile } from "@/content/assemble/profile";

const domainProfileSchema = z.object({
  initials: z.string(),
  fullName: z.string(),
  tagline: z.string(),
  bio: z.string(),
  bioLong: z.array(z.string()),
  location: z.string(),
  yearsExperience: z.number(),
  education: z.string(),
  email: z.string(),
  avatar: z.string(),
  profilePhoto: z.literal("profile_photo.png").optional(),
  resume: z.literal("resume.pdf").optional(),
  what: z.array(
    z.object({
      label: z.string(),
      icon: z.string(),
      deliverables: z.array(z.string()),
      learning: z.boolean().optional(),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      icon: z.string(),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
      learning: z.boolean().optional(),
    }),
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      summary: z.string(),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      href: z.string().optional(),
      file: z.string().optional(),
    }),
  ),
});

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function listRelativeFiles(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listRelativeFiles(full, base)));
    } else if (entry.name !== "profile.md") {
      out.push(relative(base, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

function resolveContentDir(root: URL, relativePath: string): string {
  return fileURLToPath(new URL(`${relativePath.replace(/\\/g, "/").replace(/\/?$/, "/")}`, root));
}

/** Single-entry profile loader (id = `profile`). */
export function profileLoader(options?: { base?: string }): Loader {
  const base = options?.base ?? "src/content/profile";
  // Soft guard: live Collections root only — never scan `src/content/placeholder/`.
  const normalizedBase = base.replace(/\\/g, "/");
  if (normalizedBase.split("/").includes("placeholder")) {
    throw new Error(`profileLoader must not load from placeholder (got base=${base})`);
  }

  return {
    name: "portfolio-profile-loader",
    schema: domainProfileSchema,
    load: async ({ store, parseData, watcher, config, logger }) => {
      const profileRoot = resolveContentDir(config.root, base);
      const mdPath = join(profileRoot, "profile.md");

      if (!(await pathExists(mdPath))) {
        throw new Error(`Missing ${base}/profile.md`);
      }

      const raw = await readFile(mdPath, "utf8");
      const { data: frontmatter } = splitFrontmatter(raw);
      const existingRelativeFiles = new Set(await listRelativeFiles(profileRoot));
      const hasProfilePhoto = await pathExists(join(profileRoot, "profile_photo.png"));

      const profile = assembleProfile({
        frontmatter,
        existingRelativeFiles,
        hasProfilePhoto,
      });

      store.clear();
      const data = await parseData({
        id: "profile",
        data: profile as unknown as Record<string, unknown>,
      });
      store.set({
        id: "profile",
        data,
        filePath: `${base}/profile.md`.replace(/\\/g, "/"),
      });

      watcher?.add(profileRoot);
      logger.info(`Loaded profile from ${base}`);
    },
  };
}
