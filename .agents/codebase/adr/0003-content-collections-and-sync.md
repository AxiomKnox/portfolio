# ADR 0003: Content Collections store + GitHub sync

**Status:** Accepted (supersedes [ADR 0001](./0001-content-as-code.md))

**Source outline:** [`docs/research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md`](../../../docs/research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md) (PROG-83). Landed as **0003** because [ADR 0002](./0002-astro-starwind-shadcn-hybrid.md) is the Starwind/shadcn hybrid.

## Context

ADR-0001 stored portfolio content as typed TypeScript modules in `src/data/*.ts`, with a thin adapter for pages and an explicit ban on fetch/CMS. The Data / Input / Content Collections map (PROG-75) replaces that model: on-disk markdown and sidecars under `src/content/**`, Astro Content Collections with loaders that assemble domain-shaped data, optional GitHub API sync into that tree, and the same exclusive adapter seam for pages.

Alternatives considered:

1. **Keep typed TS modules (ADR-0001)** — simplest compile-time checks; no sync story; blocked private-folder + tag metadata workflow.
2. **Headless CMS** — out of scope for a developer-authored personal portfolio; adds network/runtime dependency.
3. **Collections + loaders + thin adapter + GitHub sync (chosen)** — content-as-files with Zod/Collections validation, regenerable sync, stable page import surface.

## Decision

Adopt a **single umbrella** architecture:

1. **Live store** is `src/content/**` via Astro Content Collections — not `src/data/*.ts`.
2. **Content Layer loaders** assemble domain-shaped collection `data` (frontmatter, body, sidecars, assets). Pages do not perform that merge.
3. A **thin exclusive adapter** remains the only page/shell import surface: getters only (`getProfile`, `getProjects`, `getProjectById`, `getFeaturedProjects`, plus brand-catalog assert). Pages and shell must **not** import `astro:content`.
4. **Domain types** for islands live under `src/content/types/`.
5. **Status source of truth** is `project.md` frontmatter. Frontmatter must **not** contain `version` or `releaseDate`.
6. **`git-meta.json`** is an optional sidecar at read: missing → synthesize `{ version: "unreleased", releaseDate: <ISO now at load/build> }`; when present, strict `{ version, releaseDate }`; present-but-invalid → fail-closed. Fixtures preferred-include a committed sidecar. Sync with zero tags writes the same placeholders. Exact schema and tag-selection algorithms: PROG-80 (and PROG-76 for API provenance).
7. **Input/sync** uses Bun `fetch` + GitHub API, config in `sync.config.ts`, secret name `GITHUB_TOKEN` (local `.env`; CI maps Actions secret `PORTFOLIO_GITHUB_TOKEN` → env `GITHUB_TOKEN`). Sync is **fail-closed**, except the locked zero-tag placeholder write. Details: PROG-76 + PROG-75 Notes.
8. **Bootstrap:** commit fixtures under `src/content/placeholder/`; materialize into live `src/content/projects|profile` via `bun run sync:dev` (or prod `bun run sync` from remotes). Live roots are generated and gitignored; sync may overwrite them.
9. **Profile** is a single-entry content collection (PROG-78).
10. This ADR **supersedes ADR-0001**. Agent rules that say “do not add fetch” / “edit only `src/data/*.ts`” are replaced by the laws above (fetch allowed only for the locked sync path).

Normative schema and algorithm detail is **not** duplicated here; follow PROG-75 / PROG-76 / PROG-78 / PROG-79 / PROG-80 Answers and `docs/research/prog-76-*.md`, `prog-77-*.md`.

## Consequences

**Positive:**

- On-disk content matches Collections tooling and private-folder sync.
- Pages keep a stable getter seam while loaders own assembly complexity.
- Status vs release metadata stay separated (FM vs sidecar).
- Fail-closed sync + required token makes missing auth/config loud in CI and local.

**Negative:**

- Content path is no longer “one TS file”; agents must know trees, sidecars, and sync.
- Builds depend on a prior materialize (`sync:dev`) or prod sync; invalid sidecars fail the build.

**Neutral:**

- Adapter filename may stay `adapter.ts` or be renamed later; exclusivity matters more than name.
- Exact package-script / CI job paths remain implementation detail (same script local+CI; fail-closed).

## Agent implications

- **Do not** add CMS clients, ORMs, or ad-hoc runtime content fetch outside the locked GitHub sync path without reopening this ADR.
- **Do not** import `astro:content` from `.astro` pages — use the adapter getters.
- **Do not** put `version` / `releaseDate` in `project.md` frontmatter; status stays in FM.
- **Default content path:** edit fixtures under `src/content/placeholder/`, then `bun run sync:dev`; live trees are `src/content/projects/<id>/` and `src/content/profile/profile.md` (generated).
- **Sync:** prod `bun run sync` requires `GITHUB_TOKEN` (fail-closed except zero-tag write per PROG-80). Local fixtures: `sync:dev` (no token) / `sync:dev:all` (fixtures + project remotes; profile stays fixture). Deploy CI: `bun run sync` only; PR CI: `sync:dev`.
- Domain types: import from `@/content/types` (or via adapter for values + helpers).

## Notes

Hard to reverse without migrating files back to TS modules and dropping sync. Trade-off favors Collections + sync for private project folders and tag-derived release metadata while preserving the adapter seam from ADR-0001.
