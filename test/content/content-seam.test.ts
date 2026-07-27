import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * T6 / PROG-51 P3 — content seam hygiene from docs/research/t3-architecture-deepening.md §1.
 * Islands/UI use `@/content/types`; Astro pages use `@/content/adapter`; no `@/data/*`.
 */
const ROOT = join(import.meta.dir, "../..");
const SRC = join(ROOT, "src");

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walkFiles(path, out);
      continue;
    }
    if (/\.(ts|tsx|astro|js|jsx)$/.test(name)) out.push(path);
  }
  return out;
}

describe("T6 P3 content seam (no @/data)", () => {
  test("src/data is gone", () => {
    expect(existsSync(join(SRC, "data"))).toBe(false);
  });

  test("no src file imports @/data", () => {
    const offenders: string[] = [];
    for (const file of walkFiles(SRC)) {
      const text = readFileSync(file, "utf8");
      if (text.includes("@/data") || /from\s+["'][^"']*\/data\//.test(text)) {
        offenders.push(relative(ROOT, file).replace(/\\/g, "/"));
      }
    }
    expect(offenders).toEqual([]);
  });

  test("architecture surfaces import types from @/content/types", () => {
    const surfaces = [
      "src/components/islands/ProjectArchitectureIsland.tsx",
      "src/components/ArchitectureDiagram.tsx",
      "src/components/StepsAccordion.tsx",
    ];
    for (const rel of surfaces) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      expect(text).toContain('from "@/content/types"');
      expect(text).not.toContain("@/data");
    }
  });

  test("adapter re-exports ProjectArchitecture for server consumers", () => {
    const adapter = readFileSync(join(SRC, "content/adapter.ts"), "utf8");
    expect(adapter).toMatch(/ProjectArchitecture/);
    expect(adapter).toContain('from "@/content/types"');
  });
});
