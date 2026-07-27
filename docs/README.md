# Documentation

A static, content-driven portfolio built on **Astro** (SSG) + React islands +
Tailwind v4. Collections loaders read **live** trees under
`src/content/projects/` and `src/content/profile/` (generated, gitignored).
Committed fixtures live in `src/content/placeholder/`. Pages read only through
`src/content/adapter.ts`. See [ADR 0003](../.agents/codebase/adr/0003-content-collections-and-sync.md).

## How the docs are organized

| File | What it covers |
| --- | --- |
| [`design-system.md`](./design-system.md) | Foundations → Components → Patterns; tokens, type, status, preview gradients, Starwind hybrid note |
| [`layouts.md`](./layouts.md) | Page-by-page UI/UX breakdown with ASCII wireframes |
| [`components.md`](./components.md) | Catalog of every custom component — props, intent, behavior |
| [`data-model.md`](./data-model.md) | `Project` / `Profile` schemas, Content Collections layout, status progression |
| [`filtering-search.md`](./filtering-search.md) | Toolbar state, search token grammar, filter categories, active chips |
| [`utilities.md`](./utilities.md) | Tech-icon resolver, `parseQuery`, `formatDate`, `sortDate`, `cn`, `use-mobile` |
| [`guides/`](./guides/README.md) | Set up remotes for sync — [new project](./guides/new-project-remote.md), [existing project](./guides/existing-project-remote.md), [profile](./guides/profile-remote.md) |
| [`deferrals/`](./deferrals/README.md) | Active deferrals only (process TBD); completed/canceled stay elsewhere |
| [`changes.md`](./changes.md) | Slim agent-updated log of material changes + why |

## How to update

- **Local fixtures** — edit `src/content/placeholder/projects/<id>/` or
  `placeholder/profile/`, then `bun run sync:dev` to materialize live roots.
- **Prod remotes** — configure `sync.config.ts` + `GITHUB_TOKEN`, then
  `bun run sync` (wipes live roots, fetches remotes). Deploy CI uses this only.
- **Mixed local** — `bun run sync:dev:all` materializes fixtures, then overlays
  project remotes from `sync.config.ts` (remote wins on id clash; profile stays fixture).
- Pages and chrome (`Layout`, Navbar, Footer, titles) read identity via
  `getProfile()` — do not hardcode the person’s name in page templates.
- Visual tokens live in `src/styles.css`. Never hardcode colors in
  components; add tokens and reference them.
- These docs live next to the code — update them in the same commit that
  changes behavior.

## Tech quick reference

- **Framework**: Astro 7 SSG (`src/pages/*.astro`) + React islands (`@astrojs/react`)
- **Content**: Content Collections + custom loaders → `src/content/adapter.ts`
- **Sync**: `bun run sync` (prod); `bun run sync:dev` / `sync:dev:all` (fixtures ± remotes); configs `sync.config.ts` + `sync.config.dev.ts`; secret `GITHUB_TOKEN` (CI deploy: `PORTFOLIO_GITHUB_TOKEN`)
- **Build**: Astro + Bun; lint via Biome (`bun run lint`)
- **Styling**: Tailwind v4 (`@import "tailwindcss"` in `src/styles.css`),
  Starwind/static shell + shadcn React islands, `@tailwindcss/typography` for prose
- **Fonts**: Geist via `astro:assets` `Font` (`--font-geist`, `--font-geist-mono`)
- **Images**: `astro:assets` via `src/lib/content-images.ts` for project previews /
  profile photo; otherwise `GradientPreview` tokens
- **Diagrams**: `reactflow` (Architecture graph island)
- **Markdown**: `marked` (GFM) at build time via `src/lib/markdown.ts`
- **Icons**: `unplugin-icons` + `@iconify-json/lucide` via `icon-catalog` / `UiIcon` (and `~icons/lucide/*` in `ui/*`); brand/tech via Iconify `devicon` / `logos` / `simple-icons` + `BrandIcon`. No `lucide-react`.
