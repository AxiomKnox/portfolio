# Discussion: Why four icon files? (consolidation)

**Status:** SHIPPED — **4→2** as `icon-catalog.tsx` + `icon-renderers.tsx`. Historical discussion only.  
**Date:** 2026-07-23 (updated 2026-07-24)  
**Repo:** worktree `z6qr`  
**Current truth:** No `Icon.astro` / `icon-registry` / `brand-icons` / `tech-icons` / `TechIcon`. Exports: `UI_ICONS`, `BRAND_ICONS`, `UiIcon`, `BrandIcon`, `.brand-icon`.  
**Parent brief:** [discuss-dual-icon-paths.md](./discuss-dual-icon-paths.md) (lucide dual path also closed).

---

## 1. Why four files existed (plain language — superseded)

> **Superseded by 4→2.** Live modules: `icon-catalog.tsx` + `icon-renderers.tsx`. Table below describes the pre-ship four-file layout.

They were not four copies of the same thing. They were **two product jobs**, each split into **catalog + renderer**:

| File | Job | Role |
| --- | --- | --- |
| `src/lib/icon-registry.ts` | Lucide **UI chrome** for static pages | Curated map of `~icons/lucide/*` → typed names (`STATIC_ICONS`) |
| `src/components/icons/Icon.astro` | Same job | Thin Astro wrapper: `name` + `class`/`size` → look up map → render SVG |
| `src/lib/brand-icons.tsx` | **Brand / tech / social** glyphs | Big alias catalog + color metadata + coverage assert for content |
| `src/lib/tech-icons.tsx` | Same job | Deep renderer: lookup → glyph **or** letter fallback + CSS hooks (`.tech-icon`, light override, dark grayscale) |

**Call sites (today):**

- **`Icon.astro`:** `index.astro`, `about.astro`, `projects/[id].astro`, `AboutPreviewDialog.astro`, Starwind `DialogContent.astro` (close “x”).
- **`icon-registry`:** imported by `Icon.astro`; `StaticIconName` type also imported by `index.astro`.
- **`TechIcon`:** Astro pages (`index`, `about`, `[id]`, `Footer`) **and** React islands (`ProjectCard`, `ProjectsToolbar`).
- **`brand-icons`:** `getBrandIconEntry` via `tech-icons`; `assertBrandCatalogCoverage` from `content/adapter.ts` at content load.

**Related but outside these four:** island / shadcn UI still uses **`lucide-react`** (`ProjectsToolbar`, `ProjectCard`, toggles, `ui/accordion|calendar|dropdown-menu`). That is the dual-path topic in the parent brief — consolidating these four files does **not** remove it.

Policy backdrop: ADR-0002 §7 — Iconify/`Icon.astro` on static pages; `lucide-react` stays in React islands.

---

## 2. Overlap / redundancy map

```
Lucide UI (static Astro)          Brand / tech (Astro + islands)
─────────────────────────         ────────────────────────────────
icon-registry.ts  ←catalog→       brand-icons.tsx  ←catalog + assert→
       ↑                                    ↑
Icon.astro        ←renderer→      tech-icons.tsx   ←renderer (TechIcon)→
```

| Concern | Overlap? | Notes |
| --- | --- | --- |
| Delivery mechanism | Shared | Both catalogs use `unplugin-icons` / `~icons/…` + React SVGR components |
| Lookup semantics | **No** | Lucide: strict curated keys, throw on unknown. Brand: lowercase aliases, null → letter fallback |
| Visual policy | **No** | Lucide: `currentColor` / stroke UI. Brand: native paints + optional light hex override / dark grayscale via CSS |
| Astro host | Parallel pattern | Astro already renders **React** `TechIcon`; `Icon.astro` is optional glue for the Lucide side |
| Dead / thin API | Mild | `resolveStaticIcon`, `STATIC_ICON_NAMES`, `resolveTechIcon` have no external callers; `getBrandIcon` only used inside brand-icons |

**True redundancy:** the *pattern* “map file + thin render wrapper” is duplicated across the two jobs. The *data and behavior* are not duplicated.

**Not redundant with each other:** merging Lucide UI names into `BRAND_ICONS` (or vice versa) would mix strict UI chrome with fuzzy tech aliases and different failure modes — shallow mega-module, easy drift.

---

## 3. Options ranked (max file cut · zero drift · least code)

### Best — **Option M2: 4 → 2** (recommended if the goal is fewer files)

1. Move `TechIcon` (+ tiny `resolveTechIcon` if kept) **into** `brand-icons.tsx`; delete `tech-icons.tsx`; retarget imports.
2. Add a React `UiIcon` / `StaticIcon` in `icon-registry.ts` (same props as `Icon.astro`: `name`, `className`/`class`, `size`); delete `Icon.astro`; point Astro + Starwind dialog at the React helper (same host pattern as `TechIcon` today).

| Criterion | Score |
| --- | --- |
| File-count reduction | **−2** (largest safe cut among these four) |
| Visual / functional drift | **None** if props, classes, aria, and CSS data-attrs stay identical |
| Code volume | **Least net code** — deletes two thin wrappers; no behavior rewrite |
| Depth | Improves locality: one module per job (catalog+renderer), matching codebase-design “deep module” |

**Remains after M2:** `icon-registry.ts` + `brand-icons.tsx`, plus **still** `lucide-react` in islands/shadcn (parent brief).

### Runner-up — **Option M3: 4 → 3** (smallest diff)

Fold only `tech-icons.tsx` → `brand-icons.tsx`. Leave `Icon.astro` + `icon-registry` alone.

| Criterion | Score |
| --- | --- |
| File-count reduction | **−1** |
| Drift | **None** (move component, update imports) |
| Code volume | Minimal churn; no Astro call-site migration |
| Trade-off | Leaves the Lucide side still split across two files for ~20 lines of glue |

### Weaker for “least files + no drift”

| Option | → | Why not best |
| --- | --- | --- |
| **M1: 4 → 1** mega `icons` module | −3 | Mixes two domains (strict Lucide vs brand aliases/fallback/CSS). Larger import surface for `adapter` coverage vs UI pages. More review risk; not “least code” cognitively |
| Delete `Icon.astro` only, inline registry lookups at every Astro call site | −1 | More call-site code, worse locality — opposite of deep modules |
| Merge Lucide registry into brand catalog | −? | High drift risk (throw vs letter fallback; color policies) |
| Unify with `lucide-react` islands while doing this | n/a | Separate decision (parent brief Options B–D); not required to shrink these four |

---

## 4. What still remains after the best option

After **M2 (4 → 2)**:

| Still separate | Why |
| --- | --- |
| `icon-registry.ts` | Curated Lucide UI for static/shell |
| `brand-icons.tsx` | Brand catalog + `TechIcon` + content coverage assert |
| `lucide-react` in islands + `ui/*` | Intentional dual path (ADR-0002 §7); shadcn regen friction — see parent brief |
| `styles.css` `.tech-icon` rules | Presentation for brand renderer; not a fifth “resolver” file |

So: **four → two** is the ceiling for *these* files without merging unlike domains or touching the Lucide dual-path product choice.

---

## 5. What cannot merge without risk

| Seam | Risk if forced together |
| --- | --- |
| **Curated Lucide UI vs brand catalog** | Different lookup, failure mode, and paint policy; one `Record` invites wrong fallback/color behavior |
| **Astro `.astro` component vs React** | Low risk *to replace* `Icon.astro` with React (already proven via `TechIcon` in `.astro`); high risk if someone assumes Astro *cannot* host React and invents a second stack |
| **SSR static shell vs client islands** | `TechIcon` already crosses both; don’t split brand rendering again by host |
| **App Lucide vs shadcn `ui/*` `lucide-react`** | Outside these four; dropping the dep is parent-brief Option C, not a file-merge |

---

## 6. Open questions (only if they block a choice)

None block choosing **M3** or **M2** for file-count reduction.

Optional preference only:

1. Prefer **M3** (one import churn on brand side) vs **M2** (also migrate ~5 Astro/`DialogContent` call sites off `Icon.astro`)?
2. Keep a deprecated `tech-icons.tsx` re-export barrel for a release, or hard-cut imports in one change?

(Parent-brief questions about dropping `lucide-react` / shadcn stance remain separate and do not gate this four-file cleanup.)

---

## Evidence index

| Claim | Where |
| --- | --- |
| Lucide static map | `src/lib/icon-registry.ts` |
| Astro Lucide wrapper | `src/components/icons/Icon.astro` |
| Brand catalog + assert | `src/lib/brand-icons.tsx`; `src/content/adapter.ts` |
| Brand renderer + CSS hooks | `src/lib/tech-icons.tsx`; `src/styles.css` (`.tech-icon` …) |
| TechIcon in Astro + islands | `index/about/[id]/Footer.astro`; `ProjectCard.tsx`; `ProjectsToolbar.tsx` |
| Island lucide-react (outside four) | `ProjectsToolbar`, `ProjectCard`, toggles, `ui/*` |
| Policy | ADR-0002 §7; parent `discuss-dual-icon-paths.md` |
