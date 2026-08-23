---
id: portfolio
title: Personal Project Portfolio
summary: A static Astro portfolio that syncs project and profile content from
  GitHub remotes at build time and ships to GitHub Pages.
category: web
type: Static site
status: beta
techStack:
  - Astro
  - Bun
  - GitHub Actions
  - React
  - Tailwind
  - TypeScript
featured: true
links:
  github: https://github.com/AxiomKnox/portfolio
  live: https://axiomknox.github.io/portfolio
preview: grad-4
---

This site — a content-driven personal portfolio compiled as a static Astro app and deployed to **GitHub Pages**. There is no CMS, database, or runtime API: profile and project copy live as Markdown (plus optional sidecars) in Git, and pages only read through a typed content adapter.

## Content & sync

- **Committed fixtures** under `src/content/placeholder/` for local/dev (`bun run sync:dev`).
- **Live trees** `src/content/projects/` and `src/content/profile/` are generated (gitignored) by sync.
- **Prod sync** (`bun run sync`) pulls known folders from private/public GitHub remotes listed in `sync.config.ts` (this repo’s own `portfolio/` folder is one of those remotes). Version / release date for each project come from git tags → `git-meta.json`, not from frontmatter.
- Each remote project contributes at least `project.md` (optional `architecture.json`, optional preview image). Domain shape is assembled by Astro Content Collections loaders into typed `Project` / `Profile` entries.

## UI & stack

- **Astro SSG** for pages and chrome; **React islands** where interactivity matters (projects toolbar/filters, architecture diagram, etc.).
- Hybrid UI: Starwind-oriented static shell + **shadcn / Base UI** patterns for interactive pieces; **Tailwind v4** tokens in `src/styles.css`.
- Projects index supports category / status filters, tech and search tokens, and sort — pure helpers in discovery code, URL state owned by the toolbar island.
- Optional per-project architecture graphs (`architecture.json` → React Flow island). Detail pages render Markdown descriptions with GFM via `marked`.

## Tooling & ship

- Package manager: **Bun**. Lint/format with Biome; unit tests under root `tests/` (`bun test`).
- CI on PR / catch-up pushes; deploy workflow syncs then builds to Pages (`ASTRO_SITE` / `ASTRO_BASE`, token for private remotes).

## Design goals

- **Content as code** — edits are PRs, not a CMS admin UI.
- **Fail-closed sync** — missing required remote files, bad enums, or ambiguous preview assets abort rather than ship half-broken pages.
- **One adapter** — pages import from `src/content/adapter.ts`, not raw collections, so the store can evolve behind a stable API.
