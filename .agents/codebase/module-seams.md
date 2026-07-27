# Module seams & depth

Agent reference for where to put changes and which modules earn their keep.

Uses deep-module vocabulary: **interface** = what callers must know; **depth** = behavior per unit of interface; **seam** = where behavior can change without editing callers.

> **Current stack:** Astro SSG pages + React islands. Content Collections + optional GitHub sync ([ADR 0003](./adr/0003-content-collections-and-sync.md)). There is no TanStack Router, no `src/routes/`, no `SiteShell`, no runtime SSR error layer, and no live `src/data/*.ts` store.

## Layer map

| Module | Seam | Depth | Agent guidance |
| --- | --- | --- | --- |
| `src/content/placeholder/projects/<id>/` | Committed project fixtures | **Deep** | Edit here; `sync:dev*` copies into live roots |
| `src/content/projects/<id>/` + loaders/assemble | Live project store → domain `Project` | **Deep** | Generated/gitignored; sync may overwrite |
| `src/content/placeholder/profile/` | Committed profile fixture | **Deep** | Edit here; `sync:dev*` copies into live profile |
| `src/content/profile/` + loaders/assemble | Live profile store → domain `Profile` | **Deep** | Generated/gitignored; single-entry collection |
| `src/content/types/*` | `Project` / `Profile` / `STATUS_ORDER` / `sortDate` | **Shallow** | Shared types for islands and assemble |
| `src/content/adapter.ts` | `getProfile` / `getProjects` / `getProjectById` / re-exports | **Deep** | Pages import here — not `astro:content` |
| `src/sync/*` + `sync.config.ts` / `sync.config.dev.ts` | Remotes / fixtures → live `projects|profile` | **Deep** | Wipe then materialize/fetch; prod needs `GITHUB_TOKEN` |
| `src/content/profile-display.ts` | Experience / cert / learning helpers | **Deep** | About & home empty/early-career presentation |
| `src/content/learning-signals.ts` | `LEARNING_SIGNALS_ENABLED`, `showLearningSignal()` | **Shallow** | Build-time env gate; logic lives in profile-display |
| `src/pages/*.astro` | File-based routes | **Thin** | Compose adapter + layout; avoid business logic |
| `src/layouts/Layout.astro` | title / description / jsonLd / chrome | **Shallow** | HTML shell + `ClientRouter` + Navbar/Footer/AmbientBackground |
| `src/lib/page-transition.ts` | fade / skip / shared-element names | **Shallow** | Pure helpers for VT attrs + `project-*-image/title` |
| `src/lib/site-prefs-client.ts` | VT lifecycle prefs | **Medium** | Theme/motion/ambient bind, nav sync; toggles survive swaps |
| `src/lib/project-discovery.ts` | `ToolbarState` ↔ URL params, Search-token parse, filter+sort | **Deep** | Pure helpers; island + toolbar import — no React |
| `ProjectsPageIsland` | `projects[]` in; URL sync + render | **Deep** | Owns URL sync + view; delegates filter/sort to discovery |
| `ProjectsToolbar` | `ToolbarState` in/out + `projects[]` | **Deep** | Search token UI / suggestions; date helpers from discovery |
| `ProjectArchitectureIsland` | optional `architecture` | **Medium** | Owns `selectedId` sync for diagram + accordion |
| `ArchitectureDiagram` | `architecture`, `selectedId`, `onSelect` | **Medium-deep** | Hides ReactFlow mapping |
| `StepsAccordion` | `steps`, `selectedId`, `onSelect` | **Medium** | Hides accordion wiring |
| `BrandIcon` / `UiIcon` (`icon-renderers`) | `name`, `size`, `className` | **Deep** | Catalog lookup + letter fallback / throw; maps in `icon-catalog` |
| `src/lib/site.ts` + `jsonld.ts` | absolute/canonical URLs + JSON-LD builders | **Medium** | SEO helpers for Layout / pages (not content) |

## Deletion test

| If you delete… | Complexity… |
| --- | --- |
| `src/content/placeholder/**` fixtures | `sync:dev` / local UI has no content unless remotes fill live roots |
| `src/content/adapter.ts` | Pages couple to `astro:content`; Collections swap breaks |
| `ProjectsToolbar.tsx` | Search DSL / chip UI scatters into the projects island |
| `ProjectsPageIsland.tsx` | Filter apply + URL sync land in the `.astro` page |
| `ArchitectureDiagram.tsx` | ReactFlow setup lands in the architecture island |
| `Layout.astro` | Navbar/Footer/meta imports repeat per page (low cost) |

## Key seams (do not break)

### 1. Content seam — Collections via adapter

All site content crosses `src/content/adapter.ts`. Pages and shell components consume the adapter; they do not define content or import `astro:content`.

**Wrong:** hardcode a project title in a page, or `import { getCollection } from "astro:content"` in `.astro`
**Right:** `await getProjects()` / `await getProfile()` / `await getProjectById()` from the adapter

Profile presentation helpers (`experienceTimelineEntries`, `shouldShowCertifications`, `showLearningSignal`) are re-exported from the adapter so pages stay collections-ready.

### 2. Discovery seam — projects list

`src/lib/project-discovery.ts` owns pure `ToolbarState` ↔ URL mapping, Search-token parse, and filter/sort. `ProjectsPageIsland` owns URL sync + view preference. `ProjectsToolbar` owns Search token UI and chip controls. All share `ToolbarState`.

**Wrong:** parse URL params inside `ProjectsToolbar`, re-implement filters in `projects/index.astro`, or duplicate `parseQuery` in the island
**Right:** discovery helpers for parse/filter/URL; island reads/writes search params; toolbar emits `setState` patches

### 3. Selection seam — architecture graph

`ProjectArchitectureIsland` owns `selectedId`. Diagram and accordion are siblings fed the same props. Keep them in **one** island.

**Wrong:** `ArchitectureDiagram` imports or calls `StepsAccordion`, or split into two `client:` islands
**Right:** both receive `(selectedId, onSelect)` from the island parent

### 4. Id contract — architecture graph

`ArchStep.id` must equal matching `ArchNode.id`. Keep ids aligned in `architecture.json` (or assembled graph).

**Wrong:** mismatched ids between diagram and accordion
**Right:** same id string on node and step

### 5. Design token seam — `src/styles.css`

Components reference CSS variables / Tailwind tokens.

**Wrong:** `className="text-[#333]"` in a component
**Right:** `text-muted-foreground` or add a token to `styles.css`

## Content access note

Content is assembled at build by Content Layer loaders into collection entries; pages `await` adapter getters (ADR 0003). There is no React Query and no runtime fetch for site content. Build-time GitHub sync is the only allowed content network path.

Do not add a client data library for static portfolio data unless content moves async (would contradict ADR 0003 without update).

## Complexity budget

Architecturally simple. Non-trivial UI only:

1. `project-discovery` + `ProjectsToolbar` + `ProjectsPageIsland` — Search token DSL + URL sync ([`docs/filtering-search.md`](../../docs/filtering-search.md))
2. Diagram ↔ accordion — shared id contract (see [`route-trace.md`](./route-trace.md))
3. Design system — tokens + `BrandIcon` / `UiIcon` (`icon-catalog` + `icon-renderers`)
4. Profile display — early-career / section visibility / learning-signal gating
5. Sync — fail-closed remotes + `git-meta` merge (see `src/sync/*`)

When stuck, check whether the change belongs in **content fixtures / sync**, **adapter/profile-display** (presentation rules), **toolbar/island** (discovery), or **page** (composition).
