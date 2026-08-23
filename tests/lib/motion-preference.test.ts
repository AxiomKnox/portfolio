import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isMotionReduced,
  MOTION_STORAGE_KEY,
  resolveMotionPreference,
} from "@/lib/motion-preference";

describe("resolveMotionPreference", () => {
  test("stored reduced always wins", () => {
    expect(resolveMotionPreference({ stored: "reduced", osPrefersReduced: false })).toBe("reduced");
    expect(resolveMotionPreference({ stored: "reduced", osPrefersReduced: true })).toBe("reduced");
  });

  test("stored full overrides OS reduce", () => {
    expect(resolveMotionPreference({ stored: "full", osPrefersReduced: true })).toBe("full");
    expect(resolveMotionPreference({ stored: "full", osPrefersReduced: false })).toBe("full");
  });

  test("no stored choice follows OS preference without inventing storage", () => {
    expect(resolveMotionPreference({ stored: null, osPrefersReduced: true })).toBe("reduced");
    expect(resolveMotionPreference({ stored: null, osPrefersReduced: false })).toBe("full");
    expect(resolveMotionPreference({ stored: undefined, osPrefersReduced: true })).toBe("reduced");
    expect(resolveMotionPreference({ stored: "", osPrefersReduced: false })).toBe("full");
  });

  test("unknown stored values fall back to OS", () => {
    expect(resolveMotionPreference({ stored: "maybe", osPrefersReduced: true })).toBe("reduced");
    expect(resolveMotionPreference({ stored: "maybe", osPrefersReduced: false })).toBe("full");
  });

  test("isMotionReduced mirrors effective", () => {
    expect(isMotionReduced("reduced")).toBe(true);
    expect(isMotionReduced("full")).toBe(false);
  });

  test("exports stable storage key", () => {
    expect(MOTION_STORAGE_KEY).toBe("motion");
  });
});

describe("motion preference CSS / FOUC policy", () => {
  const css = readFileSync(join(import.meta.dir, "../../src/styles.css"), "utf8");
  const layout = readFileSync(join(import.meta.dir, "../../src/layouts/Layout.astro"), "utf8");

  test("OS reduce kill-switch excludes data-motion=full", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain('html:not([data-motion="full"])::view-transition-group(*)');
    expect(css).toContain(
      'html[data-motion="full"][data-page-transition="fade"]::view-transition-old(main-content)',
    );
  });

  test("FOUC resolves stored full vs OS reduce without writing storage", () => {
    expect(layout).toContain('localStorage.getItem("motion")');
    expect(layout).toContain('stored === "full"');
    expect(layout).toContain('root.setAttribute("data-motion", effective)');
    expect(layout).not.toContain('localStorage.setItem("motion"');
  });
});
