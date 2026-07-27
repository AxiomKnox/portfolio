import { describe, expect, test } from "bun:test";
import type { Project } from "@/content/types";
import { selectHomepageProjects } from "@/content/homepage-projects";

function project(partial: Partial<Project> & Pick<Project, "id" | "title">): Project {
  return {
    summary: partial.summary ?? "summary",
    description: partial.description ?? "description",
    category: partial.category ?? "web",
    type: partial.type ?? "app",
    status: partial.status ?? "prod",
    version: partial.version ?? "1.0.0",
    releaseDate: partial.releaseDate ?? "2024-06-01",
    techStack: partial.techStack ?? ["React"],
    links: partial.links ?? {},
    preview: partial.preview ?? "grad-1",
    associated: partial.associated ?? [],
    ...partial,
  };
}

describe("selectHomepageProjects", () => {
  const catalog = [
    project({ id: "a", title: "A", releaseDate: "2024-01-01" }),
    project({ id: "b", title: "B", releaseDate: "2025-06-01", featured: true }),
    project({ id: "c", title: "C", releaseDate: "2025-01-01" }),
    project({ id: "d", title: "D", releaseDate: "2023-01-01", featured: true }),
    project({ id: "e", title: "E", releaseDate: "2025-03-01", featured: false }),
  ];

  test("falls back to 3 most recent when none are featured", () => {
    const none = catalog.map(({ featured: _f, ...rest }) => project(rest));
    expect(selectHomepageProjects(none).map((p) => p.id)).toEqual(["b", "e", "c"]);
  });

  test("puts featured first then fills remaining slots by recency", () => {
    expect(selectHomepageProjects(catalog).map((p) => p.id)).toEqual(["b", "d", "e"]);
  });

  test("caps at most recent featured when more than limit are starred", () => {
    const many = [
      project({ id: "f1", title: "F1", releaseDate: "2025-01-01", featured: true }),
      project({ id: "f2", title: "F2", releaseDate: "2025-06-01", featured: true }),
      project({ id: "f3", title: "F3", releaseDate: "2024-01-01", featured: true }),
      project({ id: "f4", title: "F4", releaseDate: "2025-09-01", featured: true }),
      project({ id: "n1", title: "N1", releaseDate: "2026-01-01" }),
    ];
    expect(selectHomepageProjects(many).map((p) => p.id)).toEqual(["f4", "f2", "f1"]);
  });

  test("returns fewer than limit when the catalog is small", () => {
    const few = [
      project({ id: "only", title: "Only", releaseDate: "2025-01-01", featured: true }),
    ];
    expect(selectHomepageProjects(few).map((p) => p.id)).toEqual(["only"]);
  });

  test("treats featured undefined/false as non-featured", () => {
    const mixed = [
      project({ id: "u", title: "U", releaseDate: "2025-02-01" }),
      project({ id: "f", title: "F", releaseDate: "2024-01-01", featured: true }),
      project({ id: "n", title: "N", releaseDate: "2025-01-01", featured: false }),
    ];
    expect(selectHomepageProjects(mixed).map((p) => p.id)).toEqual(["f", "u", "n"]);
  });

  test("respects custom limit and empty inputs", () => {
    expect(selectHomepageProjects(catalog, 2).map((p) => p.id)).toEqual(["b", "d"]);
    expect(selectHomepageProjects([], 3)).toEqual([]);
    expect(selectHomepageProjects(catalog, 0)).toEqual([]);
  });
});
