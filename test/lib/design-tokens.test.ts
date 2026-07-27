import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../..");

function readStyles(): string {
  return readFileSync(join(ROOT, "src/styles.css"), "utf8");
}

describe("design-system Foundations tokens", () => {
  test("defines ambient blob + star tokens in :root", () => {
    const css = readStyles();
    for (const token of [
      "--ambient-blob-1",
      "--ambient-blob-2",
      "--ambient-blob-3",
      "--ambient-blob-4",
      "--ambient-star",
      "--preview-grad-label",
    ]) {
      expect(css).toContain(`${token}:`);
    }
  });

  test("ambient blob classes paint via tokens, not raw hex", () => {
    const css = readStyles();
    expect(css).toContain("background: var(--ambient-blob-1)");
    expect(css).toContain("background: var(--ambient-blob-2)");
    expect(css).toContain("background: var(--ambient-blob-3)");
    expect(css).toContain("background: var(--ambient-blob-4)");
    expect(css).not.toMatch(/\.ambient-blob-[1-4]\s*\{[^}]*background:\s*#[0-9a-fA-F]{3,8}/);
  });

  test("GradientPreview label uses Foundations class, not text-white", () => {
    const source = readFileSync(join(ROOT, "src/components/GradientPreview.tsx"), "utf8");
    expect(source).toContain("gradient-preview-label");
    expect(source).not.toContain("text-white");
  });

  test("AmbientBackground reads --ambient-star for canvas paint", () => {
    const source = readFileSync(join(ROOT, "src/components/AmbientBackground.tsx"), "utf8");
    expect(source).toContain("--ambient-star");
    expect(source).not.toContain('fillStyle = "#ffffff"');
  });
});
