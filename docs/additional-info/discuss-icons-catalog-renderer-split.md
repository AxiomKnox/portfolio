# Discussion: Remove Lucide static path? vs 4→2 as catalog + renderer

**Status:** SHIPPED — 4→2 catalog + renderer live; Lucide unplugin-only (no `lucide-react`). Historical discussion only.  
**Date:** 2026-07-23 (updated 2026-07-24)  
**Repo:** worktree `z6qr`  
**Current truth:** `src/lib/icon-catalog.tsx` + `src/lib/icon-renderers.tsx` (`UiIcon` / `BrandIcon`, `.brand-icon`).  
**Related:** [discuss-dual-icon-paths.md](./discuss-dual-icon-paths.md), [discuss-dual-icon-paths-four-files.md](./discuss-dual-icon-paths-four-files.md), [discuss-icons-ssr-naming-minimum.md](./discuss-icons-ssr-naming-minimum.md)

---

## Verdict for parent (tell the user)

| Question | Answer |
| --- | --- |
| **Why do Lucide catalog + renderer exist?** | Curated **UI chrome** for Astro pages via `unplugin-icons` (`~icons/lucide/*`), kept separate from brand/tech glyphs and from island `lucide-react` (ADR-0002 §7). Not because Astro “needs” them as a hard platform requirement. |
| **Can `icon-registry.ts` + `Icon.astro` go away entirely?** | **Yes, as files** — but only if you **replace or delete** every Lucide UI chrome call site. Removal is not free; it is deleting a product surface, not just merging folders. |
| **Zero visual/functional drift if removed with no replacement?** | **No.** Icons disappear or wrong policy applies. Drift-free only if a replacement preserves glyph, size, `currentColor`, `aria-hidden`, and throw-on-unknown. |
| **Their new 4→2 (catalog file + renderer file)?** | **Works.** Different cut than prior M2: split by **role** (data vs paint), not by **domain** (Lucide vs brand). Keeps both jobs; changes locality trade-offs (see §4–5). |
| **Remove Lucide static → already ~2?** | **Yes.** Brand side alone is already catalog + renderer (`brand-icons` + `tech-icons`). Folding `TechIcon` into `brand-icons` → **1 file** for remaining work. That is a smaller tree **only if** Lucide UI chrome is replaced elsewhere or deleted from the UI. |

---

## 1. Why Lucide catalog + renderer exist (plain)

Two jobs today:

| Job | Failure mode | Paint | Hosts |
| --- | --- | --- | --- |
| **Lucide UI chrome** | Strict curated keys; **throw** if unknown | Stroke / `currentColor`; decorative `aria-hidden` | Astro pages + Starwind dialog close |
| **Brand / tech / social** | Fuzzy aliases; **letter fallback** if missing | Native SVG paints + light override / dark grayscale via `.tech-icon` | Astro **and** React islands |

Lucide static path files:

| File | Role |
| --- | --- |
| `src/lib/icon-registry.ts` | **Catalog** — `STATIC_ICONS` map of `~icons/lucide/*` + `StaticIconName` |
| `src/components/icons/Icon.astro` | **Renderer** — look up name → render React SVGR component |

**Why they were introduced (honest):** ADR-0002 §7 / hybrid policy — Iconify/unplugin on static Astro; `lucide-react` stays in React islands + shadcn `ui/*`. The registry exists so pages get a **typed, tree-shakeable, curated** set instead of scattering imports. `Icon.astro` is ~20 lines of glue so Astro templates can say `<Icon name="mail" />`.

**Deletion test (codebase-design):** Delete the pair → complexity does **not** vanish; it reappears at every call site (or the chrome icons vanish). So the *job* earns its keep. The *file split* is optional; the *behavior* is not optional unless the UI changes.

They are **not** required because:

- Astro cannot host React without hydration (false — `TechIcon` already does),
- or because SSR is required (project is SSG — see prior SSR wording note).

---

## 2. Call-site inventory — Lucide static path

### Who imports the catalog / renderer

| Consumer | What it uses |
| --- | --- |
| `src/components/icons/Icon.astro` | `STATIC_ICONS`, `StaticIconName` |
| `src/pages/index.astro` | `Icon.astro` + type-only `StaticIconName` (`whatIcon`) |
| `src/pages/about.astro` | `Icon.astro` |
| `src/pages/projects/[id].astro` | `Icon.astro` |
| `src/components/AboutPreviewDialog.astro` | `Icon.astro` |
| `src/components/starwind/dialog/DialogContent.astro` | `Icon.astro` (close “x”) |

**No external callers** of `resolveStaticIcon` / `STATIC_ICON_NAMES` (dead thin API inside the catalog).

**Not on this path:** `ProjectCard`, `ProjectsToolbar`, toggles, shadcn `ui/*` — those use **`lucide-react`** and/or **`TechIcon`**. Removing the static Lucide pair does **not** remove island Lucide.

### Concrete `<Icon name=…>` usages

| File | Names used |
| --- | --- |
| `index.astro` | `arrow-right`, `mail`, `external-link`; dynamic `whatIcon` → `server` \| `globe` \| `sparkles` (What-I-do cards) |
| `about.astro` | `map-pin`, `clock`, `graduation-cap`, `external-link`, `file-text` |
| `projects/[id].astro` | `github`, `arrow-up-right`, `globe`, `box`, `activity`, `tag`, `calendar` |
| `AboutPreviewDialog.astro` | `file-text` |
| `DialogContent.astro` | `x` |

Catalog keys with **no** current page hit beyond the map itself: none of the 17 look orphaned after counting `whatIcon` (`server` / `sparkles` / `globe` are live).

### Brand path (for contrast — not removed by “drop Lucide static”)

| Consumer | Import |
| --- | --- |
| `about` / `index` / `[id]` / `Footer` | `TechIcon` from `tech-icons` |
| `ProjectCard`, `ProjectsToolbar` | `TechIcon` |
| `content/adapter.ts` | `assertBrandCatalogCoverage` from `brand-icons` |

---

## 3. If Lucide static path is **removed** — options + drift

**“Removed” means:** delete `icon-registry.ts` + `Icon.astro` and stop having a dedicated curated Lucide UI seam for Astro. The brand job stays.

| Option | What you do | Zero drift? | Notes |
| --- | --- | --- | --- |
| **A. React `UiIcon` from a shared module** (keep the *job*, kill the *Astro file*) | Same map + React helper; Astro hosts it like `TechIcon` | **Yes**, if props/aria match | This is consolidation, not removal of the Lucide UI job |
| **B. `lucide-react` at those Astro spots** | Import `Mail`, `X`, etc.; render as React in `.astro` | **Mostly yes** visually if size/class match; **policy drift** vs ADR-0002 §7; adds island dep into static pages; name/API differ (`size` vs `width`/`height`) | Soft friction, not hard blocker |
| **C. Raw `~icons/lucide/*` at each call site** | No shared catalog | **Yes** per glyph if careful | Loses curated typing / locality; scatters imports; `whatIcon` typing gets uglier |
| **D. Reuse `TechIcon`** | Point chrome names through brand catalog | **No** | Letter fallback on typo; `.tech-icon` color hooks; `role="img"` + `aria-label` vs decorative `aria-hidden`; would pollute `BRAND_ICONS` with UI chrome keys (`arrow-right`, `x`, …) or show letter tiles |
| **E. Delete chrome icons from UI** | Remove the markup | **No** (by design) | Honest product change, not a refactor |

**Bottom line on “can they go away?”**

- **As the only Lucide UI delivery for Astro:** only if you pick A–C (replace) or E (accept missing icons).
- **As files while keeping the job:** yes — fold into whatever module shape you choose (prior M2 domain split, or this note’s catalog/renderer split).
- **Honest “we don’t need them”:** you still need *something* for mail / close-x / meta row glyphs unless the UI drops them. The catalog+renderer are the current encapsulation of that need.

---

## 4. Preferred 4→2: one **catalog** file + one **renderer** file

### Contrast with prior M2

```
Prior M2 (domain split)              New preference (role split)
─────────────────────────            ────────────────────────────
ui-icons.tsx                         icon-catalog.tsx
  UI_ICONS + UiIcon                    UI_ICONS + BRAND_ICONS (+ assert helpers)
brand-icons.tsx                      icon-renderers.tsx
  BRAND_ICONS + TechIcon               UiIcon + TechIcon
```

| Axis | Prior M2 | This preference |
| --- | --- | --- |
| Cut | By **job/domain** | By **role** (data vs paint) |
| Coupling | `adapter` stays off Lucide imports | `adapter` importing catalog **pulls Lucide UI modules** too (same smell as true 4→1) |
| Depth | One deep module per job | Catalog is a wide data module; renderer holds two deep interfaces side by side |
| Mental model | “UI vs brand” | “Where glyphs live vs how they paint” |

**Does it work?** Yes. No platform blocker. Both renderers already consume React SVGR components; both catalogs are already maps of those components (+ brand metadata).

### Sketch — file contents

**`src/lib/icon-catalog.tsx`** (name proposal below)

```
// --- UI (Lucide chrome) ---
import … from "~icons/lucide/…"
export const UI_ICONS = { … } as const
export type UiIconName = keyof typeof UI_ICONS

// --- Brand / tech / social ---
import … from "~icons/devicon|logos|simple-icons/…"
export type BrandIconEntry = { icon; lightModeOverrideColor?; darkModeGrayscale? }
export const BRAND_ICONS = { … } as const
export function getBrandIconEntry(name): BrandIconEntry | null
export function missingBrandIcons / assertBrandCatalogCoverage
// INTENTIONAL_LETTER_FALLBACKS, BrandIconName, etc.
```

Keep **two maps / two lookup APIs** inside the file. Do **not** merge into one `Record` with shared fallback rules.

**`src/lib/icon-renderers.tsx`**

```
import { UI_ICONS, type UiIconName, getBrandIconEntry } from "./icon-catalog"

export function UiIcon({ name, className, size }: {
  name: UiIconName; className?: string; size?: number
}) {
  // same behavior as Icon.astro: throw if missing; aria-hidden; width/height
}

export function TechIcon({ name, size, className }) {
  // move verbatim from tech-icons.tsx
}

// optional: resolveTechIcon if still wanted (currently no external callers)
```

**Deletes after cutover:** `icon-registry.ts`, `Icon.astro`, `brand-icons.tsx`, `tech-icons.tsx` (or leave thin re-export barrels temporarily).

**Call-site migration:**

- Astro: `Icon` → `UiIcon` (map `class` → `className` or accept both during cutover); no `client:*`.
- Islands / Astro tech chips: still `TechIcon`, new import path.
- `adapter.ts`: `assertBrandCatalogCoverage` from `icon-catalog`.

### Naming (aligned with prior taste: `UI_*` / `UiIcon`, `BRAND_*` / `TechIcon`)

Avoid today’s misleading pair names (`icon-registry` vs `Icon`; `brand-icons` vs `tech-icons` looking like two catalogs).

| Role | Proposed name |
| --- | --- |
| Catalog module | `src/lib/icon-catalog.tsx` |
| Renderer module | `src/lib/icon-renderers.tsx` |
| Lucide map | `UI_ICONS` (retire `STATIC_ICONS` name when convenient) |
| Lucide type | `UiIconName` (was `StaticIconName`) |
| Lucide component | `UiIcon` |
| Brand map | `BRAND_ICONS` (unchanged) |
| Brand component | `TechIcon` (unchanged — already means “tech/brand glyph”) |

**Alternatives if “icon-” prefix feels redundant:** `catalog.tsx` is too vague; `icons-data.tsx` + `icons.tsx` also fine. Prefer **not** a single export named `Icon` (ambiguous next to Lucide/React habits).

**`.tsx` vs `.ts` for catalog:** needs `.tsx` only if it embeds JSX; today both catalogs are import maps → could be `.ts` if renderers own all JSX. Using `.tsx` for the catalog is fine and matches current `brand-icons.tsx`.

---

## 5. Compare: remove Lucide static vs keep it inside the catalog/renderer pair

| Path | Files left among the four | What you still maintain | When it fits |
| --- | --- | --- | --- |
| **Remove Lucide static entirely** + fold `TechIcon` into `brand-icons` | **1** (brand only) | Brand catalog + renderer; Lucide chrome via B/C/E or island-only | You accept replacing/deleting Astro UI chrome and updating ADR-0002 §7 |
| **Remove Lucide static**, leave `brand-icons` + `tech-icons` | **2** (already) | Same as today minus Lucide Astro seam | Minimal structural change; still need replacement strategy for §2 call sites |
| **Keep Lucide job** in **role-split 4→2** (this preference) | **2** (`icon-catalog` + `icon-renderers`) | Both jobs; shared catalog module graph | You want fewer files **and** keep curated Astro Lucide chrome |
| **Keep Lucide job** in **domain-split M2** | **2** (`ui-icons` + `brand-icons`) | Both jobs; `adapter` stays off Lucide imports | Better locality / coupling if file count is the only pressure |

### Design recommendation (vocabulary, not a mandate)

- **Role-split 4→2 is coherent** and matches the user’s stated taste (“catalog vs renderer”).
- **Domain-split M2 is deeper for maintainers** under codebase-design locality: change Lucide UI without loading brand (and vice versa); `adapter` coverage does not import Lucide.
- **Removing Lucide static** is a **product/policy** choice (do we still want curated Astro UI chrome on unplugin?), not a file-count trick. File count drops because you deleted a job, not because the remaining job absorbed it cleanly.

If the user’s real goal is “I don’t want a second Lucide pipeline on Astro,” prefer **remove + replace (B or C)** or **remove + delete chrome (E)** — and say so explicitly — rather than hiding the same job inside a shared catalog file.

---

## 6. What this does *not* settle

Still out of scope (parent dual-path brief):

- Whether islands / shadcn keep **`lucide-react`**
- Whether app islands should migrate to `~icons/lucide` (Options B–D there)

Role-split 4→2 neither requires nor forbids unifying those.

---

## Open preferences (only if they block a choice)

1. Is the goal **delete the Lucide Astro job**, or **keep the job with fewer files**? (Answers diverge: remove vs catalog/renderer split.)
2. If keeping both jobs: accept **`adapter` ↔ Lucide import coupling** of role-split, or prefer domain-split M2 for cleaner module graph?
3. If removing Lucide static: replacement **B** (`lucide-react` in Astro), **C** (raw `~icons` at call sites), or **E** (drop chrome glyphs)?

---

## Evidence index

| Claim | Where |
| --- | --- |
| Lucide catalog | `src/lib/icon-registry.ts` |
| Lucide Astro renderer | `src/components/icons/Icon.astro` |
| Brand catalog + assert | `src/lib/brand-icons.tsx`; `src/content/adapter.ts` |
| Brand renderer | `src/lib/tech-icons.tsx` |
| Astro Icon call sites | `index.astro`, `about.astro`, `projects/[id].astro`, `AboutPreviewDialog.astro`, `DialogContent.astro` |
| `whatIcon` → server/globe/sparkles | `src/pages/index.astro` |
| TechIcon Astro + islands | `index` / `about` / `[id]` / `Footer`; `ProjectCard`; `ProjectsToolbar` |
| Island / shadcn lucide-react | `ProjectsToolbar`, `ProjectCard`, toggles, `ui/accordion|calendar|dropdown-menu` |
| Policy dual path | ADR-0002 §7; `discuss-dual-icon-paths.md` |
| Prior domain 4→2 (M2) | `discuss-dual-icon-paths-four-files.md` §3 |
| Prior naming / true 4→1 | `discuss-icons-ssr-naming-minimum.md` |
