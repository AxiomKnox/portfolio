# ADR 0002: Astro SSG with Starwind/shadcn hybrid UI

**Status:** Accepted (superseded in part by PROG-43 — see Notes)

## Context

The portfolio migrated from TanStack Start / Lovable / Nitro SSR to Astro static generation on GitHub Pages. We needed a UI strategy that preserves zero visual and behavioral regression while minimizing client JS.

A throwaway parity prototype (`/prototype/parity`) confirmed: custom theme script (pass), `@tailwindcss/typography` + build-time markdown (pass), and Starwind dialog (behavior OK but small visual deltas vs old Radix).

## Decision

1. **Deploy:** Astro `output: "static"` to GitHub Pages project site; Lovable/Nitro replaced entirely.
2. **Content:** Thin exclusive adapter for pages (`src/content/adapter.ts`). Live store is Content Collections under `src/content/**` ([ADR 0003](./0003-content-collections-and-sync.md); supersedes ADR 0001).
3. **Theme:** Keep custom inline `theme` localStorage key and default dark — do not adopt Starwind `theme-toggle` (deferred to PROG-44 / Lovable port).
4. **Prose:** Keep `@tailwindcss/typography` + build-time `marked` GFM — do not use Starwind Prose (deferred to PROG-44).
5. **UI hybrid:** Starwind (or plain Astro) for static shell; **shadcn Base UI React islands** wherever Starwind would cause UI or functionality loss.
6. **About dialogs:** Starwind dialog + vanilla client behavior on `/about` (PROG-43). Pixel-perfect Radix dialog islands are no longer required.
7. **Icons:** Role-split modules — `src/lib/icon-catalog.tsx` (maps only: `UI_ICONS` Lucide chrome + `BRAND_ICONS` tech/social) and `src/lib/icon-renderers.tsx` (`UiIcon` + `BrandIcon`). Astro pages and React islands both consume these (Astro hosts renderers at build time with no `client:*`). **All Lucide glyphs come from `unplugin-icons` + `@iconify-json/lucide`** (`~icons/lucide/*` curated in `UI_ICONS` / used via `UiIcon`, or imported directly in shadcn `ui/*`). **`lucide-react` is not a dependency.** Brand badges use Iconify (`devicon` / `logos` / `simple-icons`) with letter fallbacks and `.brand-icon` CSS hooks. After `shadcn add` / regen, rewrite any emitted `lucide-react` imports to `~icons/lucide/*` and do not re-add the package.
8. **Base path:** Local `ASTRO_BASE=/`; CI uses `/repo-name` via GitHub Actions vars.
9. **Bundle size:** Accept large interactive islands unless Lighthouse/TTI regresses.
10. **Fonts:** Geist / Geist Mono via Astro Fonts API (`fontProviders.fontsource`), exposed as `--font-geist` / `--font-geist-mono` and wired into `--font-sans` / `--font-mono`.
11. **Telemetry:** `ASTRO_TELEMETRY_DISABLED=1` for local scripts and CI.

## Consequences

- Cert/resume previews are static Starwind dialogs (no React dialog island).
- Interactive `/projects` toolbar and architecture diagram stay shadcn (Base UI) + ReactFlow islands.
- Lucide UI chrome is a single unplugin path (`UI_ICONS` / `UiIcon` + direct `~icons/lucide/*` in `ui/*`); do not reintroduce `lucide-react`.
- Returning visitors keep their `theme` preference; GH Pages `base` must be audited on every internal link via `withBase()`.

## Notes (PROG-43 supersede)

PROG-43 modernized the hybrid: expanded Starwind for about dialogs + shell buttons, migrated remaining shadcn primitives from Radix to Base UI, adopted Astro Fonts + Iconify registries, and disabled Astro telemetry. Theme-toggle and prose remain deferred.

## Notes (PROG-44 port)

- Theme-toggle Starwind, Starwind Prose, and broader Starwind expansion remain **deferred** (not part of the Lovable port). Content Collections + sync: landed — see [ADR 0003](./0003-content-collections-and-sync.md). Living human docs refreshed under PROG-45.
- About dialogs: **Starwind** (PROG-43) retained through the Lovable port — do not regress to a Radix dialog island.
- Prose: **`marked` SSG** for project descriptions (`src/lib/markdown.ts`); no `react-markdown` in the live stack.
- Client persistence expands beyond `theme`: also `motion`, `ambient-mode-dark` / `ambient-mode-light`, and `projects:view`. Toolbar filter criteria sync via URL search params (Astro island + `history`/`URLSearchParams`, not TanStack).
