# Agent codebase docs

**Audience:** AI agents and coding assistants working in this repo.
**Not for:** Human design reference — use [`docs/`](../docs/README.md) for that.

## Read order

1. **This file** — routing and constraints (30 seconds)
2. [`architecture.md`](./architecture.md) — system map, file index, task playbooks
3. [`CONTEXT.md`](./CONTEXT.md) — domain glossary; use these terms in issues and code
4. [`adr/`](./adr/) — architectural decisions; do not contradict without flagging

Optional deep dives:
- [`route-trace.md`](./route-trace.md) — end-to-end `/projects/[id]` flow
- [`module-seams.md`](./module-seams.md) — where complexity lives and why

## Quick facts

| Fact | Value |
| --- | --- |
| App type | Static portfolio (Astro SSG, no runtime API) |
| Content source | Live roots `src/content/projects/` + `profile/` (generated, gitignored) via Collections + loaders; committed fixtures in `src/content/placeholder/`; pages read only through `src/content/adapter.ts` ([ADR 0003](./adr/0003-content-collections-and-sync.md)) |
| Sync | Prod: `bun run sync` (`sync.config.ts` → GitHub). Dev: `bun run sync:dev` / `sync:dev:all` (`sync.config.dev.ts` fixtures ± prod project remotes). Secret `GITHUB_TOKEN` (CI deploy: `PORTFOLIO_GITHUB_TOKEN`) |
| Routes | `src/pages/*.astro` (Astro file-based routing) |
| Database | None |
| Auth | None (sync token only for build-time GitHub fetch) |
| CMS | None |
| Package manager | Bun preferred (`bun.lock`) |
| CI | `.github/workflows/ci.yml` — lint/check/test/build on PR + catch-up/`main` push |
| Deploy | `.github/workflows/deploy.yml` — sync then build → GitHub Pages on `main` (`ASTRO_SITE` / `ASTRO_BASE`; secret `PORTFOLIO_GITHUB_TOKEN`) |
| Human docs | `docs/` (design system, layouts, components, data schemas) |
| Linear project | **Personal Project Portfolio** — id `personal-project-portfolio-027014ac53c4` (scope Linear lookups here; see [`.cursor/rules/linear-project.mdc`](../../.cursor/rules/linear-project.mdc)) |

## Task routing

| If the task is… | Start here | Usually touch |
| --- | --- | --- |
| Change site copy / add Project | Edit `src/content/placeholder/projects/<id>/` then `bun run sync:dev`, or fill remotes + `bun run sync` / `sync:dev:all` | Live roots are generated; pages consume via adapter |
| Profile / early-career / certs visibility | `src/content/placeholder/profile/` (+ `sync:dev`) + `src/content/profile-display.ts` | Adapter re-exports helpers to pages |
| Learning-signal gating | `src/content/learning-signals.ts` + profile-display | Env `LEARNING_SIGNALS_ENABLED`; marker `learning: true` |
| Change page layout / chrome | `src/pages/*.astro`, `src/layouts/Layout.astro` | Astro file routes — not `src/routes` / `SiteShell`; VT: persist Navbar/Footer, prefs via `site-prefs-client` |
| Change filter / Search token / Toolbar state | `src/lib/project-discovery.ts` + toolbar/island | Pure helpers in discovery; island owns URL sync |
| Change Category / Status filters | `src/content/types/project.ts` + toolbar/island | Keep `STATUS_ORDER` aligned; Status **display** via `status-display.ts` + `--status-*` / `.status-dot` |
| Change Architecture graph | `architecture.json` under project folder + `ProjectArchitectureIsland` | Keep `ArchStep.id === ArchNode.id`; one island |
| SEO helpers (canonical / JSON-LD / robots / llms) | `src/lib/site.ts`, `src/lib/jsonld.ts`, Layout, `robots.txt.ts` / `llms.txt.ts` | Do not invent a CMS feed |
| Change colors/tokens | `src/styles.css` | [`docs/design-system.md`](../docs/design-system.md) |
| Sync remotes / git-meta | `sync.config.ts`, `sync.config.dev.ts`, `src/sync/*` | Prod fail-closed + token; `sync:dev` needs no token |
| Add backend/API/CMS | **Stop** — none exists; needs new ADR + infrastructure |
| UI hybrid (Starwind vs shadcn) | [`adr/0002-astro-starwind-shadcn-hybrid.md`](./adr/0002-astro-starwind-shadcn-hybrid.md) | |

Stale paths to ignore as current truth: TanStack Router, `src/routes/*`, `SiteShell`, `router.tsx` / `__root.tsx`, React Query loaders, `src/data/*.ts` as live store.

## Agent constraints

- **Content store** — live `src/content/projects|profile` (generated) + Collections loaders; committed SoT under `src/content/placeholder/`; sync may overwrite live roots ([`adr/0003-content-collections-and-sync.md`](./adr/0003-content-collections-and-sync.md))
- **Pages call the adapter** — import from `src/content/adapter.ts`, not `astro:content`, in pages/shell
- **Domain types** — `@/content/types` (not a deleted `src/data` path)
- **No hardcoded colors** — use tokens from `src/styles.css`
- **Use domain terms** from `CONTEXT.md`; avoid synonyms listed under `_Avoid_`
- **First-party docs** in `docs/` describe UI/design behavior — read when changing presentation; keep them in sync with behavioral changes
- **Base path** — internal links/assets use `withBase()`; absolute/canonical via `src/lib/site.ts`; local `ASTRO_BASE=/`, CI `/repo-name`

## First-party docs (human-maintained)

| Doc | Use when |
| --- | --- |
| [`docs/data-model.md`](../docs/data-model.md) | Project/Profile field definitions |
| [`docs/components.md`](../docs/components.md) | Component props and behavior |
| [`docs/layouts.md`](../docs/layouts.md) | Page wireframes |
| [`docs/design-system.md`](../docs/design-system.md) | Tokens, typography, theme |
| [`docs/filtering-search.md`](../docs/filtering-search.md) | Search token grammar |

Do not duplicate first-party docs here. Link to them when relevant.
