import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { SyncPlan } from "@/sync/plan";

/**
 * Apply a completed sync plan to the live content tree.
 * Call only after `buildSyncPlan` succeeds (all remotes fetched) so remote
 * failures never partially update disk. Write errors still fail the process.
 */
export async function applySyncPlan(params: { plan: SyncPlan; repoRoot: string }): Promise<void> {
  for (const file of params.plan.files) {
    const livePath = join(params.repoRoot, file.relativePath);
    await mkdir(dirname(livePath), { recursive: true });
    await writeFile(livePath, file.bytes);
  }

  for (const rel of params.plan.deleteIfPresent) {
    await rm(join(params.repoRoot, rel), { force: true });
  }
}
