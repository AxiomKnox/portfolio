import { describe, expect, test } from "bun:test";
import { absoluteUrl, canonicalUrl } from "@/lib/site";

describe("site urls", () => {
  test("absoluteUrl joins site origin with base-prefixed path", () => {
    const href = absoluteUrl("/about", "https://username.github.io");
    expect(href.startsWith("https://username.github.io")).toBe(true);
    expect(href.endsWith("/about") || href.includes("/about")).toBe(true);
  });

  test("canonicalUrl does not double-prefix an already-based pathname", () => {
    const href = canonicalUrl("/repo-name/about", "https://username.github.io");
    expect(href).toBe("https://username.github.io/repo-name/about");
  });
});
