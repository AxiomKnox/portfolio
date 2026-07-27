import { describe, expect, test } from "bun:test";
import { resolveGitMeta, synthesizeGitMeta } from "@/content/assemble/git-meta";
import { assembleProject } from "@/content/assemble/project";

const baseFm = {
  id: "atlas-deploy",
  title: "Atlas Deploy",
  summary: "A pipeline",
  category: "devops" as const,
  type: "Deployment platform",
  status: "prod" as const,
  techStack: ["Go"],
  preview: "grad-1",
  associated: ["ember-portfolio"],
  links: { github: "https://github.com/example/atlas-deploy" },
  featured: true,
};

describe("resolveGitMeta", () => {
  test("synthesizes unreleased when sidecar missing", () => {
    const now = new Date("2026-07-25T12:00:00.000Z");
    expect(resolveGitMeta(undefined, now)).toEqual({
      version: "unreleased",
      releaseDate: "2026-07-25T12:00:00.000Z",
    });
  });

  test("parses exact sidecar and coerces date", () => {
    const meta = resolveGitMeta({ version: "v1.4.0", releaseDate: "2025-11-02" });
    expect(meta.version).toBe("v1.4.0");
    expect(meta.releaseDate).toBe(new Date("2025-11-02").toISOString());
  });

  test("fails closed on extra keys", () => {
    expect(() => resolveGitMeta({ version: "v1", releaseDate: "2025-11-02", tag: "x" })).toThrow();
  });

  test("synthesizeGitMeta uses unreleased", () => {
    expect(synthesizeGitMeta(new Date("2026-01-01T00:00:00.000Z")).version).toBe("unreleased");
  });
});

describe("assembleProject", () => {
  test("merges frontmatter body architecture and git-meta", () => {
    const project = assembleProject({
      folderId: "atlas-deploy",
      frontmatter: baseFm,
      body: "\nHello **world**\n",
      gitMetaRaw: { version: "v1.4.0", releaseDate: "2025-11-02" },
      architectureRaw: {
        nodes: [{ id: "s1", label: "git", x: 0, y: 0 }],
        edges: [],
        steps: [{ id: "s1", title: "git", detail: "push" }],
      },
      hasPreviewPng: false,
      hasPreviewWebp: false,
    });

    expect(project.id).toBe("atlas-deploy");
    expect(project.description).toBe("Hello **world**");
    expect(project.version).toBe("v1.4.0");
    expect(project.architecture?.nodes).toHaveLength(1);
    expect(project.featured).toBe(true);
  });

  test("defaults optional FM fields and synthesizes missing git-meta", () => {
    const now = new Date("2026-07-25T15:00:00.000Z");
    const project = assembleProject({
      folderId: "signal-forge",
      frontmatter: {
        id: "signal-forge",
        title: "Signal Forge",
        summary: "obs",
        category: "devops",
        type: "side-car",
        status: "dev",
        techStack: ["Rust"],
      },
      body: "body",
      hasPreviewPng: false,
      hasPreviewWebp: false,
      now,
    });

    expect(project.links).toEqual({});
    expect(project.associated).toEqual([]);
    expect(project.preview).toBe("grad-1");
    expect(project.version).toBe("unreleased");
    expect(project.releaseDate).toBe("2026-07-25T15:00:00.000Z");
    expect(project.architecture).toBeUndefined();
  });

  test("fails when folder id mismatches frontmatter", () => {
    expect(() =>
      assembleProject({
        folderId: "wrong",
        frontmatter: baseFm,
        body: "x",
        hasPreviewPng: false,
        hasPreviewWebp: false,
      }),
    ).toThrow(/id mismatch/);
  });

  test("fails when both preview images exist", () => {
    expect(() =>
      assembleProject({
        folderId: "atlas-deploy",
        frontmatter: baseFm,
        body: "x",
        hasPreviewPng: true,
        hasPreviewWebp: true,
      }),
    ).toThrow(/both preview/);
  });

  test("preview image filename wins over frontmatter token", () => {
    const withPng = assembleProject({
      folderId: "atlas-deploy",
      frontmatter: baseFm,
      body: "x",
      hasPreviewPng: true,
      hasPreviewWebp: false,
    });
    expect(withPng.preview).toBe("preview.png");

    const withWebp = assembleProject({
      folderId: "atlas-deploy",
      frontmatter: baseFm,
      body: "x",
      hasPreviewPng: false,
      hasPreviewWebp: true,
    });
    expect(withWebp.preview).toBe("preview.webp");
  });
});
