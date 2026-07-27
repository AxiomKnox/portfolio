# Discussion: Icons — SSR wording, true 4→1, naming

**Status:** SHIPPED — **4→2** (`icon-catalog` + `icon-renderers`); prefer SSG wording over “SSR”. Historical discussion only.  
**Date:** 2026-07-23 (updated 2026-07-24)  
**Repo:** worktree `z6qr`  
**Current truth:** `UiIcon` / `BrandIcon`; `.brand-icon`; no `Icon.astro` / `TechIcon` / `lucide-react`.  
**Related:** [discuss-dual-icon-paths.md](./discuss-dual-icon-paths.md), [discuss-dual-icon-paths-four-files.md](./discuss-dual-icon-paths-four-files.md)

---

## Verdict for parent (tell the user)

| Question | Answer |
| --- | --- |
| **True 4→1 with zero visual/functional drift?** | **Yes — if `Icon.astro` dies** and Astro call sites use a React helper from one `.tsx` (same host pattern as `TechIcon` today). Keep **two catalogs + two renderers as separate exports** inside that one file; do not merge lookup/fallback/color policies. |
| **Hard blocker?** | **Not Astro “can’t render React.”** Hard only if you **insist on keeping an `.astro` wrapper** — then floor is **2 files** (`.tsx` + tiny Astro shim). |
| **Should you do 4→1?** | Technically fine for drift; **weak for depth/locality** (mega-module mixes two jobs; `adapter` coverage import pulls Lucide UI into the brand module graph). Prefer **4→2** unless “one file” is an explicit product constraint. |
| **SSR in Navbar/icons?** | **Doc/terminology slop, not runtime SSR.** Project is `output: "static"`. Misleading “SSR” in briefs/docs **can be deleted or rewritten** to “SSG / build-time HTML.” Nothing must-keep for an SSR adapter. |

---

## A) “SSR” on an SSG-only project

### What they saw (evidence)

There is **no** `SSR` / `ssr` string under `src/` or `astro.config.mjs`. Runtime config is explicit SSG:

```17:17:astro.config.mjs
  output: "static",
```

No `@astrojs/*` server adapter in config/`package.json`.

The misleading wording lives in **docs / past briefs**, not in Navbar or icon source:

| Source | Quote / claim | Actual meaning |
| --- | --- | --- |
| `docs/additional-info/deferred-inventory-user-corrections-decision-brief.md` | “`Navbar.astro` is **SSR**” | Wrong label. Navbar is a **static Astro component** rendered to HTML at **build** (and in `astro dev`). Only `MotionToggle` / `AmbientToggle` are `client:load` islands. |
| `docs/additional-info/discuss-dual-icon-paths-four-files.md` | “**SSR** static shell vs client islands” | Same sloppy synonym for “server/build render of the shell,” not Astro SSR mode. |
| `docs/components.md` (`ThemeToggle`) | “**SSR-safe**: initial state in `useEffect`” | Means **hydration-safe** / no wrong first paint from `localStorage` during pre-render — not “we run SSR.” |
| ADR-0002 | History: migrated **from** “Nitro SSR” **to** Astro static | Correct past tense; not a current mode. |

`Navbar.astro` itself has **no** SSR comments. It imports Astro `ThemeToggle` and React `MotionToggle` / `AmbientToggle` with `client:load` — those directives mean **hydrate on the client**, not “enable SSR.”

### Three things people confuse

| Term | This repo? | Notes |
| --- | --- | --- |
| **Astro SSR mode** (`output: "server"` / hybrid + adapter, on-demand HTML) | **No** | Would need adapter + non-static output. Absent. |
| **SSG / build-time render** (Astro compiles `.astro` + non-hydrated React into static HTML at build) | **Yes** | Every page shell, `Icon.astro`, and non-`client:*` `TechIcon` usage. |
| **React island hydrate** (`client:load` / `idle` / `visible`) | **Yes, sparse** | Navbar toggles, projects island, architecture, ambient bg, hero — not the icon catalogs. |

Icons (`Icon.astro`, `TechIcon` without `client:*`) are **build-time SVG in HTML**. They are not “SSR runtime.”

### Removable vs must-keep

| Wording | Action |
| --- | --- |
| “`Navbar.astro` is SSR” | **Remove / rewrite** → “static Astro shell (SSG); only Motion/Ambient toggles hydrate.” |
| “SSR static shell” in icon briefs | **Remove / rewrite** → “SSG / build-time shell.” |
| “SSR-safe” for theme/localStorage | **Rewrite** → “hydration-safe” or “safe under static pre-render.” Optional keep only if glossed. |
| ADR mention of old Nitro SSR | **Keep** as migration history. |
| Any code required for SSR adapter | **None** — nothing to keep for runtime SSR. |

**Bottom line:** They keep seeing “SSR” because **we (docs/agents) used it as a casual synonym for “rendered on the server/at build.”** On this project that is misleading. Prefer **SSG / build-time HTML** vs **client island**. No icon or Navbar behavior depends on Astro SSR mode.

---

## B) Why a React UI helper was proposed — and does 4→1 remove it?

### Why the helper was proposed (under a 4→2 plan)

Prior recommendation: put a React `UiIcon` next to `STATIC_ICONS` in `icon-registry.ts`, then **delete `Icon.astro`**.

Reason: Astro already hosts React SVG components without hydration (`TechIcon` on `index` / `about` / `[id]` / `Footer`). `Icon.astro` is only a thin lookup + `<Icon className … />`. A React helper with the same props collapses catalog+renderer into **one Lucide file**, matching the brand side after folding `TechIcon` into `brand-icons.tsx` → **two files total**.

It was **not** because Astro “requires SSR,” and **not** because Lucide can’t render from `.astro`.

### Constraints (Astro vs TSX vs registry)

| Kind | Can hold | Can be imported from React islands? |
| --- | --- | --- |
| `.astro` (`Icon.astro`) | Astro template + frontmatter; can render React children | **No** as a React component export for `ProjectCard` etc. |
| `.ts` registry (`icon-registry.ts`) | Catalog map + types + pure functions | Yes, but no JSX renderer unless renamed `.tsx` |
| `.tsx` (`brand-icons` / `tech-icons`) | Catalog **and** React renderer | Yes — Astro **and** islands |

So: **catalog + React renderer can live in one `.tsx` module.** An `.astro` file cannot be the single shared module for island call sites.

### Does true 4→1 eliminate separate helper/catalog files?

**Yes, as files.** Inside the one module you still need **both jobs’ behavior**:

1. Lucide UI: curated map + strict throw + `currentColor` renderer (`UiIcon`)  
2. Brand/tech: alias catalog + metadata + letter fallback + `.tech-icon` CSS hooks (`TechIcon`) + `assertBrandCatalogCoverage`

4→1 does **not** mean one `Record` and one component. It means **one file** exporting two deep seams (or one shallow kitchen-sink — avoid).

### True 4→1 — structure that preserves zero drift

**Single file:** e.g. `src/lib/icons.tsx` (name below).

```
icons.tsx
├── // --- UI (Lucide chrome) ---
│   STATIC_ICONS / UI_ICONS
│   type StaticIconName
│   function UiIcon({ name, className, size })  // same as Icon.astro
├── // --- Brand / tech ---
│   BRAND_ICONS + BrandIconEntry metadata
│   getBrandIconEntry / missingBrandIcons / assertBrandCatalogCoverage
│   function TechIcon({ name, size, className })  // move from tech-icons.tsx
└── // re-exports for call-site compatibility during cutover (optional, temporary)
```

**Call-site migration (behavior-preserving):**

- Astro pages / `DialogContent.astro` / `AboutPreviewDialog`: `Icon` → `UiIcon` (props: `name`, `className` or map `class`→`className`, `size`) — **no** `client:*`.
- Islands / Astro tech chips: still `TechIcon`.
- `adapter.ts`: `assertBrandCatalogCoverage` from same module.
- Delete: `Icon.astro`, `icon-registry.ts`, `brand-icons.tsx`, `tech-icons.tsx`.

**Zero visual/functional drift checklist:** identical `aria-*`, `role`, `data-light-mode-override`, `data-dark-mode-grayscale`, `--tech-icon-light-mode-override`, letter-fallback markup, Lucide throw-on-unknown, sizes/classes.

### Soft costs (not drift, but real)

| Cost | Why |
| --- | --- |
| **Module-graph coupling** | Today `adapter` imports only `brand-icons`. One file with top-level `~icons/lucide/*` **and** brand imports means coverage assert **loads Lucide UI modules** too (unless you later split again). Build/coupling smell, not pixel drift. |
| **Shallow mega-module** | Two failure modes and paint policies in one file invite accidental “use TechIcon for UI” / wrong fallback. Mitigate with clear section comments + distinct export names — still weaker locality than 4→2. |
| **Review size** | One large diff vs two focused merges. |

### Closest if they keep `Icon.astro`

| Target | Feasible? |
| --- | --- |
| **Strict 4→1** (exactly one file among the four, including keeping `Icon.astro`) | **No** — `.astro` cannot absorb the TSX catalogs/renderers used by islands/`adapter`. |
| **Closest** | **1× `.tsx` + tiny `Icon.astro` shim** = **2 files** (shim only re-exports/renders `UiIcon`). Or delete shim → true 1. |

**Hard blocker summary:** The only hard file-count blocker is **wanting an Astro-component file to remain**. There is **no** hard blocker from “Astro vs React SSR.” React-in-Astro without `client:*` is already production for `TechIcon`.

---

## C) Naming consistency

### What is misleading today

| Pair | Problem |
| --- | --- |
| `icon-registry.ts` + `Icon.astro` | Different schemes (`registry` vs generic `Icon`); `Icon` does not say Lucide/UI. |
| `brand-icons.tsx` + `tech-icons.tsx` | **Looks like two peer catalogs**; actually **catalog + renderer** for the **same** brand job. This is the more misleading pair. |

### Proposed end-state names

#### If true 4→1 (user’s ask)

| Role | Name |
| --- | --- |
| File | `src/lib/icons.tsx` |
| Lucide catalog | `UI_ICONS` (or keep `STATIC_ICONS` during cutover) |
| Lucide renderer | `UiIcon` |
| Brand catalog | `BRAND_ICONS` |
| Brand renderer | `TechIcon` |
| Coverage | `assertBrandCatalogCoverage` (unchanged) |

Avoid exporting a generic `Icon` from the mega-file — clashes with Lucide/React habits and hides which job it is.

#### If 4→2 (still the cleaner design default)

| Role | Before | After |
| --- | --- | --- |
| Lucide catalog + renderer | `icon-registry.ts` + `Icon.astro` | `src/lib/ui-icons.tsx` (`UI_ICONS` + `UiIcon`) |
| Brand catalog + renderer | `brand-icons.tsx` + `tech-icons.tsx` | `src/lib/brand-icons.tsx` (`BRAND_ICONS` + `TechIcon`) |

### Before → after table (4→1)

| Before | After (4→1) |
| --- | --- |
| `src/lib/icon-registry.ts` | folded into `src/lib/icons.tsx` as `UI_ICONS` |
| `src/components/icons/Icon.astro` | deleted; use `UiIcon` |
| `src/lib/brand-icons.tsx` | folded into `icons.tsx` as `BRAND_ICONS` + helpers |
| `src/lib/tech-icons.tsx` | folded into `icons.tsx` as `TechIcon` |

---

## Overall minimum file counts (these four only)

| Goal | Min files | Zero visual/functional drift? |
| --- | --- | --- |
| Keep `Icon.astro` | **2** (`.tsx` mega or brand+ui tsx + Astro shim) | Yes |
| Delete `Icon.astro`, React `UiIcon` from Astro | **1** (`icons.tsx`) | **Yes**, if APIs stay split inside the file |
| Best depth/locality (recommended unless “one file” is mandatory) | **2** (`ui-icons.tsx` + `brand-icons.tsx`) | Yes |

**Out of scope (still separate after any of the above):** `lucide-react` in islands/shadcn `ui/*` (dual-path brief); `styles.css` `.tech-icon` rules.

---

## Evidence index

| Claim | Where |
| --- | --- |
| SSG-only | `astro.config.mjs` `output: "static"`; no server adapter |
| Misleading Navbar “SSR” | `docs/additional-info/deferred-inventory-user-corrections-decision-brief.md` §B |
| Navbar islands | `Navbar.astro` — `MotionToggle` / `AmbientToggle` `client:load` only |
| Icon.astro = registry lookup | `src/components/icons/Icon.astro` |
| Lucide catalog | `src/lib/icon-registry.ts` |
| Brand catalog + assert | `src/lib/brand-icons.tsx`; `src/content/adapter.ts` |
| Brand renderer | `src/lib/tech-icons.tsx` |
| React-in-Astro without client | `TechIcon` on `index` / `about` / `[id]` / `Footer` |
| Prior 4→2 recommendation | `discuss-dual-icon-paths-four-files.md` Option M2 |

---

## Open preference (does not block honesty on 4→1)

1. Is **“exactly one file”** a hard UX/maintainability goal, or was it shorthand for “as few as possible”?  
2. If hard: accept mega-module coupling (`adapter` ↔ Lucide imports) or later re-split?  
3. Prefer deleting `Icon.astro` now (true 1) vs keeping a one-line Astro shim (2)?
