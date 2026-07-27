import { describe, expect, test } from "bun:test";
import { isPreviewImage, PREVIEW_GRADIENT_IDS, resolvePreviewGradientId } from "@/lib/preview";

describe("isPreviewImage", () => {
  test("recognizes raster filenames", () => {
    expect(isPreviewImage("preview.png")).toBe(true);
    expect(isPreviewImage("preview.webp")).toBe(true);
  });

  test("rejects gradient tokens", () => {
    expect(isPreviewImage("grad-1")).toBe(false);
    expect(isPreviewImage("grad-avatar")).toBe(false);
  });
});

describe("resolvePreviewGradientId", () => {
  test("passes through registered ids", () => {
    for (const id of PREVIEW_GRADIENT_IDS) {
      expect(resolvePreviewGradientId(id)).toBe(id);
    }
  });

  test("falls back to grad-1 for unknown ids", () => {
    expect(resolvePreviewGradientId("grad-99")).toBe("grad-1");
    expect(resolvePreviewGradientId("")).toBe("grad-1");
  });
});
