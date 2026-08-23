import { describe, expect, test } from "bun:test";
import {
  starsAnimationPolicy,
  starsDevicePixelRatio,
  starsParticleCount,
} from "@/lib/ambient-stars-policy";

describe("starsAnimationPolicy", () => {
  test("idles when tab is hidden", () => {
    expect(
      starsAnimationPolicy({
        isDark: true,
        mode: "stars",
        reducedMotion: false,
        tabHidden: true,
      }),
    ).toBe("idle");
  });

  test("idles when ambient is not dark stars", () => {
    expect(
      starsAnimationPolicy({
        isDark: true,
        mode: "off",
        reducedMotion: false,
        tabHidden: false,
      }),
    ).toBe("idle");
    expect(
      starsAnimationPolicy({
        isDark: true,
        mode: "glow",
        reducedMotion: false,
        tabHidden: false,
      }),
    ).toBe("idle");
    expect(
      starsAnimationPolicy({
        isDark: false,
        mode: "stars",
        reducedMotion: false,
        tabHidden: false,
      }),
    ).toBe("idle");
  });

  test("draws a static frame under reduced motion", () => {
    expect(
      starsAnimationPolicy({
        isDark: true,
        mode: "stars",
        reducedMotion: true,
        tabHidden: false,
      }),
    ).toBe("static");
  });

  test("animates only for visible dark stars with full motion", () => {
    expect(
      starsAnimationPolicy({
        isDark: true,
        mode: "stars",
        reducedMotion: false,
        tabHidden: false,
      }),
    ).toBe("animate");
  });
});

describe("starsParticleCount", () => {
  test("returns 0 for empty canvas", () => {
    expect(starsParticleCount({ width: 0, height: 800, narrowViewport: false })).toBe(0);
  });

  test("keeps mobile budgets well below desktop caps", () => {
    const mobile = starsParticleCount({ width: 390, height: 844, narrowViewport: true });
    const desktop = starsParticleCount({ width: 1440, height: 900, narrowViewport: false });
    expect(mobile).toBeLessThanOrEqual(90);
    expect(desktop).toBeLessThanOrEqual(140);
    expect(mobile).toBeLessThan(desktop);
  });
});

describe("starsDevicePixelRatio", () => {
  test("caps mobile at 1× and desktop at 1.5×", () => {
    expect(starsDevicePixelRatio({ devicePixelRatio: 3, narrowViewport: true })).toBe(1);
    expect(starsDevicePixelRatio({ devicePixelRatio: 3, narrowViewport: false })).toBe(1.5);
    expect(starsDevicePixelRatio({ devicePixelRatio: 1, narrowViewport: false })).toBe(1);
  });
});
