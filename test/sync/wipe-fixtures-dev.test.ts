import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeFixtures, parseDevSyncConfig } from "@/sync/fixtures";
import { runSync } from "@/sync/run";
import { runDevSync } from "@/sync/run-dev";
import { wipeLiveContentRoots } from "@/sync/wipe";

const projectMd = (id: string, title: string) => `---
id: ${id}
title: ${title}
summary: s
category: web
type: t
status: dev
techStack: []
preview: grad-1
---

body
`;

async function seedPlaceholder(root: string): Promise<void> {
  const ph = join(root, "src/content/placeholder");
  await mkdir(join(ph, "profile"), { recursive: true });
  await writeFile(join(ph, "profile", "profile.md"), "---\nfullName: Fixture Person\n---\n");
  await mkdir(join(ph, "projects", "atlas-deploy"), { recursive: true });
  await writeFile(
    join(ph, "projects", "atlas-deploy", "project.md"),
    projectMd("atlas-deploy", "Fixture Atlas"),
  );
  await mkdir(join(ph, "projects", "tessera"), { recursive: true });
  await writeFile(
    join(ph, "projects", "tessera", "project.md"),
    projectMd("tessera", "Fixture Tessera"),
  );
}

const fixtureConfig = {
  profile: { path: "profile" },
  projects: [
    { id: "atlas-deploy", path: "projects/atlas-deploy" },
    { id: "tessera", path: "projects/tessera" },
  ],
};

describe("parseDevSyncConfig", () => {
  test("accepts fixture catalog and normalizes paths", () => {
    const cfg = parseDevSyncConfig({
      profile: { path: "/profile/" },
      projects: [{ id: "atlas-deploy", path: "/projects/atlas-deploy/" }],
    });
    expect(cfg.profile.path).toBe("profile");
    expect(cfg.projects[0]?.path).toBe("projects/atlas-deploy");
  });

  test("fails closed on duplicate fixture ids", () => {
    expect(() =>
      parseDevSyncConfig({
        profile: { path: "profile" },
        projects: [
          { id: "atlas-deploy", path: "projects/atlas-deploy" },
          { id: "atlas-deploy", path: "projects/other" },
        ],
      }),
    ).toThrow(/duplicate project id/);
  });
});

describe("wipeLiveContentRoots", () => {
  test("clears live projects/profile but not placeholder", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-wipe-"));
    try {
      await seedPlaceholder(root);
      await mkdir(join(root, "src/content/projects/stale"), { recursive: true });
      await writeFile(join(root, "src/content/projects/stale/project.md"), "x");
      await mkdir(join(root, "src/content/profile"), { recursive: true });
      await writeFile(join(root, "src/content/profile/profile.md"), "old");

      await wipeLiveContentRoots(root);

      await expect(readFile(join(root, "src/content/projects/stale/project.md"))).rejects.toThrow();
      await expect(readFile(join(root, "src/content/profile/profile.md"))).rejects.toThrow();
      const kept = await readFile(join(root, "src/content/placeholder/profile/profile.md"), "utf8");
      expect(kept).toContain("Fixture Person");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("materializeFixtures", () => {
  test("copies placeholder trees into live roots", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-mat-"));
    try {
      await seedPlaceholder(root);
      await wipeLiveContentRoots(root);
      const result = await materializeFixtures({
        repoRoot: root,
        config: parseDevSyncConfig(fixtureConfig),
      });
      expect(result.copiedRoots).toBe(3);
      const profile = await readFile(join(root, "src/content/profile/profile.md"), "utf8");
      expect(profile).toContain("Fixture Person");
      const atlas = await readFile(
        join(root, "src/content/projects/atlas-deploy/project.md"),
        "utf8",
      );
      expect(atlas).toContain("Fixture Atlas");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("runDevSync modes", () => {
  test("sync:dev materializes fixtures without calling fetch", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-"));
    try {
      await seedPlaceholder(root);
      await mkdir(join(root, "src/content/projects/stale"), { recursive: true });
      await writeFile(join(root, "src/content/projects/stale/x.md"), "stale");

      const result = await runDevSync({
        mode: "dev",
        fixtureConfig,
        repoRoot: root,
        fetchImpl: async () => {
          throw new Error("fetch must not be called in sync:dev");
        },
      });

      expect(result.mode).toBe("dev");
      expect(result.remoteFileCount).toBe(0);
      await expect(readFile(join(root, "src/content/projects/stale/x.md"))).rejects.toThrow();
      const atlas = await readFile(
        join(root, "src/content/projects/atlas-deploy/project.md"),
        "utf8",
      );
      expect(atlas).toContain("Fixture Atlas");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("sync:dev:all warns without token then fail-closes when remotes exist", async () => {
    const warnings: string[] = [];
    await expect(
      runDevSync({
        mode: "dev:all",
        fixtureConfig,
        prodConfig: {
          projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
        },
        token: "",
        dryRun: true,
        warn: (m) => warnings.push(m),
      }),
    ).rejects.toThrow(/GITHUB_TOKEN is required/);
    expect(warnings.some((w) => /GITHUB_TOKEN is not set/.test(w))).toBe(true);
  });

  test("sync:dev:all remote wins over fixture for same id", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-devall-"));
    try {
      await seedPlaceholder(root);
      const remoteMd = projectMd("atlas-deploy", "Remote Atlas");
      const remoteProfile = "---\nfullName: Remote Person\n---\n";

      const result = await runDevSync({
        mode: "dev:all",
        fixtureConfig,
        prodConfig: {
          profile: { owner: "acme", repo: "personal", path: "profile" },
          projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
        },
        token: "fake-token",
        repoRoot: root,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url.includes("/repos/acme/personal/") && url.includes("/contents/profile/profile.md")) {
            return new Response(remoteProfile, { status: 200 });
          }
          if (url.includes("/repos/acme/personal/")) {
            // Optional profile sidecars absent.
            return new Response(JSON.stringify({ message: "Not Found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (url.includes("/contents/project.md")) {
            return new Response(remoteMd, { status: 200 });
          }
          if (url.includes("/tags?")) {
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ message: "Not Found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        },
      });

      expect(result.mode).toBe("dev:all");
      expect(result.remoteFileCount).toBeGreaterThan(0);

      const atlas = await readFile(
        join(root, "src/content/projects/atlas-deploy/project.md"),
        "utf8",
      );
      expect(atlas).toContain("Remote Atlas");
      expect(atlas).not.toContain("Fixture Atlas");

      // Fixture-only id remains from materialize.
      const tessera = await readFile(join(root, "src/content/projects/tessera/project.md"), "utf8");
      expect(tessera).toContain("Fixture Tessera");

      // Prod profile remote overwrites fixture profile.
      const profile = await readFile(join(root, "src/content/profile/profile.md"), "utf8");
      expect(profile).toContain("Remote Person");
      expect(profile).not.toContain("Fixture Person");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("sync:dev:all keeps fixture profile when prod profile is omitted", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-devall-noprof-"));
    try {
      await seedPlaceholder(root);
      const remoteMd = projectMd("atlas-deploy", "Remote Atlas");

      await runDevSync({
        mode: "dev:all",
        fixtureConfig,
        prodConfig: {
          projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
        },
        token: "fake-token",
        repoRoot: root,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url.includes("/repos/acme/personal/")) {
            throw new Error(`prod profile must not be fetched when omitted: ${url}`);
          }
          if (url.includes("/contents/project.md")) {
            return new Response(remoteMd, { status: 200 });
          }
          if (url.includes("/tags?")) {
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ message: "Not Found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        },
      });

      const profile = await readFile(join(root, "src/content/profile/profile.md"), "utf8");
      expect(profile).toContain("Fixture Person");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("prod runSync wipe", () => {
  test("wipes live roots before applying plan (never reads placeholder)", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-prod-"));
    try {
      await seedPlaceholder(root);
      await mkdir(join(root, "src/content/projects/stale"), { recursive: true });
      await writeFile(join(root, "src/content/projects/stale/project.md"), "stale");
      await mkdir(join(root, "src/content/profile"), { recursive: true });
      await writeFile(join(root, "src/content/profile/profile.md"), "old-profile");

      const remoteMd = projectMd("atlas-deploy", "Prod Atlas");
      await runSync({
        config: {
          projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
        },
        token: "fake-token",
        repoRoot: root,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url.includes("/contents/project.md")) {
            return new Response(remoteMd, { status: 200 });
          }
          if (url.includes("/tags?")) {
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ message: "Not Found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        },
      });

      await expect(readFile(join(root, "src/content/projects/stale/project.md"))).rejects.toThrow();
      // Profile wiped and not re-fetched (no profile remote).
      await expect(readFile(join(root, "src/content/profile/profile.md"))).rejects.toThrow();
      const atlas = await readFile(
        join(root, "src/content/projects/atlas-deploy/project.md"),
        "utf8",
      );
      expect(atlas).toContain("Prod Atlas");
      // Placeholder untouched.
      const ph = await readFile(
        join(root, "src/content/placeholder/projects/atlas-deploy/project.md"),
        "utf8",
      );
      expect(ph).toContain("Fixture Atlas");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
