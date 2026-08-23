import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Experiment: date filter keeps year chips + masked fields; DayPicker popover is gone.
 */
const ROOT = join(import.meta.dir, "../..");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

function readPackageJson(): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  return JSON.parse(read("package.json"));
}

describe("date filter without calendar popover", () => {
  test("drops react-day-picker, date-fns, and class-variance-authority", () => {
    const pkg = readPackageJson();
    for (const name of ["react-day-picker", "date-fns", "class-variance-authority"] as const) {
      expect(pkg.dependencies?.[name]).toBeUndefined();
      expect(pkg.devDependencies?.[name]).toBeUndefined();
    }
  });

  test("removes shadcn calendar and the button that only it used", () => {
    expect(existsSync(join(ROOT, "src/components/ui/calendar.tsx"))).toBe(false);
    expect(existsSync(join(ROOT, "src/components/ui/button.tsx"))).toBe(false);
  });

  test("ReleaseDateSection keeps typed date fields and does not load a picker", () => {
    const src = read("src/components/projects-toolbar/ReleaseDateSection.tsx");
    expect(src).toContain('aria-label="From date"');
    expect(src).toContain('aria-label="To date"');
    expect(src).not.toContain("react-day-picker");
    expect(src).not.toContain("date-fns");
    expect(src).not.toContain('aria-label="Open calendar"');
    expect(src).not.toContain("@/components/ui/calendar");
  });

  test("astro config does not prebundle calendar packages", () => {
    const cfg = read("astro.config.mjs");
    expect(cfg).not.toContain("react-day-picker");
    expect(cfg).not.toContain("date-fns");
  });
});
