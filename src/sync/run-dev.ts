import { resolve } from "node:path";
import { parseSyncConfig } from "@/sync/config";
import { materializeFixtures, parseDevSyncConfig } from "@/sync/fixtures";
import { createGitHubClient, type FetchLike } from "@/sync/github";
import { buildSyncPlan } from "@/sync/plan";
import { wipeLiveContentRoots } from "@/sync/wipe";
import { applySyncPlan } from "@/sync/write";

export type RunDevSyncMode = "dev" | "dev:all";

export type RunDevSyncOptions = {
  mode: RunDevSyncMode;
  /** Raw `sync.config.dev.ts` export. */
  fixtureConfig: unknown;
  /** Raw `sync.config.ts` export — required for `dev:all` (projects only). */
  prodConfig?: unknown;
  token?: string;
  repoRoot?: string;
  fetchImpl?: FetchLike;
  dryRun?: boolean;
  /** Injectable warn sink (tests). Defaults to `console.warn`. */
  warn?: (message: string) => void;
};

export type RunDevSyncResult = {
  mode: RunDevSyncMode;
  fixtureRoots: number;
  remoteFileCount: number;
  remoteDeleteCount: number;
};

/**
 * Dev sync family:
 * - `dev` — wipe live roots → materialize fixtures from `sync.config.dev.ts` (no GitHub).
 * - `dev:all` — same, then sync project remotes from `sync.config.ts` (profile stays fixture).
 *   Id overlap: remote wins (written after fixtures). Warns when remotes need a token and none is set.
 */
export async function runDevSync(options: RunDevSyncOptions): Promise<RunDevSyncResult> {
  const warn = options.warn ?? console.warn;
  const repoRoot = resolve(options.repoRoot ?? process.cwd());
  const fixtures = parseDevSyncConfig(options.fixtureConfig);

  if (!options.dryRun) {
    await wipeLiveContentRoots(repoRoot);
    const { copiedRoots } = await materializeFixtures({ config: fixtures, repoRoot });
    if (options.mode === "dev") {
      return {
        mode: "dev",
        fixtureRoots: copiedRoots,
        remoteFileCount: 0,
        remoteDeleteCount: 0,
      };
    }
  } else if (options.mode === "dev") {
    return {
      mode: "dev",
      fixtureRoots: 1 + fixtures.projects.length,
      remoteFileCount: 0,
      remoteDeleteCount: 0,
    };
  }

  // `dev:all` — auto-import project remotes from prod config; ignore prod profile.
  if (options.prodConfig === undefined) {
    throw new Error("sync:dev:all requires prod sync.config.ts (projects remotes)");
  }
  const prod = parseSyncConfig(options.prodConfig);
  const fixtureRoots = 1 + fixtures.projects.length;

  if (prod.projects.length === 0) {
    return {
      mode: "dev:all",
      fixtureRoots,
      remoteFileCount: 0,
      remoteDeleteCount: 0,
    };
  }

  const token = options.token ?? process.env.GITHUB_TOKEN;
  if (!token || token.trim().length === 0) {
    warn(
      "WARNING: GITHUB_TOKEN is not set — live project remotes will fail closed (fixtures already materialized)",
    );
    throw new Error("GITHUB_TOKEN is required (set in .env or CI job secret) — fail-closed");
  }

  const client = createGitHubClient({
    token: token.trim(),
    fetchImpl: options.fetchImpl,
  });
  const plan = await buildSyncPlan({
    client,
    config: { projects: prod.projects },
  });

  if (!options.dryRun) {
    await applySyncPlan({ plan, repoRoot });
  }

  return {
    mode: "dev:all",
    fixtureRoots,
    remoteFileCount: plan.files.length,
    remoteDeleteCount: plan.deleteIfPresent.length,
  };
}
