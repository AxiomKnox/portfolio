import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

/** Live Collections roots (generated). Never wipe `placeholder/`. */
export const LIVE_PROJECTS_DIR = "src/content/projects";
export const LIVE_PROFILE_DIR = "src/content/profile";

/**
 * Delete live `projects/` + `profile/` trees entirely.
 * Leaves `src/content/placeholder/` untouched. Callers recreate via materialize/fetch.
 */
export async function wipeLiveContentRoots(repoRoot: string): Promise<void> {
  await rm(join(repoRoot, LIVE_PROJECTS_DIR), { recursive: true, force: true });
  await rm(join(repoRoot, LIVE_PROFILE_DIR), { recursive: true, force: true });
  await mkdir(join(repoRoot, "src/content"), { recursive: true });
}
