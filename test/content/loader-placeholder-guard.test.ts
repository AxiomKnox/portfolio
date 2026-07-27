import { describe, expect, test } from "bun:test";
import { profileLoader } from "@/content/loaders/profile";
import { projectsLoader } from "@/content/loaders/projects";

describe("loader soft guard against placeholder/", () => {
  test("projectsLoader rejects placeholder base", () => {
    expect(() => projectsLoader({ base: "src/content/placeholder/projects" })).toThrow(
      /must not load from placeholder/,
    );
  });

  test("profileLoader rejects placeholder base", () => {
    expect(() => profileLoader({ base: "src/content/placeholder/profile" })).toThrow(
      /must not load from placeholder/,
    );
  });

  test("default bases do not throw at construction", () => {
    expect(() => projectsLoader()).not.toThrow();
    expect(() => profileLoader()).not.toThrow();
  });
});
