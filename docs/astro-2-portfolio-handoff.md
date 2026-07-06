# Handoff: Astro Portfolio (astro-2)

**Repo:** `d:\1_progg\2_Projects\GitHub Pages Portfolio\astro-2`  
**Remote:** `https://github.com/MysteryMan11/portfolio.git`  
**Date:** 2026-07-06

---

## Where things stand

Work in this session was **design and configuration only** — no implementation PR, no schema migration, no sync refactor landed in code.

Three phases completed:

1. **Agent skills setup** — per-repo engineering skill config scaffolded.
2. **Domain grilling** (`/grill-with-docs`) — portfolio vocabulary and v1 scope locked in `CONTEXT.md`.
3. **Codebase design** (`/codebase-design`) — deep-module architecture proposed for the content pipeline; manually reverified after parallel design sub-agents could not run (usage limits).

**Next session should implement** (user has not yet chosen whether to start with `schema.ts` or an ADR).

---

## Artifacts to read first (do not re-derive)

| Artifact | Path | What it contains |
|---|---|---|
| Domain glossary + v1 decisions | `CONTEXT.md` | Canonical terms: IDs, categories, status, homepage, related projects, sync scope, static-site constraints |
| Agent skill config | `AGENTS.md` | Pointers to `docs/agents/*.md` |
| Issue tracker conventions | `docs/agents/issue-tracker.md` | GitHub Issues via `gh`; PRs not a triage surface |
| Triage labels | `docs/agents/triage-labels.md` | Default five labels |
| Domain doc rules | `docs/agents/domain.md` | Single-context layout |
| Source of truth (content) | `docs/new-source-of-truth/content-inputs.md` | Per-repo inputs, git-derived fields, field definitions |
| Architecture flow (model vs code) | `docs/new-source-of-truth/architecture-flow.md` | Sync → collections → app pipeline; divergences from informal model |
| Source of truth (UI) | `docs/new-source-of-truth/design-guidelines.md` | Page/section specs; filter/sort/search explicitly deferred |
| Post-AI fix list | `docs/things-to-improve-after-AI.md` | Bugs and UI gaps (theme toggle, fonts, hero, cards, etc.) |
| Project authoring template | `docs/new-source-of-truth/Project_Template.md` | `project.md` shape including `## Project Category` |

**Not yet created:** `docs/adr/0001-portfolio-content-module.md` (proposed, user did not confirm).

---

## Agreed domain decisions (summary — full detail in `CONTEXT.md`)

- **Project IDs:** category-neutral (`PROJ-001`); no `-BE-`/`-DO-` encoding; no status suffixes in IDs.
- **Categories:** `devops` / `webapp` / `mlops` slugs; declared in `project.md`, never inferred from ID.
- **Status:** `dev` / `alpha` / `beta` / `rc` / `prod` / `archived`; git-derived at sync, not in `project.md`.
- **Homepage projects:** single row of 3, most recent by release date; no `featured` flag.
- **Related projects:** bidirectional list (title + category); normalized at sync; section hidden when empty.
- **Hero:** copy from `portfolio.md`; 3 category cards are static UI copy.
- **Experience:** About page only for v1.
- **Out of portfolio scope:** `resume-points.md`, `setup.md` in project repos.
- **v1 Projects page:** header + 3-column grid only — **no** filter/sort/search (phase 2+).
- **Architecture:** React Flow diagram required per project; sourced from `architecture.tsx` at sync.
- **Sync:** runs before every build (local + CI).
- **Static site:** SSG only; `astro:env` for `PUBLIC_SITE_URL` + `PUBLIC_BASE_PATH` only; Beasties = critical CSS inlining.

---

## Agreed codebase design (summary — not yet implemented)

**Recommended module layout** (build-time vs runtime separation):

```
lib/portfolio/
├── schema.ts          ← Zod + types; imported by content.config.ts AND sync
└── sync/
    ├── index.ts       ← syncPortfolio() — external seam
    ├── parse-project.ts
    ├── parse-personal.ts
    ├── git-release.ts ← status (git notes), version (tags), release-date rules
    ├── relations.ts   ← bidirectional graph normalization
    ├── assets.ts      ← preview.png, architecture.tsx
    └── adapters/      ← GitHub HTTP (prod) + fixture (tests)

src/lib/portfolio/
├── query.ts           ← queryProjects(), getProjectDetail(), getPersonal()
└── display.ts         ← category/status labels + colors (from utils.ts)

tests/portfolio/       ← mirrors lib/portfolio/ structure

scripts/sync-content.ts  ← thin CLI calling syncPortfolio()
```

**Principles:** pages should not call `getCollection` directly; domain rules live behind `query.ts`. `pages.ts` wrapper is optional until phase-2 filters.

**Reverification findings** (confirmed in code):

| Issue | Location |
|---|---|
| `categoryFromId()` still infers category | `scripts/sync-content.ts` ~L324 |
| `featured: true` hardcoded | `scripts/sync-content.ts` ~L340 |
| Parser does not read `## Project Category` | `scripts/sync-content.ts` `parseMarkdown()` |
| Schema drift (`backend`, PascalCase status) | `src/content.config.ts` |
| Related projects card inverted (`=== 0`) | `src/pages/projects/[slug].astro` ~L225 |
| v1 category filter tabs exist (should remove) | `src/pages/projects/index.astro` |
| Homepage: 3 category scrollers (should be 3 recent) | `src/pages/index.astro` |
| Status from tag prerelease, not git notes | `scripts/sync-content.ts` `statusFromPrerelease()` |
| Release date = latest tag only; CONTEXT rules not implemented | `scripts/sync-content.ts` `fetchReleaseInfo()` |
| Architecture: per-project synced JSON via `getArchitectureData()` | `src/lib/portfolio/query.ts`, `lib/portfolio/sync/assets.ts`, `src/content/projects/*/architecture.json` |

---

## Suggested implementation order

1. `lib/portfolio/schema.ts` — align enums with `CONTEXT.md` (`webapp`, lowercase status, drop `featured`)
2. Update `src/content.config.ts` to import schema from `@portfolio/schema`
3. Extract `lib/portfolio/sync/` from monolithic `scripts/sync-content.ts`
4. Add `git-release.ts` implementing git-notes status + release-date rules per `content-inputs.md`
5. Add `relations.ts` for bidirectional related-project normalization
6. Add `query.ts`; refactor pages to use it
7. Fix known bugs (related card condition, remove v1 category tabs, homepage 3-recent)
8. Architecture asset pipeline (`architecture.tsx` → synced output) — hardest; required before v1 per `CONTEXT.md`

---

## Open questions for the user

- Start with **`schema.ts` implementation** or **`docs/adr/0001-portfolio-content-module.md`** first?
- Git status source: `content-inputs.md` says **git notes** for status; current sync uses **tag prerelease**. Implementation should follow `content-inputs.md` unless user revises.

---

## Suggested skills

Invoke these in the fresh session depending on task:

| Skill | When |
|---|---|
| `.agents/skills/implement/SKILL.md` | Starting schema/sync/query implementation |
| `.agents/skills/codebase-design/SKILL.md` | Refining module seams during refactor |
| `.agents/skills/domain-modeling/SKILL.md` | Resolving terminology conflicts or updating `CONTEXT.md` |
| `.agents/skills/astro/SKILL.md` | Content collections, pages, build hooks, `astro:env` |
| `.agents/skills/starwind-ui/SKILL.md` | UI component work during page refactors |
| `.agents/skills/frontend-design/SKILL.md` | Hero, cards, layout, typography fixes |
| `.agents/skills/diagnosing-bugs/SKILL.md` | Theme toggle on route change, font preview vs dev |
| `.agents/skills/tdd/SKILL.md` | Tests for sync parser, git-release rules, relations graph |
| `.agents/skills/to-issues/SKILL.md` | Breaking work into GitHub issues (tracker configured in `docs/agents/`) |
| `.agents/skills/code-review/SKILL.md` | Review after implementation branch is ready |

---

## User preferences noted

- Use **Cursor question popup** (`AskQuestion`) for grilling / discrete choices going forward.
- **Do not implement** until user confirms after grilling; they wanted codebase-design before implementation.
- **Do not commit** unless explicitly asked.
- Lower-trust docs: `docs/legacy/` (older notes, React reference, deferred feature research); prefer `docs/new-source-of-truth/` + `CONTEXT.md`.

---

## Commands reference

```bash
pnpm sync          # runs scripts/sync-content.ts (prebuild + dev)
pnpm dev           # sync then astro dev
pnpm build         # astro check + build + beasties postbuild
```

Generated content lives in `src/content/` (gitignored). Authoring inputs: `content-sources/projects/`, `portfolio.md`, `projects-config.json`.
