# PROG-83 — Outline / draft ADR superseding content-as-code TS modules

**Issue:** [PROG-83](https://linear.app/general-stuff/issue/PROG-83/outline-the-adr-that-supersedes-content-as-code-ts-modules)  
**Parent map:** [PROG-75](https://linear.app/general-stuff/issue/PROG-75/wayfinder-data-input-and-content-collections-readiness)  
**Date:** 2026-07-25  
**Scope:** Outline complete. **Landed** as [`.agents/codebase/adr/0003-content-collections-and-sync.md`](../../.agents/codebase/adr/0003-content-collections-and-sync.md) (0002 was already Starwind hybrid). Draft text below is historical; prefer the Accepted ADR on disk.

---

## 1. Question

What decisions must the ADR that supersedes [ADR 0001: Content as code](../../.agents/codebase/adr/0001-content-as-code.md) record when sync + Content Collections replace long-term `src/data/*.ts`?

---

## 2. Grill locks

| Q | Decision |
| --- | --- |
| Q1 — ADR scope | **Single umbrella ADR:** live store (Collections/loaders) + thin exclusive adapter + Input/sync (GitHub API, `GITHUB_TOKEN`, fail-closed, bootstrap). |
| Q2 — Normative depth | **Architecture locks + pointers:** Decision names agent-facing laws; schema/algorithm detail stays normative in PROG-75 / PROG-76 / PROG-79 / PROG-80 Answers and research assets. |
| Q3 — Must-include list | **Accept all 10** Decision bullets below. |

---

## 3. Contrast with ADR-0001

| ADR-0001 (current) | Superseding ADR (target) |
| --- | --- |
| Content in typed TS modules `src/data/*.ts` | Live store in `src/content/**` via Content Collections |
| No fetch / CMS / DB | Allowed fetch: Bun + GitHub API sync only (fail-closed, `GITHUB_TOKEN`) |
| Pages via `src/content/adapter.ts` | Same thin exclusive adapter; pages still never import store internals (`astro:content`) |
| Default content path: edit `src/data/*.ts` | Edit / sync into `src/content/**`; `src/data/*.ts` interim until post-map conversion |

---

## 4. Must-include Decision laws (accepted)

1. **Live store** — `src/content/**` via Astro Content Collections (not long-term `src/data/*.ts`).
2. **Loaders assemble** — Content Layer loaders own domain-shaped collection `data` (FM + body + sidecars/assets).
3. **Thin exclusive adapter** — getters only (`getProfile` / `getProjects` / `getProjectById` / `getFeaturedProjects` + brand-catalog assert); pages must not import `astro:content`.
4. **Domain types** — `src/content/types/` for islands.
5. **Status SoT** — `status` lives in `project.md` frontmatter; FM must not carry `version` / `releaseDate`.
6. **git-meta sidecar** — optional at read (missing → synthesize `unreleased` + load/build-now); present → strict `{version, releaseDate}`; invalid → fail-closed; fixtures preferred-include; sync zero-tag writes same placeholders (pointer: PROG-80).
7. **Input/sync** — Bun fetch + GitHub API; secret name `GITHUB_TOKEN`; fail-closed (except zero-tag placeholder write); `sync.config.ts` (pointer: PROG-76 / map locks).
8. **Bootstrap** — committed fixtures under `src/content/**`; sync overwrites regenerable paths; `src/data/*.ts` conversion is post-map implementation (interim until then).
9. **Profile** — single-entry collection (pointer: PROG-78).
10. **Supersession** — this ADR supersedes ADR-0001; retire “no fetch / edit only `src/data/*.ts`” agent rules in favor of the above.

---

## 5. Normative detail pointers (not restated in Decision)

| Topic | Canonical source |
| --- | --- |
| Folder trees, FM required/optional, sync.config shape | PROG-75 Notes / deferred brief §1 |
| Live field → file homes | [prog-77-live-fields-to-data-layer-schemas.md](./prog-77-live-fields-to-data-layer-schemas.md) |
| GitHub API, auth headers, tags → dates | [prog-76-github-api-private-folder-sync-and-tag-metadata.md](./prog-76-github-api-private-folder-sync-and-tag-metadata.md) |
| Profile single-entry collection | PROG-78 Answer |
| Adapter keep + loader assembly seat | PROG-79 Answer |
| `git-meta.json` schema + merge / synthesize rules | PROG-80 Answer |

---

## 6. Draft ADR text (for future landing)

> **Landing note:** Landed as `.agents/codebase/adr/0003-content-collections-and-sync.md` (Accepted). ADR-0001 is Superseded.

---

# ADR 0002: Content Collections store + GitHub sync

**Status:** Proposed (supersedes [ADR 0001](../../.agents/codebase/adr/0001-content-as-code.md) when Accepted and landed)

## Context

ADR-0001 stored portfolio content as typed TypeScript modules in `src/data/*.ts`, with a thin adapter for pages and an explicit ban on fetch/CMS. The Data / Input / Content Collections map (PROG-75) replaces that long-term model: on-disk markdown and sidecars under `src/content/**`, Astro Content Collections with loaders that assemble domain-shaped data, optional GitHub API sync into that tree, and the same exclusive adapter seam for pages.

Alternatives considered:

1. **Keep typed TS modules (ADR-0001)** — simplest compile-time checks; no sync story; blocked private-folder + tag metadata workflow.
2. **Headless CMS** — out of scope for a developer-authored personal portfolio; adds network/runtime dependency.
3. **Collections + loaders + thin adapter + GitHub sync (chosen)** — content-as-files with Zod/Collections validation, regenerable sync, stable page import surface.

## Decision

Adopt a **single umbrella** architecture:

1. **Live store** is `src/content/**` via Astro Content Collections — not long-term `src/data/*.ts`.
2. **Content Layer loaders** assemble domain-shaped collection `data` (frontmatter, body, sidecars, assets). Pages do not perform that merge.
3. A **thin exclusive adapter** remains the only page/shell import surface: getters only (`getProfile`, `getProjects`, `getProjectById`, `getFeaturedProjects`, plus brand-catalog assert). Pages and shell must **not** import `astro:content`.
4. **Domain types** for islands live under `src/content/types/`.
5. **Status source of truth** is `project.md` frontmatter. Frontmatter must **not** contain `version` or `releaseDate`.
6. **`git-meta.json`** is an optional sidecar at read: missing → synthesize `{ version: "unreleased", releaseDate: <ISO now at load/build> }`; when present, strict `{ version, releaseDate }`; present-but-invalid → fail-closed. Fixtures preferred-include a committed sidecar. Sync with zero tags writes the same placeholders. Exact schema and tag-selection algorithms: PROG-80 (and PROG-76 for API provenance).
7. **Input/sync** uses Bun `fetch` + GitHub API, config in `sync.config.ts`, secret name `GITHUB_TOKEN` (local `.env` / CI). Sync is **fail-closed**, except the locked zero-tag placeholder write. Details: PROG-76 + PROG-75 Notes.
8. **Bootstrap:** commit fixtures under `src/content/**`; sync may overwrite regenerable paths. Conversion of `src/data/*.ts` into that layout is **post-map implementation**; until then `src/data/*.ts` remains interim live content.
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
- Builds depend on committed fixtures (and optionally a prior sync); invalid sidecars fail the build.
- Two SoTs during interim: `src/data/*.ts` until post-map conversion completes.

**Neutral:**

- Adapter filename may stay `adapter.ts` or be renamed later; exclusivity matters more than name.
- Exact package-script / CI job paths remain implementation detail (same script local+CI; fail-closed).

## Agent implications

- **Do not** add CMS clients, ORMs, or ad-hoc runtime content fetch outside the locked GitHub sync path without reopening this ADR.
- **Do not** import `astro:content` (or `src/data/*` after conversion) from `.astro` pages — use the adapter getters.
- **Do not** put `version` / `releaseDate` in `project.md` frontmatter; status stays in FM.
- **Default content path (target):** edit or sync into `src/content/**`. Until conversion lands, interim edits may still touch `src/data/*.ts` — do not treat that as the long-term store.
- **Sync:** require `GITHUB_TOKEN`; fail closed on errors (except zero-tag placeholder write per PROG-80).
- When this ADR is Accepted and landed, mark ADR-0001 **Superseded** and point here.

## Notes

Hard to reverse without migrating files back to TS modules and dropping sync. Trade-off favors Collections + sync for private project folders and tag-derived release metadata while preserving the adapter seam from ADR-0001.

Landed filename: `.agents/codebase/adr/0003-content-collections-and-sync.md`.

---

## 7. Out of scope for this asset (historical)

- ~~Landing the ADR under `.agents/codebase/adr/`~~ (done as 0003)
- Implementing sync, Collections, loaders (PROG-62 wave)
- Starwind / PROG-34 / `presentation?` (presentation flags later **Canceled** — PROG-85)
