import { cp, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "astro/zod";
import type { DevSyncConfig, FixtureProject, FixtureRef } from "@/sync/types";
import { LIVE_PROFILE_DIR, LIVE_PROJECTS_DIR } from "@/sync/wipe";

export const PLACEHOLDER_ROOT = "src/content/placeholder";

const fixtureRefSchema = z
  .object({
    /** Path under `src/content/placeholder/` (no leading/trailing slash). */
    path: z.string().min(1),
  })
  .strict();

const fixtureProjectSchema = fixtureRefSchema.extend({
  id: z.string().min(1),
});

export const devSyncConfigSchema = z
  .object({
    profile: fixtureRefSchema,
    projects: z.array(fixtureProjectSchema),
  })
  .strict();

function normalizeFixturePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

/** Parse + validate `sync.config.dev.ts` (fixtures only). */
export function parseDevSyncConfig(raw: unknown): DevSyncConfig {
  const parsed = devSyncConfigSchema.parse(raw);
  const profile: FixtureRef = { path: normalizeFixturePath(parsed.profile.path) };
  const projects: FixtureProject[] = parsed.projects.map((p) => ({
    id: p.id,
    path: normalizeFixturePath(p.path),
  }));

  const ids = new Set<string>();
  for (const p of projects) {
    if (ids.has(p.id)) {
      throw new Error(`sync.config.dev.ts: duplicate project id "${p.id}"`);
    }
    ids.add(p.id);
    if (p.path.includes("..")) {
      throw new Error(`sync.config.dev.ts: project "${p.id}" path must stay under placeholder`);
    }
  }
  if (profile.path.includes("..")) {
    throw new Error("sync.config.dev.ts: profile path must stay under placeholder");
  }

  return { profile, projects };
}

async function assertDir(path: string, label: string): Promise<void> {
  try {
    const s = await stat(path);
    if (!s.isDirectory()) {
      throw new Error(`${label} is not a directory: ${path}`);
    }
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`${label} missing: ${path}`);
    }
    throw err;
  }
}

/**
 * Copy fixture trees from `placeholder/` into live `projects/` + `profile/`.
 * Caller must wipe live roots first when a clean materialize is required.
 */
export async function materializeFixtures(params: {
  config: DevSyncConfig;
  repoRoot: string;
  placeholderRoot?: string;
}): Promise<{ copiedRoots: number }> {
  const placeholderRoot = join(params.repoRoot, params.placeholderRoot ?? PLACEHOLDER_ROOT);
  let copiedRoots = 0;

  const profileSrc = join(placeholderRoot, params.config.profile.path);
  const profileDest = join(params.repoRoot, LIVE_PROFILE_DIR);
  await assertDir(profileSrc, "Fixture profile");
  await mkdir(dirname(profileDest), { recursive: true });
  await cp(profileSrc, profileDest, { recursive: true });
  copiedRoots += 1;

  for (const project of params.config.projects) {
    const src = join(placeholderRoot, project.path);
    const dest = join(params.repoRoot, LIVE_PROJECTS_DIR, project.id);
    await assertDir(src, `Fixture project "${project.id}"`);
    await mkdir(dirname(dest), { recursive: true });
    await cp(src, dest, { recursive: true });
    copiedRoots += 1;
  }

  return { copiedRoots };
}
