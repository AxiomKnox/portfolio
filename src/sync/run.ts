import { resolve } from "node:path";
import { parseSyncConfig } from "@/sync/config";
import { createGitHubClient, type FetchLike } from "@/sync/github";
import { buildSyncPlan } from "@/sync/plan";
import type { SyncConfig } from "@/sync/types";
import { wipeLiveContentRoots } from "@/sync/wipe";
import { applySyncPlan } from "@/sync/write";

export type RunSyncOptions = {
  config: unknown;
  token?: string;
  repoRoot?: string;
  fetchImpl?: FetchLike;
  /** When true, plan only (no wipe/writes). Useful for dry-run / tests. */
  dryRun?: boolean;
};

export type RunSyncResult = {
  fileCount: number;
  deleteCount: number;
};

/**
 * Prod sync: wipe live `projects/` + `profile/`, then fetch remotes from
 * `sync.config.ts` (never reads `placeholder/`). Fail-closed on missing token /
 * remote errors. Profile skipped when omitted/TODO.
 */
export async function runSync(options: RunSyncOptions): Promise<RunSyncResult> {
  const token = options.token ?? process.env.GITHUB_TOKEN;
  if (!token || token.trim().length === 0) {
    throw new Error("GITHUB_TOKEN is required (set in .env or CI job secret) — fail-closed");
  }

  const config: SyncConfig = parseSyncConfig(options.config);
  const repoRoot = resolve(options.repoRoot ?? process.cwd());
  const client = createGitHubClient({
    token: token.trim(),
    fetchImpl: options.fetchImpl,
  });

  const plan = await buildSyncPlan({ client, config });

  if (!options.dryRun) {
    await wipeLiveContentRoots(repoRoot);
    await applySyncPlan({ plan, repoRoot });
  }

  return {
    fileCount: plan.files.length,
    deleteCount: plan.deleteIfPresent.length,
  };
}
