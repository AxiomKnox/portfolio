import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Icon 4→2 contract — bun test cannot resolve unplugin `~icons/*`, so we
 * assert public module layout and CSS hooks via source rather than importing
 * the catalog/renderers modules.
 */
const ROOT = join(import.meta.dir, "../..");
const lib = join(ROOT, "src/lib");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("icon-catalog (source contract)", () => {
  test("exports separate UI and brand maps plus coverage helpers", () => {
    const src = read("src/lib/icon-catalog.tsx");
    expect(src).toContain("export const UI_ICONS");
    expect(src).toContain("export type UiIconName");
    expect(src).toContain("export const BRAND_ICONS");
    expect(src).toContain("export function getBrandIconEntry");
    expect(src).toContain("export function assertBrandCatalogCoverage");
    expect(src).toContain("export function missingBrandIcons");
    // Dead APIs must stay gone
    expect(src).not.toContain("STATIC_ICONS");
    expect(src).not.toContain("STATIC_ICON_NAMES");
    expect(src).not.toContain("resolveStaticIcon");
    expect(src).not.toContain("export function getBrandIcon(");
  });

  test("UI map includes homepage whatIcon names and dialog close", () => {
    const src = read("src/lib/icon-catalog.tsx");
    for (const name of ["server", "globe", "sparkles", "x", "mail"]) {
      expect(src).toMatch(new RegExp(`\\b${name}:`));
    }
  });
});

describe("icon-renderers (source contract)", () => {
  test("exports BrandIcon and UiIcon only (no TechIcon alias)", () => {
    const src = read("src/lib/icon-renderers.tsx");
    expect(src).toContain("export function UiIcon");
    expect(src).toContain("export function BrandIcon");
    expect(src).not.toContain("TechIcon");
    expect(src).not.toContain("resolveTechIcon");
    expect(src).toContain("brand-icon");
    expect(src).toContain("--brand-icon-light-mode-override");
    expect(src).not.toContain("tech-icon");
  });
});

describe("icon layout contract (4→2)", () => {
  test("old icon modules are gone; catalog + renderers remain", () => {
    const gone = ["brand-icons.tsx", "icon-registry.ts", "tech-icons.tsx"];
    for (const file of gone) {
      expect(() => readFileSync(join(lib, file))).toThrow();
    }
    expect(readFileSync(join(lib, "icon-catalog.tsx"), "utf8")).toContain("UI_ICONS");
    expect(readFileSync(join(lib, "icon-renderers.tsx"), "utf8")).toContain("BrandIcon");
    expect(() => readFileSync(join(ROOT, "src/components/icons/Icon.astro"))).toThrow();
  });

  test("styles use .brand-icon CSS hooks, not .tech-icon", () => {
    const css = read("src/styles.css");
    expect(css).toContain(".brand-icon");
    expect(css).toContain("--brand-icon-light-mode-override");
    expect(css).not.toContain(".tech-icon");
    expect(css).not.toContain("--tech-icon-light-mode-override");
  });

  test("adapter imports brand coverage from icon-catalog", () => {
    const adapter = read("src/content/adapter.ts");
    expect(adapter).toContain('from "@/lib/icon-catalog"');
    expect(adapter).toContain("assertBrandCatalogCoverage");
    expect(adapter).not.toContain("brand-icons");
  });

  test("call sites no longer import deleted modules", () => {
    const files = [
      "src/pages/index.astro",
      "src/pages/about.astro",
      "src/pages/projects/[id].astro",
      "src/components/Footer.astro",
      "src/components/AboutPreviewDialog.astro",
      "src/components/starwind/dialog/DialogContent.astro",
      "src/components/ProjectCard.tsx",
      "src/components/ProjectsToolbar.tsx",
    ];
    for (const file of files) {
      const src = read(file);
      expect(src).not.toContain("@/lib/tech-icons");
      expect(src).not.toContain("@/lib/brand-icons");
      expect(src).not.toContain("@/lib/icon-registry");
      expect(src).not.toContain("@/components/icons/Icon.astro");
      expect(src).not.toContain("TechIcon");
    }
  });

  test("no lucide-react dependency or imports (single unplugin Lucide path)", () => {
    const pkg = read("package.json");
    expect(pkg).not.toContain("lucide-react");

    const files = [
      "src/components/AmbientToggle.astro",
      "src/components/MotionToggle.astro",
      "src/components/ProjectCard.tsx",
      "src/components/ProjectsToolbar.tsx",
      "src/components/ui/accordion.tsx",
      "src/components/ui/calendar.tsx",
      "src/components/ui/dropdown-menu.tsx",
    ];
    for (const file of files) {
      expect(read(file)).not.toContain("lucide-react");
    }
  });
});
