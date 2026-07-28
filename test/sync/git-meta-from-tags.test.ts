import { describe, expect, test } from "bun:test";
import { gitMetaFromTags } from "@/sync/git-meta-from-tags";
import type { GitHubClient } from "@/sync/github";

function mockClient(partial: Partial<GitHubClient>): GitHubClient {
  return {
    getRawContents: async () => null,
    listContents: async () => null,
    listAllTags: async () => [],
    resolveTagDate: async () => "2025-11-02T00:00:00Z",
    ...partial,
  };
}

describe("gitMetaFromTags", () => {
  test("zero tags → unreleased placeholder", async () => {
    const now = new Date("2026-07-25T12:00:00.000Z");
    const meta = await gitMetaFromTags({
      client: mockClient({ listAllTags: async () => [] }),
      owner: "acme",
      repo: "atlas",
      source: "project:atlas-deploy",
      now,
    });
    expect(meta).toEqual({
      version: "unreleased",
      releaseDate: "2026-07-25T12:00:00.000Z",
    });
  });

  test("picks max semver and resolves date for winner only", async () => {
    const resolved: string[] = [];
    const meta = await gitMetaFromTags({
      client: mockClient({
        listAllTags: async () => [
          { name: "v1.0.0", commitSha: "a" },
          { name: "v1.4.0", commitSha: "b" },
          { name: "latest", commitSha: "c" },
        ],
        resolveTagDate: async ({ tag }) => {
          resolved.push(tag);
          return "2025-11-02T15:30:00Z";
        },
      }),
      owner: "acme",
      repo: "atlas",
      source: "project:atlas-deploy",
    });
    expect(meta.version).toBe("v1.4.0");
    expect(meta.releaseDate).toBe(new Date("2025-11-02T15:30:00Z").toISOString());
    expect(resolved).toEqual(["v1.4.0"]);
  });

  test("writes commit date from resolveTagDate (not sync-now) for chosen tag", async () => {
    const meta = await gitMetaFromTags({
      client: mockClient({
        listAllTags: async () => [{ name: "v1.0.0", commitSha: "a5cf" }],
        // Target commit committer.date (light or peeled annotated); not tagger/sync-now.
        resolveTagDate: async () => "2023-10-25T16:40:18Z",
      }),
      owner: "acme",
      repo: "atlas",
      source: "project:atlas-deploy",
      now: new Date("2026-07-25T15:29:23.000Z"),
    });
    expect(meta).toEqual({
      version: "v1.0.0",
      releaseDate: "2023-10-25T16:40:18.000Z",
    });
  });

  test("fails closed when tags exist but none are semver", async () => {
    await expect(
      gitMetaFromTags({
        client: mockClient({
          listAllTags: async () => [
            { name: "latest", commitSha: "a" },
            { name: "prod", commitSha: "b" },
          ],
        }),
        owner: "acme",
        repo: "atlas",
        source: "project:atlas-deploy",
      }),
    ).rejects.toThrow(/none are semver-parseable/);
  });
});
