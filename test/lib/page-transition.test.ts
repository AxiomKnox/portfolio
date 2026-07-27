import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clearProjectBackPath,
  DEFAULT_PAGE_TRANSITION,
  extractProjectDetailId,
  normalizeRoutePath,
  PAGE_TRANSITION_ATTR,
  PAGE_TRANSITION_PHASE_MS,
  PAGE_TRANSITION_SKIP_ATTR,
  PAGE_TRANSITION_TOTAL_MS,
  PROJECT_BACK_STORAGE_KEY,
  rememberProjectBackPath,
  shouldSkipPageTransitionAnimations,
  shouldUseHistoryBackForProject,
  stripBaseFromPath,
} from "@/lib/page-transition";

describe("page-transition timing", () => {
  test("both phases run in parallel — total wall-clock equals a single phase", () => {
    expect(PAGE_TRANSITION_PHASE_MS).toBe(220);
    expect(PAGE_TRANSITION_TOTAL_MS).toBe(PAGE_TRANSITION_PHASE_MS);
    expect(PAGE_TRANSITION_TOTAL_MS).toBe(220);
    expect(PAGE_TRANSITION_TOTAL_MS).toBeGreaterThanOrEqual(150);
    expect(PAGE_TRANSITION_TOTAL_MS).toBeLessThanOrEqual(300);
  });
});

describe("page-transition fade", () => {
  test("hard-wires soft fade", () => {
    expect(DEFAULT_PAGE_TRANSITION).toBe("fade");
  });

  test("exports stable html attributes", () => {
    expect(PAGE_TRANSITION_ATTR).toBe("data-page-transition");
    expect(PAGE_TRANSITION_SKIP_ATTR).toBe("data-page-transition-skip");
  });
});

describe("project detail path helpers", () => {
  test("extracts detail ids and ignores projects index", () => {
    expect(extractProjectDetailId("/projects/atlas-deploy")).toBe("atlas-deploy");
    expect(extractProjectDetailId("/projects/atlas-deploy/")).toBe("atlas-deploy");
    expect(extractProjectDetailId("/projects")).toBeNull();
    expect(extractProjectDetailId("/")).toBeNull();
    expect(extractProjectDetailId("/about")).toBeNull();
  });
});

describe("project detail Back storage", () => {
  const store = new Map<string, string>();
  const fakeSession = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };

  // bun:test has no DOM; stub sessionStorage for these helpers.
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: fakeSession,
  });

  test("remembers non-detail → detail origin and clears", () => {
    store.clear();
    rememberProjectBackPath("/", "/projects/atlas-deploy");
    expect(shouldUseHistoryBackForProject()).toBe(true);
    expect(store.get(PROJECT_BACK_STORAGE_KEY)).toBe("/");

    rememberProjectBackPath("/projects", "/projects/quill-search");
    expect(store.get(PROJECT_BACK_STORAGE_KEY)).toBe("/projects");

    // detail → detail does not overwrite
    rememberProjectBackPath("/projects/quill-search", "/projects/atlas-deploy");
    expect(store.get(PROJECT_BACK_STORAGE_KEY)).toBe("/projects");

    clearProjectBackPath();
    expect(shouldUseHistoryBackForProject()).toBe(false);
  });

  test("preserves list search string in stored origin", () => {
    store.clear();
    rememberProjectBackPath("/projects", "/projects/atlas-deploy", "?q=astro&cat=web");
    expect(store.get(PROJECT_BACK_STORAGE_KEY)).toBe("/projects?q=astro&cat=web");
  });

  test("does not remember when leaving a detail or staying off detail", () => {
    store.clear();
    rememberProjectBackPath("/projects/atlas-deploy", "/projects");
    expect(shouldUseHistoryBackForProject()).toBe(false);
    rememberProjectBackPath("/", "/about");
    expect(shouldUseHistoryBackForProject()).toBe(false);
  });
});

describe("page-transition skip", () => {
  test("skips when data-motion is reduced", () => {
    expect(shouldSkipPageTransitionAnimations({ dataMotion: "reduced" })).toBe(true);
  });

  test("does not skip when motion is full", () => {
    expect(shouldSkipPageTransitionAnimations({ dataMotion: "full" })).toBe(false);
    expect(shouldSkipPageTransitionAnimations({ dataMotion: null })).toBe(false);
    expect(shouldSkipPageTransitionAnimations({ dataMotion: "" })).toBe(false);
  });
});

describe("route path helpers", () => {
  test("normalizes trailing slashes and strips base", () => {
    expect(normalizeRoutePath("/projects/")).toBe("/projects");
    expect(normalizeRoutePath("about")).toBe("/about");
    expect(stripBaseFromPath("/portfolio/about", "/portfolio/")).toBe("/about");
    expect(stripBaseFromPath("/portfolio/projects/", "/portfolio")).toBe("/projects");
  });
});

describe("view-transition CSS: parallel fade, not sequential", () => {
  const css = readFileSync(join(import.meta.dir, "../../src/styles.css"), "utf8");
  const libSrc = readFileSync(join(import.meta.dir, "../../src/lib/page-transition.ts"), "utf8");

  test("slide and fade-slide presets are fully removed from the stylesheet", () => {
    expect(css).not.toContain("fade-slide");
    expect(css).not.toContain("page-slide-");
    expect(css).not.toContain('data-page-transition="slide"');
    expect(css).not.toContain("data-transition-direction");
  });

  test("old and new main-content share the same duration with zero delay", () => {
    // Both old(main-content) and new(main-content) get animation-duration from
    // the same --page-transition-phase var, and no animation-delay pushes `new`
    // to start after `old` finishes (that would be sequential).
    const sharedRule = css.match(
      /::view-transition-old\(main-content\),\s*::view-transition-new\(main-content\)\s*\{([^}]*)\}/,
    );
    expect(sharedRule).not.toBeNull();
    const body = sharedRule![1];
    expect(body).toContain("animation-duration: var(--page-transition-phase)");
    expect(body).toContain("animation-delay: 0ms");

    // No rule scoped to `new(main-content)` alone should reintroduce a delay.
    const newOnlyDelay = css.match(
      /::view-transition-new\(main-content\)\s*\{[^}]*animation-delay:\s*var\(--page-transition-phase\)/,
    );
    expect(newOnlyDelay).toBeNull();
  });

  test("group duration is a single phase (parallel), not phase * 2", () => {
    const groupRule = css.match(/::view-transition-group\(main-content\)\s*\{([^}]*)\}/);
    expect(groupRule).not.toBeNull();
    expect(groupRule![1]).toContain("animation-duration: var(--page-transition-phase)");
    expect(css).not.toContain("--page-transition-total");
  });

  test("fade uses a parallel crossfade (old 1->0, new 0->1)", () => {
    expect(css).toMatch(/page-fade-out\s*\{\s*to\s*\{\s*opacity:\s*0/);
    expect(css).toMatch(/page-fade-in\s*\{\s*from\s*\{\s*opacity:\s*0/);
  });

  test("reduced-motion / skip wildcards suppress all VT groups", () => {
    expect(css).toContain("html[data-page-transition-skip]::view-transition-group(*)");
    expect(css).toContain('html[data-motion="reduced"]::view-transition-group(*)');
  });

  test("shared-element morph is fully removed — fade only", () => {
    expect(libSrc).not.toContain("projectImageTransitionName");
    expect(libSrc).not.toContain("VT_SHARED");
    expect(libSrc).not.toContain("retainOnlyProjectSharedNames");
    expect(css).not.toContain("vt-project-shared");
    expect(css).not.toContain("project-shared");
    expect(css).not.toContain("data-vt-shared");
  });
});
