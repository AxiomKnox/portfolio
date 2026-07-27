# T3 — Architecture deepening investigation

**Issue:** [PROG-49](https://linear.app/general-stuff/issue/PROG-49/t3-architecture-deepening-investigation)  
**Date:** 2026-07-22  
**Scope:** Post-port Portfolio Site (Astro SSG). Investigation only — no prune / perf / deepen implementation.  
**Inputs:** `.agents/codebase/` (post-T2), graphify, CodeGraph, package inventory, island/`client:` audit.

Feeds:

- **T4** [PROG-50](https://linear.app/general-stuff/issue/PROG-50/t4-dead-code-and-dependency-prune) — kill-list below  
- **T5** [PROG-52](https://linear.app/general-stuff/issue/PROG-52/t5-performance-budget-pass) — hotspots below  
- **T6** [PROG-51](https://linear.app/general-stuff/issue/PROG-51/t6-deepen-chosen-modules) — deepen candidates below  

---

## 1. Candidate modules to deepen (T6)

Priority is leverage at a small interface (deletion test + seam locality), not “rewrite the UI.”

### P1 — Project discovery (`ProjectsToolbar` + `ProjectsPageIsland`)

| Signal | Evidence |
| --- | --- |
| Size | `ProjectsToolbar.tsx` ≈ **1102 lines / 41KB** — UI, fuzzy suggest, date helpers, Search-token parser |
| Split brain | `parseQuery` lives in the toolbar file but is **called by the island** for filter apply |
| Seam leak | Island (and related React UI) import `@/data/projects` directly — bypasses the content adapter documented in T2 |
| Depth today | Both modules are “deep” in the seams doc, but the **interface is large**: callers must understand `ToolbarState`, URL param keys, and DSL tokens |

**Deepen intent for T6**

1. Extract a small **discovery/filter module** (e.g. `src/lib/project-discovery.ts` or `src/content/project-filter.ts`) with interface roughly:  
   `ToolbarState` ↔ URL params, `parseQuery`, `filterAndSortProjects(projects, state)`.  
2. Keep `ProjectsToolbar` as the Search-token / chip UI only.  
3. Keep `ProjectsPageIsland` as composition + view toggle.  
4. Stop teaching islands `@/data/*`; consume `Project` / `Status` / `Category` via adapter re-exports (or types-only from a shared types module re-exported by the adapter).

**Why first:** highest incidental complexity; unlocks cleaner T4/T5 work on the same surface; matches domain seams Category / Status / Search token / Toolbar.

### P2 — Content adapter as the only content interface

| Signal | Evidence |
| --- | --- |
| Adapter is thin | `getProfile` / `getProjects` / helpers — good shape, little behavior |
| Callers bypass it | Direct `@/data/` imports in `ProjectsPageIsland`, `ProjectsToolbar`, `ProjectCard`, architecture island/diagram/accordion, and `projects/[id].astro` (types + helpers) |

**Deepen intent for T6** (can ship with P1 or as a thin follow-on)

- Re-export all page/island-needed Project types and pure helpers from `adapter.ts`.  
- Treat direct `src/data/*` imports outside `src/content/` + data modules as out of policy (already in agent docs; enforce in code).

**Do not** invent CMS/fetch — ADR-0001 stays.

### P3 — Architecture graph (optional / smaller)

Already a decent seam: island owns `selectedId`; diagram hides ReactFlow. Deepening is mostly **load boundary**, not API shape → prefer **T5** (lazy ReactFlow) over T6. If T6 touches it: re-export `ProjectArchitecture` through the adapter so the island does not import `@/data/projects`.

### Explicitly **not** chosen for T6 this wave

| Module | Why skip |
| --- | --- |
| `profile-display` / `learning-signals` | Already deepened for optional-content (PROG-58); interface is small |
| `site.ts` / `jsonld.ts` | Fresh from T8; leave alone |
| Starwind vs shadcn hybrid | Policy is ADR-0002; no deepen without a new ADR |
| `BrandIcon` / `UiIcon` (`icon-catalog` + `icon-renderers`) | Deep enough; consolidation already shipped as 4→2 |

---

## 2. Dead code / unused dependency kill-list (T4)

### Remove (high confidence)

| Item | Why |
| --- | --- |
| **`@tailwindcss/forms`** | Listed in `package.json` only — **zero** imports / CSS plugin references |

### Replace-then-remove (small, safe)

| Item | Why | Action |
| --- | --- | --- |
| **`@tabler/icons`** | Sole use: close icon in `starwind/dialog/DialogContent.astro` | Swap to existing Iconify Lucide / `UiIcon` / inline SVG, then drop the dep |

### Audit / likely keep (do not blind-delete)

| Item | Notes |
| --- | --- |
| `@svgr/core`, `@svgr/plugin-jsx` | Not imported in app source; often required by `unplugin-icons`. Confirm with a prune build before removing |
| `class-variance-authority` | Used by `src/components/ui/button.tsx` |
| `tailwind-variants` | Used by Starwind button/dialog variants |
| `react-day-picker` + `date-fns` + `ui/calendar` | Used by ProjectsToolbar date filter |
| `reactflow` | Used by ArchitectureDiagram |
| `lucide-react` | **Removed** — Lucide via `UI_ICONS` / `UiIcon` + `~icons/lucide/*` in `ui/*` |
| `GradientPreview` | **Not dead** — used by ProjectCard, about, project detail |
| `ui/*` set (`accordion`, `button`, `calendar`, `dropdown-menu`, `popover`) | All reachable from discovery / architecture UI |

### Dead **code patterns** (not packages)

| Item | Notes |
| --- | --- |
| None large found beyond unused `@tailwindcss/forms` | Prefer dependency prune over speculative file deletes |
| Hardcoded gradient hexes in `GradientPreview` | Token-seam smell → document for PROG-45 / design pass; **not** a T4 kill unless gradients become CSS variables without visual change |

### Deferred (out of T4 unless trivial)

- ~~Collapsing `lucide-react` vs `@iconify-json/lucide` into one icon pipeline~~ **Done** (unplugin-only)  
- Replacing ReactFlow with a lighter custom SVG for linear graphs  
- Moving Starwind dialog off `@tabler` is in scope; rewriting Starwind is not  

---

## 3. Performance hotspots (T5)

All interactive mounts surveyed use **`client:load`** (Navbar, Layout ambient, home HeroGrid, projects list island, project detail architecture island). No `client:visible` / `client:idle` yet.

| Hotspot | Where | Why it matters | Suggested budget action |
| --- | --- | --- | --- |
| **ReactFlow on project detail** | `ArchitectureDiagram` static-imported by `ProjectArchitectureIsland` | Island bundle includes ReactFlow even when rendering `ArchitectureFallback` | Dynamic-import diagram (or split island) so fallback path skips ReactFlow; consider `client:visible` on the architecture section |
| **Projects list island weight** | `ProjectsToolbar` + calendar / day-picker / dropdown / popover | Largest interactive JS on `/projects` | After T6 extract, code-split date popover; keep filter core eager |
| **Site-wide AmbientBackground** | `Layout.astro` `client:load` | Canvas + continuous rAF in stars mode on every page | `client:idle` or defer until ambient ≠ off; pause rAF harder when mode is off (today still schedules frames while clearing) |
| **Home HeroGrid** | `index.astro` `client:load` | Canvas + observers on first paint | `client:visible` / `idle` acceptable for decorative hero |
| **Navbar motion/ambient toggles** | `Navbar.astro` `client:load` | Small but global | Low priority; keep load if FOUC risk |
| **brand catalog (`BRAND_ICONS`)** | Eager via cards/tech badges | Build-time + island payload | Measure; tree-shake / lazy non-critical icons only if metrics warrant |

**Measurement note for T5:** capture before/after on `/`, `/projects`, `/projects/[id]` (JS transferred + LCP/INP if easy). No inventing budgets beyond “address the list or document skip.”

---

## 4. Non-goals for this wave

- Implementing T4 / T5 / T6 (this report only)  
- Full living `docs/` refresh (**PROG-45**)  
- SEO / AI-search packaging (**PROG-46** done)  
- Optional-content policy changes (**PROG-58** done)  
- CMS / Content Collections migration  
- Fixing broken remote `lovable-astro-migration` or merging to `main` / `astro-2`  
- Pagefind experiment / new search engine  

---

## 5. Unlock checklist for T4 / T5 / T6

| Ticket | Unlocked by this report | Suggested label move |
| --- | --- | --- |
| T4 PROG-50 | Explicit kill-list §2 | `needs-info` → `ready-for-agent` |
| T5 PROG-52 | Hotspots §3 | `needs-info` → `ready-for-agent` |
| T6 PROG-51 | Deepen targets §1 (P1 required; P2 with P1; P3 optional) | `needs-info` → `ready-for-agent` |

**Recommended execution order after T3:** T4 and T5 may run in parallel (per T5 ticket). Prefer **T6 P1 before or with T4** if T4 would touch toolbar internals — otherwise T4 can remove `@tailwindcss/forms` / `@tabler` independently first.
