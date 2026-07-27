import { describe, expect, test } from "bun:test";
import {
  createGitHubClient,
  isRateLimitResponse,
  parseRetryAfterMs,
  rateLimitWaitMs,
  SECONDARY_BACKOFF_FLOOR_MS,
} from "@/sync/github";

function response(
  status: number,
  headers: Record<string, string> = {},
  body: unknown = { message: "rate limited" },
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("isRateLimitResponse", () => {
  test("429 is always rate-limited", () => {
    expect(isRateLimitResponse(response(429))).toBe(true);
  });

  test("403 with remaining=0 is rate-limited", () => {
    expect(isRateLimitResponse(response(403, { "x-ratelimit-remaining": "0" }))).toBe(true);
  });

  test("403 with Retry-After is rate-limited (secondary)", () => {
    expect(isRateLimitResponse(response(403, { "retry-after": "60" }))).toBe(true);
  });

  test("403 permission denied without rate headers is not rate-limited", () => {
    expect(
      isRateLimitResponse(
        response(403, {}, { message: "Resource not accessible by personal access token" }),
      ),
    ).toBe(false);
  });

  test("500 is not rate-limited", () => {
    expect(isRateLimitResponse(response(500))).toBe(false);
  });
});

describe("parseRetryAfterMs / rateLimitWaitMs", () => {
  test("Retry-After seconds wins", () => {
    expect(parseRetryAfterMs("12")).toBe(12_000);
    const res = response(429, { "retry-after": "45", "x-ratelimit-remaining": "0" });
    expect(rateLimitWaitMs(res, 0, Date.now())).toBe(45_000);
  });

  test("primary exhaustion waits until x-ratelimit-reset (+1s)", () => {
    const nowMs = 1_000_000;
    const resetSec = Math.floor(nowMs / 1000) + 30;
    const res = response(403, {
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String(resetSec),
    });
    expect(rateLimitWaitMs(res, 0, nowMs)).toBe(30_000 + 1000);
  });

  test("secondary fallback is ≥60s then exponential", () => {
    const res = response(429);
    expect(rateLimitWaitMs(res, 0, Date.now())).toBe(SECONDARY_BACKOFF_FLOOR_MS);
    expect(rateLimitWaitMs(res, 1, Date.now())).toBe(SECONDARY_BACKOFF_FLOOR_MS * 2);
    expect(rateLimitWaitMs(res, 2, Date.now())).toBe(SECONDARY_BACKOFF_FLOOR_MS * 4);
  });
});

describe("createGitHubClient rate-limit backoff", () => {
  test("retries after primary 403 remaining=0, then succeeds", async () => {
    const sleeps: number[] = [];
    let calls = 0;
    const nowMs = 5_000_000;
    const resetSec = Math.floor(nowMs / 1000) + 10;

    const client = createGitHubClient({
      token: "test-token",
      now: () => nowMs,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return response(
            403,
            {
              "x-ratelimit-remaining": "0",
              "x-ratelimit-reset": String(resetSec),
            },
            { message: "API rate limit exceeded" },
          );
        }
        return response(200, {}, [{ name: "v1.0.0", commit: { sha: "abc" } }]);
      },
    });

    const tags = await client.listAllTags({
      owner: "acme",
      repo: "atlas",
      source: "project:atlas",
    });

    expect(tags).toEqual([{ name: "v1.0.0", commitSha: "abc" }]);
    expect(calls).toBe(2);
    expect(sleeps).toEqual([10_000 + 1000]);
  });

  test("honors Retry-After on 429 before retry", async () => {
    const sleeps: number[] = [];
    let calls = 0;

    const client = createGitHubClient({
      token: "test-token",
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return response(429, { "retry-after": "3" }, { message: "secondary rate limit" });
        }
        return new Response("file-bytes", { status: 200 });
      },
    });

    const bytes = await client.getRawContents({
      owner: "acme",
      repo: "atlas",
      path: "project.md",
      source: "project:atlas",
    });

    expect(bytes).not.toBeNull();
    expect(new TextDecoder().decode(bytes!)).toBe("file-bytes");
    expect(calls).toBe(2);
    expect(sleeps).toEqual([3000]);
  });

  test("does not retry ordinary 403 permission errors", async () => {
    let calls = 0;
    const sleeps: number[] = [];

    const client = createGitHubClient({
      token: "test-token",
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        return response(403, {}, { message: "Resource not accessible by personal access token" });
      },
    });

    await expect(
      client.getRawContents({
        owner: "acme",
        repo: "private",
        path: "project.md",
        source: "project:x",
      }),
    ).rejects.toThrow(/GitHub API 403/);

    expect(calls).toBe(1);
    expect(sleeps).toEqual([]);
  });

  test("exhausts retries then fails closed on persistent rate limit", async () => {
    let calls = 0;
    const sleeps: number[] = [];

    const client = createGitHubClient({
      token: "test-token",
      maxRateLimitRetries: 2,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        return response(429, { "retry-after": "1" }, { message: "still limited" });
      },
    });

    await expect(
      client.listAllTags({
        owner: "acme",
        repo: "atlas",
        source: "project:atlas",
      }),
    ).rejects.toThrow(/GitHub API 429/);

    // initial + 2 retries
    expect(calls).toBe(3);
    expect(sleeps).toEqual([1000, 1000]);
  });
});
