# Portfolio Site

A static portfolio that showcases a person's profile and their project work. Site content lives under `src/content/**` (Astro Content Collections + optional GitHub sync) — there is no CMS, database, or user accounts.

## Language

### Person & identity

**Profile**:
The person the site represents — bio, skills, experience, certifications, and contact links.
_Avoid_: User, account, owner

**Featured project**:
A project marked to appear on the home page carousel. Not a separate entity — it is a `Project` with `featured: true`.
_Avoid_: Highlight, spotlight item

### Work showcase

**Project**:
A piece of work being showcased — title, summary, markdown description, metadata, tech stack, and optional architecture diagram.
_Avoid_: Portfolio item, case study, work entry

**Project id**:
The URL slug that uniquely identifies a project (e.g. `atlas-deploy` → `/projects/atlas-deploy`).
_Avoid_: Slug (when you mean the domain concept, not the URL mechanic), key

**Associated project**:
Another project linked from a project's detail page via the `associated` id list. A navigational relationship, not a dependency graph.
_Avoid_: Related work, sibling project

### Classification

**Category**:
One of three discipline tags on a project: `devops`, `web`, or `ml`. Shown near the title; filterable on the projects list.
_Avoid_: Type (reserved for the free-form `type` field), domain, tag

**Type**:
A free-form label describing what kind of thing the project is (e.g. "Deployment platform", "Website"). Shown in the Properties sidebar; not filterable.
_Avoid_: Category, kind

**Status**:
Where a project sits in its lifecycle: `dev → alpha → beta → prod → archived`. Ordered by `STATUS_ORDER`; filterable and sortable. **Display** (dot color + compact/prose labels) is presentation — CSS `--status-*` / `.status-dot` and `src/lib/status-display.ts` — not content fields.
_Avoid_: Stage, phase, maturity

**Release date**:
The ISO date (`yyyy-mm-dd`) of the project's latest release. The single sort key for project lists.
_Avoid_: Updated at, created at, prod date

### Architecture visualization

**Architecture graph**:
The `{ nodes, edges, steps }` structure attached to a project. Powers the interactive diagram and accordion on the detail page.
_Avoid_: Flowchart, pipeline diagram, system diagram

**Architecture step**:
One node in the graph with a title and detail text. Its `id` must match a corresponding node `id` so the diagram and accordion stay in sync.
_Avoid_: Stage, phase, component

**architecture.json**:
Optional per-project sidecar with `{ nodes, edges, steps }` assembled into `Project.architecture`. Omit when there is no graph.
_Avoid_: arch() (removed with the old `src/data` store)

### Discovery & filtering

**Search token**:
A structured fragment in the projects search bar (e.g. `tech:"React"`, `status:prod`, `year:2024`). Parsed by the toolbar into filter criteria.
_Avoid_: Filter string, query param, search filter

**Toolbar state**:
The filter/sort/link criteria on the projects list page. Filter criteria sync to URL search params (`q`, `cat`, `sort`, `statuses`, `techs`, `gh`, `live`, `from`, `to`); `view` is local-only (`projects:view` in `localStorage`).
_Avoid_: Filter state, query state

**Ambient mode**:
Per-theme decorative backdrop mode cycled from the navbar (`off` / `glow` / `stars` in dark; `off` / `shapes` in light). Persisted in `ambient-mode-dark` / `ambient-mode-light`.
_Avoid_: Background animation, wallpaper

**Motion preference**:
Effective motion on `<html data-motion="full|reduced">`. Persist only an explicit user choice in `localStorage` key `motion` (`reduced` | `full`); if unset, OS `prefers-reduced-motion: reduce` ⇒ reduced. Stored `full` overrides OS reduce until the user turns motion Off. See `src/lib/motion-preference.ts`.
_Avoid_: Animation toggle, a11y motion

### Profile presentation

**Learning signal**:
Optional content marker (`learning: true`) on experience/skill-like items, shown only when build-time `LEARNING_SIGNALS_ENABLED` is on. Gating lives in `src/content/learning-signals.ts` / profile-display helpers.
_Avoid_: Badge, training flag, WIP tag
