# Discussion: Dual icon paths — keep or unify?

**Status:** SHIPPED — single unplugin Lucide path; `lucide-react` removed. Historical discussion only.  
**Date:** 2026-07-23 (updated 2026-07-24)  
**Repo:** worktree `z6qr`  
**Current truth:** `icon-catalog.tsx` + `icon-renderers.tsx` (`UiIcon` / `BrandIcon`); islands → `UiIcon`; `ui/*` → `~icons/lucide/*`. See ADR-0002 §7.  
**Related:** ADR-0002 §7; deferred inventory C (now closed).

---

## 1. Architecture at time of writing (superseded — see Status)

> **Superseded.** Live stack is `icon-catalog` + `icon-renderers` (`UiIcon` / `BrandIcon`); Lucide is unplugin-only (Option C shipped). Table below is the pre-ship dual path.

Three icon surfaces, two *Lucide* delivery mechanisms (then):

| Surface | Mechanism | Consumers |
| --- | --- | --- |
| Static Astro UI | `unplugin-icons` + `@iconify-json/lucide` → `~icons/lucide/*` curated in `icon-registry.ts` → `Icon.astro` | Pages, Starwind `DialogContent` close, etc. |
| Brand / tech | `unplugin-icons` + `@iconify-json/{devicon,logos,simple-icons}` → `brand-icons.tsx` → `TechIcon` | Astro pages **and** React islands (e.g. `ProjectsToolbar`, `ProjectCard`) |
| Island UI chrome | `lucide-react` named imports | `ProjectsToolbar`, `ProjectCard`, `AmbientToggle`, `MotionToggle`, shadcn `ui/{accordion,calendar,dropdown-menu}` |

**Build fact:** `astro.config.mjs` already configures `unplugin-icons` with `compiler: "jsx"`, `jsx: "react"`. `@svgr/core` + `@svgr/plugin-jsx` exist as the SVGR pipeline for that plugin. `tsconfig` includes `unplugin-icons/types/react`.

**Policy fact:** ADR-0002 decision 7 and `Icon.astro`’s header encode *“no lucide-react in `.astro`; Lucide remains in React islands only.”* That is an intentional split from PROG-43 / the hybrid UI ADR — not an incomplete migration that accidentally left two stacks.

**Seam vocabulary:** `TechIcon` is already a deep module (name + size → lookup + letter fallback). Lucide UI icons on the static side have a shallow curated registry (`STATIC_ICONS`); islands bypass that seam and import `lucide-react` directly. shadcn’s `components.json` sets `"iconLibrary": "lucide"`, which steers generated `ui/*` toward `lucide-react`.

---

## 2. Real technical blockers to unification

### Hard blockers (must keep dual)

**None found.**

Evidence that islands can already consume `~icons` / unplugin-icons React components:

- Same Vite plugin + JSX/React compiler is what builds `brand-icons` and `icon-registry`.
- `TechIcon` (pure `~icons/…` components) is imported and rendered inside client islands today.
- Extending `STATIC_ICONS` (or importing `~icons/lucide/search` ad hoc) is the same compile path islands already exercise for brands.

### Soft blockers / friction (not “can’t”, but “costs”)

1. **shadcn regeneration drift** — `ui/*` currently imports `lucide-react`. Re-running shadcn add/update with `iconLibrary: "lucide"` will tend to reintroduce those imports unless you change the icon library setting, maintain a wrapper alias, or accept ongoing rewrites. This is the strongest *practical* reason to keep `lucide-react` even if app islands migrate.
2. **API / DX differences** — `lucide-react` offers `size`, `strokeWidth`, `absoluteStrokeWidth`, and PascalCase exports (`Search`, `ChevronDownIcon`). unplugin SVGR components are standard SVG React components (`width` / `height` / `className`). Repo scan: no island call site appears to rely on `strokeWidth` / `absoluteStrokeWidth` on Lucide icons (the `strokeWidth` hit in `ArchitectureDiagram` is ReactFlow edge style, not Lucide).
3. **Naming / catalog skew** — Iconify Lucide path names (`~icons/lucide/layout-grid`) vs `lucide-react` export names; occasional `*Icon` suffixes in shadcn templates. Glyph sets can lag each other across `@iconify-json/lucide` vs `lucide-react` versions.
4. **Curated registry discipline** — Static path forces new UI icons through `icon-registry` (tree-shake-friendly, explicit). Full island migration either expands that registry (good locality) or scatters `~icons/lucide/…` imports (works, but shallower than one seam).
5. **Documented intent** — Prior inventory already labeled dual-path as intentional, not open debt. Unifying would be a *new* product/architecture choice, not finishing unfinished work.

---

## 3. Options (for user decision)

### Option A — Keep dual path (status quo)

- **What:** Leave ADR-0002 §7 as-is: Iconify/unplugin for Astro + brands; `lucide-react` for islands + shadcn `ui/*`.
- **Effort:** None.
- **Risk:** Low ongoing. Cost is one extra runtime dependency and two mental models for “Lucide UI icon.”
- **Fit:** Matches deferred-inventory “intentional dual-path”; shadcn DX stays default.

### Option B — Migrate app islands only; keep `lucide-react` for `ui/*`

- **What:** Replace `lucide-react` in `ProjectsToolbar`, `ProjectCard`, `AmbientToggle`, `MotionToggle` with `~icons/lucide/…` and/or expand `icon-registry` / a thin React `UiIcon` wrapper. Leave accordion/calendar/dropdown on `lucide-react`.
- **Effort:** Small–medium (handful of files; ~10 toolbar icons + a few toggles/card).
- **Risk:** Medium-low technically; **does not** remove `lucide-react` from `package.json`. Dual path shrinks but remains. Slight visual parity check on toolbar/toggles.
- **Fit:** Proves unification where it matters for *app* code without fighting shadcn.

### Option C — Full migrate islands + `ui/*`; drop `lucide-react`

- **What:** All Lucide UI via unplugin/`~icons` (likely via expanded registry or shared React helper). Remove `lucide-react` dependency. Adjust shadcn `iconLibrary` / post-add workflow so future primitives don’t reimport it.
- **Effort:** Medium (app + three `ui/*` files + config/docs/ADR note).
- **Risk:** Medium — shadcn regen friction; need a clear “how we add icons after `shadcn add`” rule; visual/a11y smoke on calendar chevrons, menu checks, accordion carets.
- **Fit:** Maximum dependency locality; only worth it if dropping the dep / one Lucide pipeline is an explicit goal.

### Option D — Deepen one Lucide UI seam (design-first, migrate later)

- **What:** Introduce (or expand) a single deep module — e.g. React-capable resolve from the same curated map as `Icon.astro` — so Astro and islands share one interface; adapters stay unplugin under the hood. Decide A/B/C *after* the seam exists, or migrate behind it.
- **Effort:** Small design + small implementation; migration can be incremental.
- **Risk:** Low if migration is optional behind the seam; avoids scatter of raw `~icons` imports in islands.
- **Fit:** Aligns with codebase-design (one Lucide UI interface, two render hosts). Does not by itself force dropping `lucide-react`.

---

## 4. Recommendation framed as input (not a verdict)

**Input for the user / parent — not a decision:**

There is **no hard technical need** to keep dual Lucide delivery paths *because* of missing SVGR/unplugin support. That support is already live, and islands already render unplugin icons via `TechIcon`.

What remains is a **policy + ecosystem** trade-off:

- Keeping dual is coherent with ADR-0002, shadcn defaults, and prior inventory labeling.
- Migrating is feasible; the meaningful friction is **shadcn `ui/*` + regen**, not Astro/React incompatibility.
- If the goal is only “stop thinking about two Lucide stacks in *app* code,” **Option B or D** buys clarity without requiring a dep removal.
- If the goal is “one Lucide package in `package.json`,” only **Option C** gets there — and that should be an explicit approve, with an ADR amendment, not a drive-by prune.

Suggested default *if* the user later wants a bias without deciding tonight: treat dual-path as **acceptable**, and only revisit when someone cares about removing `lucide-react` or consolidating Lucide DX — not because the old ADR is obsolete by technology alone.

---

## 5. Open questions for the user

1. **Goal of unification?** Drop `lucide-react` from deps, simplify agent/human DX, bundle size, or none (leave intentional)?
2. **shadcn stance?** Willing to own a non-default icon path for `ui/*` after every `shadcn add`, or should `ui/*` stay on `lucide-react` forever?
3. **Seam preference?** Expand curated `icon-registry` / shared `UiIcon` for islands (locality), or allow direct `~icons/lucide/…` imports in islands (less ceremony)?
4. **Parity bar?** Any must-match stroke weight / size behavior between Astro `Icon.astro` and island chrome?
5. **ADR appetite?** If migrating, amend ADR-0002 §7 — or leave dual until a stronger reason appears?

---

## Evidence index (repo)

| Claim | Where |
| --- | --- |
| unplugin JSX/React compiler | `astro.config.mjs` (`Icons({ compiler: "jsx", jsx: "react" })`) |
| Static Lucide via `~icons` | `src/lib/icon-registry.ts`, `src/components/icons/Icon.astro` |
| Brand via `~icons` | `src/lib/brand-icons.tsx`, `src/lib/tech-icons.tsx` |
| Islands already use unplugin icons | `ProjectsToolbar` / `ProjectCard` → `TechIcon` |
| Island `lucide-react` call sites | `AmbientToggle`, `MotionToggle`, `ProjectCard`, `ProjectsToolbar`, `ui/accordion`, `ui/calendar`, `ui/dropdown-menu` |
| Policy | ADR-0002 §7; `Icon.astro` comment; deferred inventory C |
| shadcn lucide default | `components.json` → `"iconLibrary": "lucide"` |
| SVGR present for unplugin | `package.json` `@svgr/core`, `@svgr/plugin-jsx` |
