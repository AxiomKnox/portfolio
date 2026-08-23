import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * T4 / PROG-50 — kill-list contract from docs/research/t3-architecture-deepening.md §2.
 * Independent source of truth: the T3 report, not current package.json contents.
 */
const ROOT = join(import.meta.dir, "../..");

function readPackageJson(): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
}

describe("T4 dependency prune kill-list", () => {
  test("removes unused @tailwindcss/forms (zero app references)", () => {
    const pkg = readPackageJson();
    expect(pkg.dependencies?.["@tailwindcss/forms"]).toBeUndefined();
    expect(pkg.devDependencies?.["@tailwindcss/forms"]).toBeUndefined();
  });

  test("removes @tabler/icons after DialogContent close icon swap", () => {
    const pkg = readPackageJson();
    expect(pkg.dependencies?.["@tabler/icons"]).toBeUndefined();
    expect(pkg.devDependencies?.["@tabler/icons"]).toBeUndefined();

    const dialogContent = readFileSync(
      join(ROOT, "src/components/starwind/dialog/DialogContent.astro"),
      "utf8",
    );
    expect(dialogContent).not.toContain("@tabler");
    expect(dialogContent).toContain('name="x"');
  });
});
