import { describe, expect, test } from "bun:test";
import { compareSemver, parseSemver, pickMaxSemverTag } from "@/sync/semver";

describe("parseSemver", () => {
  test("accepts optional leading v", () => {
    expect(parseSemver("v1.2.3")?.major).toBe(1);
    expect(parseSemver("1.2.3")?.patch).toBe(3);
  });

  test("rejects non-semver tag names", () => {
    expect(parseSemver("latest")).toBeNull();
    expect(parseSemver("release-2024")).toBeNull();
    expect(parseSemver("")).toBeNull();
  });
});

describe("pickMaxSemverTag", () => {
  test("picks max semver regardless of list order", () => {
    expect(pickMaxSemverTag(["v1.0.0", "v2.1.0", "v2.0.9"])).toBe("v2.1.0");
    expect(pickMaxSemverTag(["v2.1.0", "v1.0.0", "v2.0.9"])).toBe("v2.1.0");
  });

  test("keeps original tag string (pass-through v)", () => {
    expect(pickMaxSemverTag(["1.4.0", "v1.5.0"])).toBe("v1.5.0");
  });

  test("release beats prerelease of same core", () => {
    expect(pickMaxSemverTag(["v1.0.0-beta.2", "v1.0.0"])).toBe("v1.0.0");
  });

  test("returns null when none parseable", () => {
    expect(pickMaxSemverTag(["latest", "prod"])).toBeNull();
  });

  test("ignores non-semver among mixed tags", () => {
    expect(pickMaxSemverTag(["latest", "v0.9.1", "nightly"])).toBe("v0.9.1");
  });
});

describe("compareSemver", () => {
  test("orders major.minor.patch", () => {
    const a = parseSemver("v1.2.3")!;
    const b = parseSemver("v1.3.0")!;
    expect(compareSemver(b, a)).toBeGreaterThan(0);
  });
});
