# Portfolio

A static personal portfolio site. Content is authored in per-repo `project.md` files, synced at build time, and rendered as Astro content collections deployed to GitHub Pages.

## Language

**Project**:
A piece of work showcased on the portfolio — one repo (or monorepo boundary) with its own `project.md`, preview image, and optional architecture diagram.

_Avoid_: Case study, portfolio item

**Project Id**:
A stable, category-neutral identifier for a project (e.g. `PROJ-001`, `PROJ-002`). Assigned once and never reused. Category and lifecycle state are **not** encoded in the id.

_Avoid_: `PROJ-BE-001`, `PROJ-DO-001` (category-in-id patterns)

**Project Category**:
The high-level domain of a project, declared explicitly in `project.md` under Properties — not inferred from the id. Exactly three values:

| Display | Slug |
|---|---|
| DevOps | `devops` |
| WebApp | `webapp` |
| ML / MLOps | `mlops` |

_Avoid_: `backend`, deriving category from id prefixes like `-BE-` or `-DO-`

**Project Status**:
The lifecycle state of a project, derived at sync time from git notes/tags on the latest `main` commit — never hand-edited in `project.md` and never encoded in the project id.

| Slug (schema / sync) | Display | Meaning |
|---|---|---|
| `dev` | Dev | Active development, no release tag yet |
| `alpha` | Alpha | Early release, below v1 |
| `beta` | Beta | Feature-complete, pre-prod |
| `rc` | RC | Release candidate |
| `prod` | Production | v1.0.0+ shipped |
| `archived` | Archived | No longer maintained |

_Avoid_: `Development`, `Production` (PascalCase schema values), status suffixes in ids like `-PROD` or `-ALPHA`

**Homepage Project Showcase**:
The three project cards on the homepage — a single row, no category grouping. Shows the 3 most recently released projects (by release date rules below). No `featured` flag in `project.md`; recency is the only selection criterion.

_Avoid_: Per-category horizontal scrollers on the homepage, manual `featured: true` curation

**Related Project**:
Another portfolio project linked to this one (e.g. a WebApp and its DevOps deployment repo). Declared in `project.md` under Project Relations. Displayed as a bidirectional list on the project detail page — title + category, linking to the other project's page. Sync normalizes the graph so if A lists B, both pages show each other. Section omitted when empty.

_Avoid_: Associated project, one-way-only links without sync normalization

**Release Date**:
The date used for sorting and display, derived at sync time from git tag commit dates — never hand-edited.

- **`prod` or `archived`**: use the first `v1.x.x` release date, or the latest production release date (whichever the display logic calls for — prod dates stay stable across patch releases).
- **Pre-prod** (`dev`, `alpha`, `beta`, `rc`): use the latest tag's commit date below `v1.0.0`.

Homepage "3 most recent" ordering uses this date.

_Avoid_: Date added to portfolio, first commit date, always-latest-tag regardless of status

**Hero Content**:
The homepage hero section's personal copy — full name, tagline, and supporting text — sourced from `portfolio.md` via the personal content collection. The three category cards (DevOps / WebApp / ML / MLOps) are static UI copy describing areas of work, not project data.

_Avoid_: Hardcoded headline copy in components, pulling only partial fields from portfolio.md

**Experience**:
Work history entries sourced from `portfolio.md`, displayed on the About page only — not on the homepage for v1.

_Avoid_: Homepage experience timeline (deferred)

**Portfolio Content** (per project repo):
What the portfolio syncs and displays. Only `project.md`, `preview.png`, and `architecture.tsx` — plus git-derived metadata (version, status, release date). Files like `resume-points.md` and `setup.md` may exist in project repos but are **out of portfolio scope** — never synced, never rendered.

_Avoid_: Treating resume bullets or setup requirements as portfolio content

**v1 Projects Page**:
Header + project card grid (3 per row). No filter, sort, search, list view, or URL query params — explicitly deferred to phase 2+.

_Avoid_: Implementing Notion-style table UI before launch

**Project Architecture**:
Interactive React Flow diagram with accordion steps on the project detail page. **Required for every project** before v1 launch — sourced from `architecture.tsx` in each project repo.

_Avoid_: Optional/hidden architecture section, static image-only fallback for v1

**Content Sync**:
`sync-content.ts` runs before every build — both local `pnpm dev`/`pnpm build` and CI. Pulls `project.md`, `preview.png`, `architecture.tsx`, and git-derived metadata from configured remote repos into `src/content/`.

_Avoid_: CI-only sync, manual sync without build hook

**Static Site**:
Fully static site generated at build time, deployed to GitHub Pages — no Node server, no runtime secrets, no client-side env access beyond public build-time values. `astro:env` is used only for `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` (GitHub Pages base path). Beasties is a post-build critical CSS inliner, not env management.

_Avoid_: t3-env, runtime secrets, server components, treating Beasties as env tooling
