/**
 * Dev content sync — materialize fixtures from `src/content/placeholder/`.
 *
 * Usage:
 *   bun run sync:dev          # fixtures only (no GitHub)
 *   bun run sync:dev:all      # fixtures, then project remotes from sync.config.ts
 */
import { resolve } from "node:path";
import { runDevSync } from "../src/sync/run-dev.ts";
import fixtureConfig from "../sync.config.dev.ts";
import prodConfig from "../sync.config.ts";

const repoRoot = resolve(import.meta.dir, "..");
const withRemotes = process.argv.includes("--all");

try {
  const result = await runDevSync({
    mode: withRemotes ? "dev:all" : "dev",
    fixtureConfig,
    prodConfig: withRemotes ? prodConfig : undefined,
    repoRoot,
  });
  if (result.mode === "dev") {
    console.log(
      `Dev sync complete: materialized ${result.fixtureRoots} fixture root(s) into live content.`,
    );
  } else {
    console.log(
      `Dev sync (all) complete: materialized ${result.fixtureRoots} fixture root(s); wrote ${result.remoteFileCount} remote file(s); removed ${result.remoteDeleteCount} stale optional path(s). Profile stayed fixture-only.`,
    );
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Dev sync failed (fail-closed): ${message}`);
  process.exit(1);
}
