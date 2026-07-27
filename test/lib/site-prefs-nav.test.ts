import { describe, expect, test } from "bun:test";
import { isNavActive } from "@/lib/site-prefs-client";

describe("isNavActive", () => {
  test("home is exact only", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/", "/projects")).toBe(false);
  });

  test("projects matches index and detail", () => {
    expect(isNavActive("/projects", "/projects")).toBe(true);
    expect(isNavActive("/projects", "/projects/atlas-deploy")).toBe(true);
    expect(isNavActive("/projects", "/about")).toBe(false);
  });

  test("about is exact", () => {
    expect(isNavActive("/about", "/about")).toBe(true);
    expect(isNavActive("/about", "/projects")).toBe(false);
  });
});
