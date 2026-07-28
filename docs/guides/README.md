# Setup guides — remote content for sync

These guides explain how to prepare **GitHub remotes** so this portfolio can pull
content with `bun run sync` into live `src/content/projects|profile`
(generated; gitignored). Local fixtures live under `src/content/placeholder/`
and are materialized with `bun run sync:dev`.

| Guide | Use when |
| --- | --- |
| [New project remote](./new-project-remote.md) | Greenfield repo that will hold portfolio project content |
| [Existing project remote](./existing-project-remote.md) | App/repo already exists; add a portfolio content folder |
| [Profile remote](./profile-remote.md) | Dedicated (or shared) repo for the single Profile entry |

**Contract sources (do not invent fields):** `sync.config.ts`,
`sync.config.dev.ts`, `src/content/assemble/*`, `src/sync/plan.ts`, fixtures
under `src/content/placeholder/`, accepted
[ADR 0003](../../.agents/codebase/adr/0003-content-collections-and-sync.md),
plus research notes in [`docs/research/`](../research/) (PROG-77, PROG-80, PROG-83)
and [`docs/additional-info/deferred-data-input-astro-starwind-grouped.md`](../additional-info/deferred-data-input-astro-starwind-grouped.md).

**Shared prerequisites**

1. A GitHub PAT (or App installation token) with Contents + Metadata read on
   every private remote listed in `sync.config.ts`. Locally: `GITHUB_TOKEN` in
   `.env` (see [`.env.example`](../../.env.example)). In Actions: store that PAT
   as repository secret `PORTFOLIO_GITHUB_TOKEN` (Actions reserves
   `secrets.GITHUB_TOKEN` for the installation token).
2. Remotes filled in with real `owner` / `repo` values — project stubs starting
   with `TODO` are rejected (fail-closed). Profile may be omitted / `TODO` on
   prod sync to skip the profile remote.
3. Sync is **fail-closed**: one bad remote, missing required file, or id mismatch
   aborts the whole run; nothing is partially written until the plan succeeds.
4. Every sync family **wipes** live `projects/` + `profile/` first (never
   `placeholder/`).

**Local vs prod commands**

| Command | What it does |
| --- | --- |
| `bun run sync:dev` | Wipe live roots → copy fixtures from `placeholder/` via `sync.config.dev.ts` (no GitHub) |
| `bun run sync:dev:all` | Fixtures, then remotes from `sync.config.ts` (projects + profile when set; remote wins on overlap) |
| `bun run sync` | Prod only: wipe → fetch remotes from `sync.config.ts` |

**CI**

- **PR / catch-up verify:** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) —
  `bun run sync:dev` → `lint` → `check` → `test` → `build` (fixtures; no PAT).
- **Pages deploy:** [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
  runs `bun run sync` before `bun run build` on `main` (never `sync:dev*`).
  Missing `PORTFOLIO_GITHUB_TOKEN` or any sync failure fails the job.
- **Repo vars:** set Actions variables `ASTRO_SITE` and `ASTRO_BASE` for the live
  Pages URL/base (see [`.env.example`](../../.env.example)).
