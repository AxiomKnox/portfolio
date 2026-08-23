import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseSyncConfig } from "@/sync/config";
import { createGitHubClient } from "@/sync/github";
import { buildSyncPlan, planProjectSync } from "@/sync/plan";
import { runSync } from "@/sync/run";
import { applySyncPlan } from "@/sync/write";

const baseConfig = {
  profile: { owner: "acme", repo: "personal", path: "profile" },
  projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
};

const projectMd = `---
id: atlas-deploy
title: Atlas
summary: s
category: web
type: t
status: dev
techStack: []
preview: grad-1
---

body
`;

/** Mock fetch that serves a minimal project remote; profile URLs must never be hit in skip tests. */
function projectOnlyFetch(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);
  if (url.includes("/repos/acme/personal/")) {
    throw new Error(`profile remote must not be fetched: ${url}`);
  }
  if (url.includes("/contents/project.md")) {
    return Promise.resolve(new Response(projectMd, { status: 200 }));
  }
  if (url.includes("/tags?")) {
    return Promise.resolve(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
  // optional files + dir listings
  return Promise.resolve(
    new Response(JSON.stringify({ message: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("runSync fail-closed", () => {
  test("missing GITHUB_TOKEN fails before any fetch", async () => {
    const prev = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    try {
      await expect(
        runSync({
          config: baseConfig,
          token: "",
          fetchImpl: async () => {
            throw new Error("fetch should not be called");
          },
        }),
      ).rejects.toThrow(/GITHUB_TOKEN is required/);
    } finally {
      if (prev !== undefined) process.env.GITHUB_TOKEN = prev;
    }
  });

  test("TODO project remotes in config fail closed", async () => {
    await expect(
      runSync({
        config: {
          projects: [{ id: "atlas-deploy", owner: "TODO", repo: "TODO", path: "" }],
        },
        token: "fake-token",
        dryRun: true,
      }),
    ).rejects.toThrow(/TODO owner\/repo/);
  });

  test("GitHub API error names the source and aborts", async () => {
    await expect(
      runSync({
        config: baseConfig,
        token: "fake-token",
        dryRun: true,
        fetchImpl: async () =>
          new Response(JSON.stringify({ message: "Bad credentials" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
      }),
    ).rejects.toThrow(/profile \(acme\/personal\).*401/);
  });
});

describe("optional profile sync", () => {
  test("TODO profile + real project plans project only", async () => {
    const config = parseSyncConfig({
      profile: { owner: "TODO", repo: "TODO", path: "profile" },
      projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
    });
    expect(config.profile).toBeUndefined();

    const client = createGitHubClient({
      token: "t",
      fetchImpl: projectOnlyFetch,
    });
    const plan = await buildSyncPlan({ client, config });

    expect(plan.files.every((f) => !f.relativePath.startsWith("src/content/profile"))).toBe(true);
    expect(
      plan.files.some((f) => f.relativePath.includes("projects/atlas-deploy/project.md")),
    ).toBe(true);
    expect(plan.deleteIfPresent.every((p) => !p.startsWith("src/content/profile"))).toBe(true);
  });

  test("absent profile + real project dry-run succeeds without touching profile", async () => {
    const result = await runSync({
      config: {
        projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
      },
      token: "fake-token",
      dryRun: true,
      fetchImpl: projectOnlyFetch,
    });
    expect(result.fileCount).toBeGreaterThan(0);
  });
});

describe("planProjectSync id mismatch", () => {
  test("fails when frontmatter id ≠ config id", async () => {
    const client = createGitHubClient({
      token: "t",
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("/contents/project.md")) {
          return new Response(
            `---\nid: other-id\ntitle: X\nsummary: s\ncategory: web\ntype: t\nstatus: dev\ntechStack: []\npreview: grad-1\n---\n\nbody\n`,
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ message: "Not Found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      },
    });

    await expect(
      planProjectSync({
        client,
        project: { id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" },
      }),
    ).rejects.toThrow(/does not match project.md frontmatter id/);
  });
});

describe("applySyncPlan", () => {
  test("writes planned files under repo root", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-sync-"));
    try {
      await applySyncPlan({
        repoRoot: root,
        plan: {
          files: [
            {
              relativePath: "src/content/projects/atlas-deploy/git-meta.json",
              bytes: new TextEncoder().encode(
                '{"version":"v1.0.0","releaseDate":"2025-01-01T00:00:00.000Z"}\n',
              ),
            },
          ],
          deleteIfPresent: [],
        },
      });
      const written = await readFile(
        join(root, "src/content/projects/atlas-deploy/git-meta.json"),
        "utf8",
      );
      expect(written).toContain("v1.0.0");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("removes stale optional paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-sync-del-"));
    try {
      const stale = join(root, "src/content/projects/atlas-deploy/architecture.json");
      await mkdir(join(root, "src/content/projects/atlas-deploy"), { recursive: true });
      await writeFile(stale, "{}");
      await applySyncPlan({
        repoRoot: root,
        plan: {
          files: [
            {
              relativePath: "src/content/projects/atlas-deploy/project.md",
              bytes: new TextEncoder().encode("x"),
            },
          ],
          deleteIfPresent: ["src/content/projects/atlas-deploy/architecture.json"],
        },
      });
      await expect(readFile(stale)).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
