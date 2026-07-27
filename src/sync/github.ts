/**
 * Bun `fetch` + GitHub REST helpers (PROG-76).
 * No git/gh dependency.
 *
 * Rate-limit policy (PROG-62 / PROG-76 header contract):
 * - Detect: 429, or 403 with x-ratelimit-remaining=0, or 403/429 with Retry-After.
 * - Wait: prefer Retry-After; else wait until x-ratelimit-reset (+1s);
 *   else secondary fallback ≥60s with exponential backoff.
 * - Cap retries, then return the limited response so callers fail-closed.
 */

export const GITHUB_API_VERSION = "2022-11-28";
export const GITHUB_USER_AGENT = "portfolio-content-sync";

/** Default retries after the first rate-limited response. */
export const DEFAULT_RATE_LIMIT_RETRIES = 5;
/** Floor for secondary-limit backoff when headers do not specify a wait. */
export const SECONDARY_BACKOFF_FLOOR_MS = 60_000;
/** Cap a single sleep so a bad/stale reset header cannot hang forever. */
export const MAX_RATE_LIMIT_WAIT_MS = 3_600_000;

/** Injectable fetch for tests — callable shape only (DOM `fetch` extras like `preconnect` not required). */
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type GitHubClientOptions = {
  token: string;
  fetchImpl?: FetchLike;
  apiBase?: string;
  /** Injectable clock (ms since epoch). Tests only. */
  now?: () => number;
  /** Injectable sleeper. Tests only. */
  sleep?: (ms: number) => Promise<void>;
  /** Extra attempts after a rate-limited response (default 5). */
  maxRateLimitRetries?: number;
};

export type GitHubError = Error & {
  status?: number;
  source?: string;
};

/** True when the response is a GitHub primary/secondary rate-limit hit. */
export function isRateLimitResponse(res: Response): boolean {
  if (res.status === 429) return true;
  if (res.status !== 403) return false;
  if (res.headers.get("x-ratelimit-remaining") === "0") return true;
  if (res.headers.has("retry-after")) return true;
  return false;
}

/**
 * Parse Retry-After as delay-seconds (GitHub's usual form).
 * HTTP-date form is ignored → fall through to other wait rules.
 */
export function parseRetryAfterMs(header: string | null): number | null {
  if (header == null || header.trim() === "") return null;
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.round(seconds * 1000);
}

/**
 * How long to wait before retrying a rate-limited call (PROG-76 §6).
 * `attempt` is 0-based among rate-limit waits (0 = first backoff).
 */
export function rateLimitWaitMs(res: Response, attempt: number, nowMs: number): number {
  const fromRetryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
  if (fromRetryAfter != null) {
    return Math.min(Math.max(fromRetryAfter, 0), MAX_RATE_LIMIT_WAIT_MS);
  }

  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  if (remaining === "0" && reset != null) {
    const resetSec = Number(reset);
    if (Number.isFinite(resetSec)) {
      // +1s buffer so we do not retry in the same second as reset.
      const untilReset = resetSec * 1000 - nowMs + 1000;
      return Math.min(Math.max(untilReset, 0), MAX_RATE_LIMIT_WAIT_MS);
    }
  }

  // Secondary / abuse: ≥1 minute, then exponential.
  const expo = SECONDARY_BACKOFF_FLOOR_MS * 2 ** Math.max(0, attempt);
  return Math.min(expo, MAX_RATE_LIMIT_WAIT_MS);
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createGitHubClient(options: GitHubClientOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiBase = (options.apiBase ?? "https://api.github.com").replace(/\/$/, "");
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  const maxRateLimitRetries = options.maxRateLimitRetries ?? DEFAULT_RATE_LIMIT_RETRIES;

  async function ghFetch(
    path: string,
    init: {
      accept?: string;
      source: string;
    },
  ): Promise<Response> {
    const url = path.startsWith("http") ? path : `${apiBase}${path}`;
    const headers = {
      Authorization: `Bearer ${options.token}`,
      Accept: init.accept ?? "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      "User-Agent": GITHUB_USER_AGENT,
    };

    let res = await fetchImpl(url, { headers });
    for (let attempt = 0; attempt < maxRateLimitRetries; attempt++) {
      if (!isRateLimitResponse(res)) return res;
      const waitMs = rateLimitWaitMs(res, attempt, now());
      // Drain body so the connection can close cleanly before retry.
      try {
        await res.arrayBuffer();
      } catch {
        /* ignore */
      }
      await sleep(waitMs);
      res = await fetchImpl(url, { headers });
    }
    return res;
  }

  function fail(source: string, status: number, detail: string): never {
    const err = new Error(`${source}: GitHub API ${status} — ${detail}`) as GitHubError;
    err.status = status;
    err.source = source;
    throw err;
  }

  async function readErrorDetail(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as { message?: string };
      return body.message ?? res.statusText;
    } catch {
      return res.statusText || "unknown error";
    }
  }

  /** Raw file bytes; 404 → null (optional files). Other errors → throw. */
  async function getRawContents(params: {
    owner: string;
    repo: string;
    path: string;
    ref?: string;
    source: string;
  }): Promise<Uint8Array | null> {
    const qs = params.ref ? `?ref=${encodeURIComponent(params.ref)}` : "";
    const encodedPath = params.path
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/");
    const res = await ghFetch(
      `/repos/${params.owner}/${params.repo}/contents/${encodedPath}${qs}`,
      {
        accept: "application/vnd.github.raw+json",
        source: params.source,
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      fail(params.source, res.status, await readErrorDetail(res));
    }
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Directory listing (JSON). 404 → null. */
  async function listContents(params: {
    owner: string;
    repo: string;
    path: string;
    ref?: string;
    source: string;
  }): Promise<Array<{ name: string; path: string; type: string }> | null> {
    const qs = params.ref ? `?ref=${encodeURIComponent(params.ref)}` : "";
    const encodedPath = params.path
      ? params.path
          .split("/")
          .map((p) => encodeURIComponent(p))
          .join("/")
      : "";
    const urlPath = encodedPath
      ? `/repos/${params.owner}/${params.repo}/contents/${encodedPath}${qs}`
      : `/repos/${params.owner}/${params.repo}/contents${qs}`;
    const res = await ghFetch(urlPath, {
      accept: "application/vnd.github+json",
      source: params.source,
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      fail(params.source, res.status, await readErrorDetail(res));
    }
    const body = (await res.json()) as unknown;
    if (!Array.isArray(body)) {
      fail(params.source, 500, "expected directory listing array from Contents API");
    }
    return body as Array<{ name: string; path: string; type: string }>;
  }

  /** Paginate repository tags (name + commit sha). */
  async function listAllTags(params: {
    owner: string;
    repo: string;
    source: string;
  }): Promise<Array<{ name: string; commitSha: string }>> {
    const tags: Array<{ name: string; commitSha: string }> = [];
    for (let page = 1; page <= 100; page++) {
      const res = await ghFetch(
        `/repos/${params.owner}/${params.repo}/tags?per_page=100&page=${page}`,
        { source: params.source },
      );
      if (!res.ok) {
        fail(params.source, res.status, await readErrorDetail(res));
      }
      const batch = (await res.json()) as Array<{
        name: string;
        commit: { sha: string };
      }>;
      if (batch.length === 0) break;
      for (const t of batch) {
        tags.push({ name: t.name, commitSha: t.commit.sha });
      }
      if (batch.length < 100) break;
    }
    return tags;
  }

  /**
   * releaseDate for a tag = committer.date of the commit the tag points to.
   * Unified for both tag kinds:
   * - lightweight: ref → commit
   * - annotated: ref → tag object → peel to commit (tagger.date ignored)
   */
  async function resolveTagDate(params: {
    owner: string;
    repo: string;
    tag: string;
    source: string;
  }): Promise<string> {
    const refRes = await ghFetch(
      `/repos/${params.owner}/${params.repo}/git/ref/tags/${encodeURIComponent(params.tag)}`,
      { source: params.source },
    );
    if (!refRes.ok) {
      fail(params.source, refRes.status, await readErrorDetail(refRes));
    }
    const refBody = (await refRes.json()) as {
      object: { type: string; sha: string };
    };

    let commitSha: string;
    if (refBody.object.type === "commit") {
      // Lightweight tag: ref already points at the release commit.
      commitSha = refBody.object.sha;
    } else if (refBody.object.type === "tag") {
      // Annotated tag: peel to the target commit (ignore tagger.date so a
      // retroactive `git tag -a` still yields the release commit's date).
      const tagRes = await ghFetch(
        `/repos/${params.owner}/${params.repo}/git/tags/${refBody.object.sha}`,
        { source: params.source },
      );
      if (!tagRes.ok) {
        fail(params.source, tagRes.status, await readErrorDetail(tagRes));
      }
      const tagBody = (await tagRes.json()) as {
        object: { type: string; sha: string };
      };
      if (tagBody.object.type !== "commit") {
        fail(
          params.source,
          500,
          `annotated tag does not point at a commit (got ${tagBody.object.type})`,
        );
      }
      commitSha = tagBody.object.sha;
    } else {
      fail(
        params.source,
        500,
        `tag ref does not point at a tag or commit (got ${refBody.object.type})`,
      );
    }

    const commitRes = await ghFetch(`/repos/${params.owner}/${params.repo}/commits/${commitSha}`, {
      source: params.source,
    });
    if (!commitRes.ok) {
      fail(params.source, commitRes.status, await readErrorDetail(commitRes));
    }
    const commitBody = (await commitRes.json()) as {
      commit: { committer: { date: string } };
    };
    return commitBody.commit.committer.date;
  }

  return {
    getRawContents,
    listContents,
    listAllTags,
    resolveTagDate,
  };
}

export type GitHubClient = ReturnType<typeof createGitHubClient>;
