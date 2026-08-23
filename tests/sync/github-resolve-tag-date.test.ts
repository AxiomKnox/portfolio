import { describe, expect, test } from "bun:test";
import { createGitHubClient } from "@/sync/github";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("resolveTagDate", () => {
  test("annotated tag uses target commit committer.date, not tagger.date", async () => {
    const tagSha = "tagobj111";
    const commitSha = "commit222";
    const urls: string[] = [];

    const client = createGitHubClient({
      token: "test-token",
      fetchImpl: async (input) => {
        const url = String(input);
        urls.push(url);

        if (url.includes("/git/ref/tags/v1.0.0")) {
          return jsonResponse({
            object: { type: "tag", sha: tagSha },
          });
        }
        if (url.includes(`/git/tags/${tagSha}`)) {
          return jsonResponse({
            tagger: { date: "2026-07-25T15:29:23Z" },
            object: { type: "commit", sha: commitSha },
          });
        }
        if (url.includes(`/commits/${commitSha}`)) {
          return jsonResponse({
            commit: {
              author: { date: "2023-10-25T16:40:18Z" },
              committer: { date: "2023-10-25T16:40:18Z" },
            },
          });
        }
        return jsonResponse({ message: `unexpected URL ${url}` }, 500);
      },
    });

    const date = await client.resolveTagDate({
      owner: "acme",
      repo: "atlas",
      tag: "v1.0.0",
      source: "project:atlas-deploy",
    });

    expect(date).toBe("2023-10-25T16:40:18Z");
    expect(urls.some((u) => u.includes(`/git/tags/${tagSha}`))).toBe(true);
    expect(urls.some((u) => u.includes(`/commits/${commitSha}`))).toBe(true);
  });

  test("lightweight tag uses target commit committer.date (not author.date)", async () => {
    const commitSha = "light333";
    const urls: string[] = [];

    const client = createGitHubClient({
      token: "test-token",
      fetchImpl: async (input) => {
        const url = String(input);
        urls.push(url);

        if (url.includes("/git/ref/tags/v0.2.0")) {
          return jsonResponse({
            object: { type: "commit", sha: commitSha },
          });
        }
        if (url.includes(`/commits/${commitSha}`)) {
          return jsonResponse({
            commit: {
              author: { date: "2023-12-01T08:00:00Z" },
              committer: { date: "2024-01-15T12:00:00Z" },
            },
          });
        }
        return jsonResponse({ message: `unexpected URL ${url}` }, 500);
      },
    });

    const date = await client.resolveTagDate({
      owner: "acme",
      repo: "atlas",
      tag: "v0.2.0",
      source: "project:atlas-deploy",
    });

    expect(date).toBe("2024-01-15T12:00:00Z");
    expect(urls.some((u) => u.includes("/git/tags/"))).toBe(false);
    expect(urls.some((u) => u.includes(`/commits/${commitSha}`))).toBe(true);
  });

  test("lightweight and annotated tags pointing at the same commit yield the same date", async () => {
    const commitSha = "shared444";
    const tagSha = "annottag555";
    const commitDate = "2022-06-01T09:30:00Z";

    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/git/ref/tags/v-light")) {
        return jsonResponse({ object: { type: "commit", sha: commitSha } });
      }
      if (url.includes("/git/ref/tags/v-anno")) {
        return jsonResponse({ object: { type: "tag", sha: tagSha } });
      }
      if (url.includes(`/git/tags/${tagSha}`)) {
        return jsonResponse({
          tagger: { date: "2026-01-01T00:00:00Z" },
          object: { type: "commit", sha: commitSha },
        });
      }
      if (url.includes(`/commits/${commitSha}`)) {
        return jsonResponse({
          commit: {
            author: { date: "2022-05-01T00:00:00Z" },
            committer: { date: commitDate },
          },
        });
      }
      return jsonResponse({ message: `unexpected URL ${url}` }, 500);
    };

    const client = createGitHubClient({ token: "test-token", fetchImpl });
    const params = {
      owner: "acme",
      repo: "atlas",
      source: "project:atlas-deploy",
    };

    const light = await client.resolveTagDate({ ...params, tag: "v-light" });
    const anno = await client.resolveTagDate({ ...params, tag: "v-anno" });
    expect(light).toBe(commitDate);
    expect(anno).toBe(commitDate);
    expect(light).toBe(anno);
  });
});
