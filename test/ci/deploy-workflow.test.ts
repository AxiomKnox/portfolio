import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const workflowPath = resolve(import.meta.dir, "../../.github/workflows/deploy.yml");

/**
 * Contract: deploy runs prod `bun run sync` before `astro build`
 * (July-17 / PROG-62 sync-then-build). Never fixture-only sync:dev*.
 */
describe("deploy.yml sync-then-build", () => {
  test("runs bun run sync before bun run build with PORTFOLIO_GITHUB_TOKEN mapped", async () => {
    const yaml = await readFile(workflowPath, "utf8");

    expect(yaml).toMatch(/branches:\s*\[main\]/);
    expect(yaml).toContain('ASTRO_TELEMETRY_DISABLED: "1"');
    expect(yaml).toContain("github.actor");
    expect(yaml).toContain("github.event.repository.name");
    expect(yaml).not.toContain("vars.ASTRO_SITE");
    expect(yaml).not.toContain("vars.ASTRO_BASE");
    expect(yaml).toContain("actions/deploy-pages@v4");

    const runs = yaml
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("run:"));
    const syncIdx = runs.indexOf("run: bun run sync");
    const buildIdx = runs.indexOf("run: bun run build");
    expect(syncIdx).toBeGreaterThan(-1);
    expect(buildIdx).toBeGreaterThan(-1);
    expect(syncIdx).toBeLessThan(buildIdx);

    expect(runs.includes("run: bun run sync:dev")).toBe(false);
    expect(runs.includes("run: bun run sync:dev:all")).toBe(false);

    expect(yaml).toContain("secrets.PORTFOLIO_GITHUB_TOKEN");
    expect(yaml).toMatch(/GITHUB_TOKEN:\s*\$\{\{\s*secrets\.PORTFOLIO_GITHUB_TOKEN\s*\}\}/);
  });
});
