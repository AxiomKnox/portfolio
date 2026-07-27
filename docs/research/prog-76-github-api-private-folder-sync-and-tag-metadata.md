# PROG-76 — GitHub API for private folder sync and tag → `git-meta`

**Issue:** [PROG-76](https://linear.app/general-stuff/issue/PROG-76/research-github-api-for-private-folder-sync-and-tag-metadata)  
**Parent map:** [PROG-75](https://linear.app/general-stuff/issue/PROG-75/wayfinder-data-input-and-content-collections-readiness)  
**Unblocks:** [PROG-80](https://linear.app/general-stuff/issue/PROG-80/lock-git-metajson-schema-and-merge-rules-into-project)  
**Date:** 2026-07-25  
**Scope:** Facts-only REST / Git Data API research for Bun `fetch` + `GITHUB_TOKEN`. Does **not** implement sync, CI wiring, or lock the full `git-meta.json` schema (PROG-80). Prefer no `git` / `gh` dependency for the canonical path.

---

## 1. Question

Which authenticated GitHub REST (or Git Data) endpoints should the Bun `fetch` + `GITHUB_TOKEN` sync use to (1) download known files under a repo path for **private** repos and (2) derive `version` / `releaseDate` into `git-meta.json` — including rate-limit and auth header facts?

---

## 2. Sources (primary)

| Source | Role |
| --- | --- |
| [Get repository content](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content) | File/dir download; media types; size limits |
| [Get a tree](https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28#get-a-tree) | Recursive tree when listing many paths |
| [Get a blob](https://docs.github.com/en/rest/git/blobs?apiVersion=2022-11-28#get-a-blob) | Blob bytes by SHA (≤100 MB) |
| [List repository tags](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-tags) | Tag names + commit SHAs |
| [Git references](https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28) | Resolve `tags/<name>` → object type/SHA |
| [Get a tag](https://docs.github.com/en/rest/git/tags?apiVersion=2022-11-28#get-a-tag) | Annotated-tag `tagger.date` |
| [Get a commit](https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#get-a-commit) | Lightweight-tag / commit dates |
| [List releases](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#list-releases) / [latest](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release) | Optional GH Release path (`published_at`, `tag_name`) |
| [Authenticating to the REST API](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28) | `Authorization` header forms |
| [Getting started with the REST API](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28) | Required headers (`Accept`, `User-Agent`, API version) |
| [Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) | Primary/secondary limits + response headers |
| [Fine-grained PAT permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens?apiVersion=2022-11-28) | Contents / Metadata permission → endpoints |
| [OAuth scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) | Classic PAT `repo` for private code |
| PROG-75 Notes + `docs/additional-info/deferred-data-input-astro-starwind-grouped.md` §1 | Owner locks (Bun fetch, single token, tags → sidecar) |
| `docs/research/prog-77-live-fields-to-data-layer-schemas.md` | Sidecar minimum `version` / `releaseDate` |
| Live `Project` via CodeGraph (`src/data/projects.ts`) | Consumers expect string `version` + date `releaseDate` |

---

## 3. Locks in force (do not re-litigate)

From PROG-75 / deferred brief §1:

- Sync transport: Bun `fetch` + GitHub API + env `GITHUB_TOKEN` (`.env` / `.env.example` + CI job secret, **same name**).
- Fail-closed; **no** per-repo tokens; config has `{ id, owner, repo, path, ref? }` only.
- No full `git clone`; no hard dependency on `git` / `gh` for the canonical path.
- Sidecar `git-meta.json` at least `version`, `releaseDate` (full shape → PROG-80).

---

## 4. Recommended endpoints (canonical Bun `fetch` path)

Base URL: `https://api.github.com`.

### 4.1 Download known files under `owner/repo` + `path` (+ optional `ref`)

**Primary (recommended when filenames are known):**

```http
GET /repos/{owner}/{repo}/contents/{pathToFile}?ref={ref}
Accept: application/vnd.github.raw+json
```

- `{pathToFile}` = config `path` joined with each known relative file (e.g. `path/project.md`, `path/architecture.json`, `path/preview.png`).
- `ref` query = config `ref` when set; omit to use the repository default branch ([docs](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content)).
- **Raw media type** returns file bytes directly (best for private repos with Bun `fetch`). Default JSON response base64-encodes `content` for files ≤1 MB; for 1–100 MB only `raw` / `object` media types work; **>100 MB not supported** on this endpoint.
- Directory listing (omit trailing file): response is an array of entries (or object+`entries` with `application/vnd.github.object+json`). **Upper limit 1,000 files per directory**; for more, use Trees API.
- `download_url` values **expire** and are intended for one-shot use; refresh via Contents API. Prefer `Accept: application/vnd.github.raw+json` on the Contents endpoint itself rather than relying on `raw.githubusercontent.com` for private content.

**Optional discovery / bulk listing (when the set of files under `path` is not fully known):**

```http
GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1
```

- `tree_sha` may be a **SHA or a ref name** (branch/tag) per Get a tree docs.
- Filter `tree[].path` to those under config `path` with `type === "blob"`, then:

```http
GET /repos/{owner}/{repo}/git/blobs/{file_sha}
Accept: application/vnd.github.raw+json
```

- Blobs supported up to **100 MB**. Recursive tree: up to **100,000** entries / **7 MB** response; if `truncated: true`, walk non-recursive subtrees.

**Not recommended as the canonical path for known portfolio files:** whole-repo `tarball` / `zipball` (extra unpack; private archive redirects expire in five minutes). Still REST-only if ever needed as an escape hatch.

**Profile sync:** same Contents pattern against the profile remote’s `path` (files such as `profile.md`, `resume.pdf`, etc.). Profile has **no** `git-meta.json` in the locked tree.

### 4.2 Derive `version` / `releaseDate` for `git-meta.json` (tags-first)

Owner lock: git-derived metadata from **tags** → sidecar (not GitHub Releases–only).

| Step | Endpoint | Fields that feed the sidecar |
| --- | --- | --- |
| A. List tags | `GET /repos/{owner}/{repo}/tags?per_page=100&page=N` | `name` → candidate **version** string; `commit.sha` |
| B. Resolve tag ref | `GET /repos/{owner}/{repo}/git/ref/tags/{tag}` | `object.type` (`tag` vs `commit`), `object.sha` |
| C1. Annotated tag | `GET /repos/{owner}/{repo}/git/tags/{tag_sha}` | `tagger.date` → **releaseDate** source (ISO 8601) |
| C2. Lightweight tag | `GET /repos/{owner}/{repo}/commits/{commit_sha}` | `commit.committer.date` or `commit.author.date` → **releaseDate** source |
| Alt. All tag refs | `GET /repos/{owner}/{repo}/git/matching-refs/tags/` | Array of refs (no dates); still need C1/C2 |

**API facts that constrain PROG-80 decisions (not locked here):**

1. **List tags response has no date fields** — only `name`, `commit.{sha,url}`, archive URLs, `node_id`. A date always requires a follow-up (annotated tag object and/or commit).
2. **Git Tags API is annotated-only.** Lightweight tags exist only as refs pointing at commits; Get a tag returns 404 for a commit SHA that is not an annotated tag object.
3. **List repository tags documents no `sort` / `direction` query params.** Official sort order is **not specified** in the current REST reference — PROG-80 must define how “latest” is chosen (e.g. paginate + semver compare on `name`, and/or resolve dates then pick max date). Do not assume undocumented ordering.
4. **Releases are a separate object.** `GET /repos/{owner}/{repo}/releases` explicitly **excludes** tags that are not associated with a Release. If a project only tags without Releases, Releases endpoints are insufficient. Optional enrichment when a Release exists:
   - `GET /repos/{owner}/{repo}/releases/latest` → `tag_name`, `published_at` (latest = most recent **non-prerelease, non-draft**, sorted by `created_at` of the release’s commit — see docs).
   - `GET /repos/{owner}/{repo}/releases/tags/{tag}` → same shape for a chosen tag.
5. **Live fixture / PROG-77 examples** store `version` like `"v1.4.0"` and `releaseDate` as a calendar ISO date (`YYYY-MM-DD`). Whether sync keeps the leading `v` and whether it truncates `tagger.date` / `published_at` to a date-only string is a **PROG-80 schema rule**, not an API constraint.

**Minimal request sketch per project (tags → sidecar):**

1. Paginate `GET …/tags` until empty or until PROG-80’s “chosen tag” rule is satisfied.
2. For the chosen tag name: `GET …/git/ref/tags/{name}`.
3. If `object.type === "tag"`: `GET …/git/tags/{object.sha}` → date from `tagger.date`.
4. Else (`commit`): `GET …/commits/{object.sha}` → date from `commit.committer.date` (or author — PROG-80 pick).
5. Write `git-meta.json` with at least `{ version, releaseDate }` (mapping rules → PROG-80).

---

## 5. Auth headers and token facts

### 5.1 Request headers (every `fetch`)

| Header | Fact |
| --- | --- |
| `Authorization` | `Bearer <token>` **or** `token <token>` for PATs; JWT must use `Bearer` ([auth docs](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28)). |
| `Accept` | Prefer `application/vnd.github+json` for JSON; use `application/vnd.github.raw+json` when downloading file/blob bytes. |
| `X-GitHub-Api-Version` | Versioned REST API; docs examples currently show `2026-03-10` (pin explicitly in sync). |
| `User-Agent` | **Required.** Missing → rejected; invalid → `403`. Bun `fetch` may not send a useful UA by default — set an app-identifying value (e.g. portfolio sync script name). |

Insufficient/missing auth on private resources typically surfaces as **`404 Not Found` or `403 Forbidden`** (not always a clear “auth failed”). Invalid credentials → **`401`**; repeated invalid auth can temporarily **`403`** all auth attempts.

### 5.2 Token kind vs env name `GITHUB_TOKEN`

| Kind | Private cross-repo read? | Rate-limit bucket (primary) |
| --- | --- | --- |
| Fine-grained PAT or classic PAT stored as secret named `GITHUB_TOKEN` | Yes, if token is granted on each source repo | Authenticated user: **5,000 req/hour** (higher only for GHEC app/OAuth paths) |
| Actions **built-in** `GITHUB_TOKEN` (`github.token`) | Only the workflow repo (and limited multi-repo cases); **not** a general private multi-repo sync token | **1,000 req/hour per repository** (15,000 on GHEC resources) |

**Implication for the locked secret name:** the CI job secret named `GITHUB_TOKEN` must be a **PAT (or App installation token) with access to all configured private remotes**, not the default Actions installation token, unless every remote is reachable under that installation’s permissions. Classic PAT needs **`repo`** for private repository contents. Fine-grained PAT needs at least:

- **Contents: Read** — covers `GET …/contents/…`, `…/git/blobs`, `…/git/trees`, `…/git/ref…`, `…/git/tags…`, `…/commits…`, Releases GETs used above.
- **Metadata: Read** — covers `GET …/tags` (List repository tags). Metadata is commonly granted automatically with repo access; confirm on token creation.

One token for all remotes matches the fail-closed / no-per-repo-token lock.

---

## 6. Rate limits (facts for later backoff wiring)

**Primary (authenticated PAT / user):** 5,000 requests/hour.  
**Unauthenticated:** 60/hour (irrelevant once private sync requires a token).  
**Actions built-in `GITHUB_TOKEN`:** 1,000/hour/repo (see §5.2).

**Response headers to read on every call:**

| Header | Meaning |
| --- | --- |
| `x-ratelimit-limit` | Max requests in window |
| `x-ratelimit-remaining` | Remaining in window |
| `x-ratelimit-used` | Used in window |
| `x-ratelimit-reset` | UTC epoch seconds when window resets |
| `x-ratelimit-resource` | Which resource bucket |

Prefer these headers over `GET /rate_limit` (that call does not count against primary but can count against secondary).

**On primary exhaustion:** `403` or `429` with `x-ratelimit-remaining: 0` — do not retry until `x-ratelimit-reset`.

**Secondary limits (abuse prevention):** e.g. ≤100 concurrent requests; ≤900 REST points/minute (most GET = 1 point); CPU-time budgets; etc. On secondary hit: honor `retry-after` if present; else if remaining is 0 wait for reset; else wait ≥1 minute then exponential backoff. Continuing while limited can ban the integration.

**Rough cost model (facts for implementers):**  
per known file ≈ 1 Contents GET; per project tag metadata ≈ 1 (list page) + 1 (ref) + 1 (tag or commit). Directory listing / recursive tree adds more. Small private portfolios stay well under 5k/hour; naive “list all tags + date every tag every sync” can burn budget — PROG-80 / sync design should pick a cheap “chosen tag” rule.

Exact backoff policy remains listed as “not yet specified” on PROG-75 until implementation; this research only supplies the header/status contract.

---

## 7. Mapping to locked Data layer (feeds PROG-80)

| Sidecar field (minimum) | API provenance | Notes for PROG-80 |
| --- | --- | --- |
| `version` | Tag `name` from `GET …/tags` (or Release `tag_name` if Releases path chosen) | Keep/strip `v`; empty-tags fail-closed vs bootstrap — schema/merge rules |
| `releaseDate` | Annotated: `tagger.date`; lightweight: `commit.committer.date` / `author.date`; optional Release: `published_at` | Truncate to `YYYY-MM-DD` vs full datetime; timezone |

File bytes from Contents/blobs land under `src/content/projects/<id>/` / `src/content/profile/` as already locked; sync must not rewrite fetched markdown after write (immutable fetch lock).

---

## 8. Alternatives considered (not canonical)

| Approach | Why not canonical here |
| --- | --- |
| `git clone` / `git ls-remote` / `gh api` | Owner lock: Bun `fetch` + REST; no `git`/`gh` dependency for canonical path |
| Releases-only for version/date | Misses repos that tag without creating Releases |
| `raw.githubusercontent.com` as primary private download | Prefer authenticated Contents `raw` media type; download URLs expire |
| GraphQL | Not required; REST covers files + tags; would add another auth/rate surface |

---

## 9. Residual decisions for PROG-80 / implementers (not API facts)

1. Exact rule for **which** tag is “current” (semver max vs newest resolved date vs first page of `/tags`).
2. Annotated vs lightweight date precedence; `committer` vs `author`.
3. Whether Releases `published_at` may override tagger/commit date when both exist.
4. `version` string normalization (`v` prefix) and `releaseDate` string shape for Collections Zod.
5. Fail-closed behavior when a remote has **zero** tags (bootstrap sidecar? hard fail?).
6. Known file allowlist per project vs recursive tree under `path`.
7. Pin value for `X-GitHub-Api-Version` and `User-Agent` string in the sync script.
8. Concrete rate-limit backoff (PROG-75 “not yet specified”).

---

## 10. Verdict

**Canonical Bun `fetch` path:**

1. **Files:** `GET /repos/{owner}/{repo}/contents/{pathToFile}?ref=` with `Accept: application/vnd.github.raw+json` (+ `Authorization: Bearer $GITHUB_TOKEN`, `X-GitHub-Api-Version`, `User-Agent`). Optional Trees+Blobs if discovery is needed.
2. **Tag metadata:** `GET …/tags` → `GET …/git/ref/tags/{tag}` → `GET …/git/tags/{sha}` **or** `GET …/commits/{sha}` for `version` / `releaseDate`. Releases endpoints are optional enrichment only.
3. **Auth/rate:** PAT (or App token) as the locked `GITHUB_TOKEN` secret; Contents+Metadata read; 5k/hour primary; honor `x-ratelimit-*` / `retry-after`.

**PROG-80:** unblocked for API provenance of the minimum sidecar fields; still owns schema/merge/bootstrap and “chosen tag” rules.
