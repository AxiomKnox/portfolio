# Guide: set up an **existing** project for this portfolio

Use this when the application (or library) **already lives** in a GitHub repo
and you want that same repo to feed one portfolio project via sync. Goal: add a
small portfolio content folder **without** disrupting the app layout, CI, or
package roots.

Schema and sync rules match the [new project guide](./new-project-remote.md);
this page focuses on placement, migration, and messy tags.

---

## 1. Where to put portfolio content

Sync only reads the remote folder named by `sync.config.ts` `path` (plus known
filenames under it). It does **not** clone the whole tree into the portfolio.

Pick one:

| Approach | `path` example | When |
| --- | --- | --- |
| Repo root | `""` | Tiny repo, or content is the main point |
| Dedicated subfolder | `"portfolio"` or `"docs/portfolio"` | **Recommended** for app repos — keeps `project.md` out of the app root |

Recommended tree inside an existing app repo:

```text
your-app/
  package.json                 # untouched
  src/ …                       # untouched
  portfolio/                   # ← sync path
    project.md                 # required
    architecture.json          # optional
    preview.png | preview.webp # optional; never both
```

Register with:

```ts
{
  id: "your-project-id",
  owner: "you",
  repo: "your-app",
  path: "portfolio",
}
```

The portfolio destination is always `src/content/projects/<id>/` in the
**portfolio** repo — not inside the app.

---

## 2. Migrate README / metadata → `project.md` + sidecars

| Existing material | Portfolio home |
| --- | --- |
| Elevator pitch / README intro | Frontmatter `summary` + Markdown **body** (`description`) |
| “Stack” / badges | `techStack: string[]` |
| Status language (“alpha”, “production”) | `status` enum: `dev` \| `alpha` \| `beta` \| `prod` \| `archived` |
| Category (infra / web / ML) | `category`: `devops` \| `web` \| `ml` only |
| GitHub / live URLs | `links.github` / `links.live` |
| Architecture diagrams in docs | Optional `architecture.json` (`nodes` / `edges` / `steps`) |
| Release version / date | **Not** in `project.md` — comes from tags → `git-meta.json` |
| Screenshots | Optional `preview.png` **or** `preview.webp` (UI wire: PROG-84) |

Do **not** copy `version` / `releaseDate` into frontmatter. Status stays
authored in FM (status source of truth is not git).

Checklist:

1. Choose `id` (stable slug). Prefer matching an existing
   `src/content/placeholder/projects/<id>` fixture id if you are replacing that
   project; otherwise pick a new unique id.
2. Create `portfolio/project.md` with required FM fields (see table in the
   [new project guide](./new-project-remote.md#3-projectmd-frontmatter-and-body)).
3. Move long-form prose into the Markdown body; keep the README for the app if
   you still want a developer-facing root README.
4. Optionally add `architecture.json` (copy shape from
   `src/content/placeholder/projects/atlas-deploy/architecture.json`).
5. Set `id` in frontmatter to the same string you will put in `sync.config.ts`.

---

## 3. Tagging when tags are already messy

Sync behavior on the **whole repo’s** tags:

- **Zero tags** → `git-meta.json` with `version: "unreleased"` and ISO “now”.
- **Tags exist, none semver-parseable** → **fail-closed** (sync aborts for everyone).
- **At least one semver** → max semver wins; non-semver tags are ignored.

If the repo already has tags like `backup`, `old`, `release-2023` and **no**
`v1.2.3`-style tags, sync will fail until you either:

1. Add a proper semver tag (e.g. `v1.0.0`) that reflects the release you want
   shown, or
2. Remove/rename non-semver tags so the repo has **zero** tags (unreleased
   placeholder) or at least one parseable semver.

Leading `v` is fine (`v1.4.0`). Prereleases parse (`0.3.0-alpha`). The winning
tag **name** is stored as `version` (pass-through).

---

## 4. Register, sync, verify

1. Add a projects entry in the portfolio `sync.config.ts` (real `owner`/`repo`,
   no `TODO` placeholders; unique `id`).
2. Ensure `.env` has `GITHUB_TOKEN` with Contents + Metadata read on that private
   repo (see `.env.example`).
3. From the portfolio repo: `bun run sync`.
4. Confirm `src/content/projects/<id>/` has `project.md`, sync-written
   `git-meta.json`, and any optionals you published.
5. Run a local build/dev load to catch assemble errors (id mismatch, bad enums,
   invalid architecture JSON, both preview formats).

---

## 5. Common pitfalls (existing repos)

| Pitfall | Fix |
| --- | --- |
| Putting content only in README, empty sync `path` files | Sync requires remote `project.md` under `path` |
| `path` points at wrong folder | 404 → required file missing → fail-closed |
| App monorepo: syncing a package that is not the content folder | Point `path` at the portfolio folder, not `packages/app` |
| Reusing an id that already exists in config | Duplicate `id` rejected |
| Junk tags without any semver | Add a semver tag or clear tags (see §3) |
| Expecting sync to update the app repo | Sync only **reads** remotes and writes the portfolio’s `src/content/**` |
| Committing hand-edited `git-meta.json` on the remote | Not used; sync regenerates locally from tags |

---

## 6. Optional preview / architecture

Same rules as the new-project guide:

- `architecture.json` optional; omit → no architecture island data.
- Preview image optional; **one** of png/webp; both → fail-closed.
- Gradient token via FM `preview` for today’s UI; image presentation is
  **PROG-84** (later / optional until wired).

---

## Background reading

- [New project remote](./new-project-remote.md) — full FM table and remote tree
- [`docs/research/prog-77-live-fields-to-data-layer-schemas.md`](../research/prog-77-live-fields-to-data-layer-schemas.md)
- [`docs/additional-info/deferred-data-input-astro-starwind-grouped.md`](../additional-info/deferred-data-input-astro-starwind-grouped.md) §1
- PROG-83 ADR outline: [`docs/research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md`](../research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md)
