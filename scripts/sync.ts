/**
 * Portfolio content sync (prod) — Bun fetch + GitHub API → live `src/content/**`.
 *
 * Usage:
 *   bun run sync
 *   GITHUB_TOKEN=… bun run scripts/sync.ts
 *
 * Wipes live `projects/` + `profile/` first, then fetches remotes from
 * `sync.config.ts`. Never reads `src/content/placeholder/`.
 *
 * For local fixtures: `bun run sync:dev` / `bun run sync:dev:all`.
 */
import { resolve } from "node:path";
import { runSync } from "../src/sync/run.ts";
import config from "../sync.config.ts";

const repoRoot = resolve(import.meta.dir, "..");

try {
  const result = await runSync({ config, repoRoot });
  console.log(
    `Sync complete: wrote ${result.fileCount} file(s); removed ${result.deleteCount} stale optional path(s).`,
  );
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Sync failed (fail-closed): ${message}`);
  process.exit(1);
}
