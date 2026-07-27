# Guide: set up a **new** project repo for this portfolio

Use this when you are creating a **new** GitHub repository that will supply one
portfolio project. Sync pulls a known folder from that remote into
`src/content/projects/<id>/` and derives `git-meta.json` from repository tags.

Canonical fixture examples: `src/content/placeholder/projects/atlas-deploy/`
(and siblings). After sync, the live tree is `src/content/projects/<id>/`.

---

## 1. Greenfield checklist

1. Create a GitHub repo (private is fine; sync expects `GITHUB_TOKEN` for private remotes).
2. Choose a stable **project id** (URL slug), e.g. `harbor-mlops`. Use the same
   string everywhere: folder name on the remote (if nested), `project.md`
   frontmatter `id`, and `sync.config.ts` `id`.
3. Add the portfolio content path (repo root or a subfolder — see tree below).
4. Commit `project.md` (+ optional sidecars).
5. Optionally create a **semver** tag (`v0.1.0` or `0.1.0`) so sync can write a
   real version/release date. Zero tags → sync writes `version: "unreleased"`.
6. Register the remote in the portfolio’s `sync.config.ts`.
7. Run `bun run sync` in the portfolio repo and verify the local tree.

---

## 2. Required file tree on the **remote**

`path` in `sync.config.ts` is the remote folder that **contains** these files
(use `""` for repo root). Sync joins `path` + filename.

```text
<remote path>/                 # "" = repo root, or e.g. "portfolio"
  project.md                   # required
  architecture.json            # optional
  preview.png  XOR  preview.webp   # optional; never both
```

**Do not author `git-meta.json` on the remote.** Sync always writes it locally
from GitHub tags (`version` + `releaseDate`). Committed fixtures under
`src/content/placeholder/` may include `git-meta.json`; materialize with
`bun run sync:dev`. A prod sync overwrites the live copy.

After a successful sync, the portfolio has:

```text
src/content/projects/<id>/
  project.md
  git-meta.json                # produced by sync
  architecture.json            # if present remotely
  preview.png | preview.webp   # if present remotely (one only)
```

---

## 3. `project.md` frontmatter and body

YAML frontmatter + Markdown body. The body becomes domain `description`
(Markdown). **Do not put `version` or `releaseDate` in frontmatter** — those
live only in `git-meta.json` (PROG-80).

| Field | Required | Type / values | Notes |
| --- | --- | --- | --- |
| `id` | yes | string | Must equal `sync.config.ts` `id` and destination folder name |
| `title` | yes | string | Card + detail title |
| `summary` | yes | string | 1–2 lines; cards + meta |
| `category` | yes | `"devops"` \| `"web"` \| `"ml"` | Enum only |
| `type` | yes | string | Free-form, e.g. `"Deployment platform"` |
| `status` | yes | `"dev"` \| `"alpha"` \| `"beta"` \| `"prod"` \| `"archived"` | Source of truth in FM |
| `techStack` | yes | `string[]` | Matched against tech-icon catalog |
| `featured` | no | boolean | Omit = not featured |
| `links` | no | `{ github?: string; live?: string }` | Omit → `{}` |
| `preview` | no | string | GradientPreview token (`grad-1`…`grad-6`); default `grad-1` if omitted |
| `associated` | no | `string[]` | Other project ids; omit → `[]` |

Minimal example:

```yaml
---
id: my-new-project
title: My New Project
summary: One or two lines for cards and the detail header.
category: web
type: Side project
status: alpha
techStack:
  - TypeScript
  - Astro
featured: false
links:
  github: https://github.com/you/my-new-project
preview: grad-2
---

Longer Markdown description for the project detail page.

## Highlights

- First bullet
- Second bullet
```

Full fixture reference: `src/content/placeholder/projects/atlas-deploy/project.md`.

### Optional `architecture.json`

Shape (see `atlas-deploy/architecture.json`):

```json
{
  "nodes": [{ "id": "s1", "label": "…", "x": 40, "y": 120 }],
  "edges": [{ "from": "s1", "to": "s2" }],
  "steps": [{ "id": "s1", "title": "…", "detail": "…" }]
}
```

Omit the file if you do not need the architecture diagram.

### Optional preview image

- At most one of `preview.png` or `preview.webp`.
- Both present → sync and assemble **fail-closed**.
- Syncing the file is supported today; wiring the image into the UI (instead of
  the GradientPreview token) is **PROG-84** — treat the image as optional /
  later until that lands. Keep a `preview` token in frontmatter for current UI.

---

## 4. Tags → `git-meta.json`

Sync lists all tags on the **project repo**, picks the **max semver** tag name
(pass-through; leading `v` allowed for parse), and sets `releaseDate` from the
tag’s target commit date (`committer.date`; annotated tags peel first).

| Remote tags | Sync writes |
| --- | --- |
| None | `{ "version": "unreleased", "releaseDate": "<ISO now>" }` |
| Some, but none semver-parseable | **Fail-closed** (whole sync aborts) |
| At least one semver | Max semver tag name + that tag’s date |

Semver examples that parse: `v1.4.0`, `0.3.0-alpha`, `1.0.0+build.1`.
Messy names like `release-june` alone (with no semver tags) will fail sync.

For a new repo: either leave tags empty until the first release, or tag
`v0.1.0` after the first content commit.

---

## 5. Register in `sync.config.ts`

In the portfolio repo root:

```ts
{
  id: "my-new-project",       // destination: src/content/projects/my-new-project/
  owner: "your-github-user",
  repo: "my-new-project",
  path: "",                   // or "portfolio" if content lives in a subfolder
  // ref: "main",             // optional; omit = default branch
}
```

`owner` / `repo` must not be `TODO…` placeholders. Duplicate `id` values are rejected.

---

## 6. Run sync and verify

In the portfolio repo:

```bash
# .env (see .env.example)
GITHUB_TOKEN=ghp_…

bun run sync
```

Success looks like: `Sync complete: wrote N file(s); removed M stale optional path(s).`

Verify:

1. `src/content/projects/<id>/project.md` matches the remote.
2. `git-meta.json` exists with `version` + `releaseDate`.
3. Optional files appear only if present remotely; removed remotes delete local
   optional paths (`architecture.json`, preview images) on the next sync.
4. `bun run build` (or your usual content check) loads the project without
   assemble errors (id match, enums, architecture schema if present).

---

## 7. Common pitfalls

| Pitfall | What happens |
| --- | --- |
| Config `id` ≠ frontmatter `id` | Sync fails: config/frontmatter mismatch |
| Folder / config id typo | Destination is always `src/content/projects/<config id>/` |
| `TODO` owner/repo left in config | `parseSyncConfig` rejects before fetch |
| Missing `GITHUB_TOKEN` | Fail-closed immediately |
| Token lacks access to private remote | Fetch fails; whole sync aborts |
| Both `preview.png` and `preview.webp` | Fail-closed |
| Tags exist but none are semver | Fail-closed — delete junk tags or add a real semver tag |
| `version` / `releaseDate` in frontmatter | Not part of authored FM schema; keep them out |

---

## Background reading

- Field → file map: [`docs/research/prog-77-live-fields-to-data-layer-schemas.md`](../research/prog-77-live-fields-to-data-layer-schemas.md)
- Tags / sidecar: PROG-80 (see deferred brief §1 and `src/sync/git-meta-from-tags.ts`)
- ADR outline (collections + sync): [`docs/research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md`](../research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md)
- Grouped contract notes: [`docs/additional-info/deferred-data-input-astro-starwind-grouped.md`](../additional-info/deferred-data-input-astro-starwind-grouped.md)
