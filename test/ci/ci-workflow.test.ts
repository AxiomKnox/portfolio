import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const workflowPath = resolve(import.meta.dir, "../../.github/workflows/ci.yml");

function runLines(yaml: string): string[] {
  return yaml
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("run:"));
}

/**
 * Contract: PR/push CI materializes fixtures via sync:dev (no PAT), then
 * lint → check → test → build. Prod remote sync stays on deploy.yml.
 */
describe("ci.yml PR verify", () => {
  test("runs sync:dev then lint, check, test, build with telemetry disabled", async () => {
    const yaml = await readFile(workflowPath, "utf8");

    expect(yaml).toMatch(/pull_request:/);
    expect(yaml).toContain('ASTRO_TELEMETRY_DISABLED: "1"');
    expect(yaml).toContain("github.repository_owner");
    expect(yaml).toContain("github.event.repository.name");
    expect(yaml).not.toContain("vars.ASTRO_SITE");
    expect(yaml).not.toContain("vars.ASTRO_BASE");

    const runs = runLines(yaml);
    const syncDevIdx = runs.indexOf("run: bun run sync:dev");
    const lintIdx = runs.indexOf("run: bun run lint");
    const checkIdx = runs.indexOf("run: bun run check");
    const testIdx = runs.indexOf("run: bun run test");
    const buildIdx = runs.indexOf("run: bun run build");

    expect(syncDevIdx).toBeGreaterThan(-1);
    expect(lintIdx).toBeGreaterThan(-1);
    expect(checkIdx).toBeGreaterThan(-1);
    expect(testIdx).toBeGreaterThan(-1);
    expect(buildIdx).toBeGreaterThan(-1);
    expect(syncDevIdx).toBeLessThan(lintIdx);
    expect(lintIdx).toBeLessThan(checkIdx);
    expect(checkIdx).toBeLessThan(testIdx);
    expect(testIdx).toBeLessThan(buildIdx);

    // Prod remote sync / mixed remotes stay off PR CI (no PAT).
    expect(runs.includes("run: bun run sync")).toBe(false);
    expect(runs.includes("run: bun run sync:dev:all")).toBe(false);
    expect(yaml).not.toContain("PORTFOLIO_GITHUB_TOKEN");
  });
});
