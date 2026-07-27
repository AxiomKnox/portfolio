# Utilities

Small helpers and hooks that hold the site together. Each entry links to
its source.

## Icon catalogs + renderers

**Catalogs** — `src/lib/icon-catalog.tsx`  
**Paint** — `src/lib/icon-renderers.tsx`

All glyphs compile through `unplugin-icons` (`~icons/…` + `@iconify-json/*`).
There is no `lucide-react` package.

### UI (Lucide chrome)

`UI_ICONS` maps typed names (`mail`, `x`, `search`, …) to `~icons/lucide/*`
components. `<UiIcon name size className />` looks up the map, throws if
missing, and renders with `aria-hidden` (decorative chrome).

Prefer `UiIcon` in app islands. shadcn `ui/*` may import
`~icons/lucide/chevron-down` (etc.) directly when a Lucide *component*
is required as a prop.

### Brand / tech / social

`BRAND_ICONS` maps lowercased aliases to Iconify components (`devicon` /
`logos` / `simple-icons`) plus optional `lightModeOverrideColor` /
`darkModeGrayscale`.

**`getBrandIconEntry(name)`** — case-insensitive lookup.  
**`missingBrandIcons` / `assertBrandCatalogCoverage`** — content-load
coverage (called from `src/content/adapter.ts`).

**`<BrandIcon name size className />`**:

- If the icon resolves, renders the SVG with class `brand-icon` so light
  override / dark grayscale rules in `src/styles.css` apply.
- If it doesn't resolve, renders a fallback tile: the first character of
  `name`, uppercase, in monospace, on `bg-muted` at the requested size.
- `role="img"` + `aria-label={name}` for accessibility.

Adding a new brand: extend `BRAND_ICONS` with a `~icons/devicon|logos|simple-icons`
entry. Prefer that over relying on the letter tile.

## `parseQuery(input)` — `src/components/ProjectsToolbar.tsx`

Turns the raw search string into `{ text, tech, year, status }` string
arrays. Regex-based, supports quoted values (`tech:"React"`), unquoted
key:value tokens (`year:2024`), and bare words. Unknown keys fall
through to `text`. See `filtering-search.md` for the grammar and
call-site behavior.

## `formatDate(iso)` — project detail pages

Converts an ISO date to a compact `MMM d, yyyy` string via
`Intl.DateTimeFormat` (`en-US`, `{ year, month: "short", day: "numeric" }`).
Returns the original string if parsing fails so bad data never crashes
the page.

## `sortDate(project)` — `src/content/types/project.ts`

Currently `p => p.releaseDate`. Called by featured sorting and
`filterAndSortProjects` in `src/lib/project-discovery.ts`. Wrapping it in
a helper lets us change the sort field later in one place.

## Project discovery — `src/lib/project-discovery.ts`

Pure helpers for `/projects`: `ToolbarState`, Search-token `parseQuery`,
URL `readSearchState` / `writeSearchParams`, and `filterAndSortProjects`.
The island and toolbar import from here — no React in this module.

## Page transitions — `src/lib/page-transition.ts` + `site-prefs-client.ts`

Astro `ClientRouter` view transitions. Page shell uses a **parallel
crossfade** on `main-content` (old and new animate together, same
duration, zero delay — not sequential exit-then-enter). Project cards
also share a **named element** (`project-{id}-image`) so only the preview
image morphs into the detail hero (React islands set `view-transition-name`;
the detail image uses the same name). The morph runs concurrently with the
shell fade — the image is punched out of the `main-content` snapshot, so the
two never fight. The title is not a shared element; it fades with the page.

- Always applies `data-page-transition="fade"` (no preset picker / storage)
- `projectImageTransitionName` — stable shared-element id (image only)
- `navigationUsesProjectSharedElements` — gates the morph to `/`·`/projects` ↔ detail (both directions); every other nav is a plain fade
- `shouldSkipPageTransitionAnimations` — when `data-motion="reduced"`
- CSS in `src/styles.css` (`::view-transition-*` for `main-content`; skip wildcards also suppress the image morph)

## `cn(...classes)` — `src/lib/utils.ts`

Standard shadcn helper: `twMerge(clsx(inputs))`. Use whenever you need
to combine conditional class names in a way that respects Tailwind's
last-wins semantics.

## `useIsMobile()` — `src/hooks/use-mobile.tsx`

Returns a boolean that flips at 768px via `matchMedia`. Used by shadcn
primitives; available for any component that needs to branch layout
imperatively (prefer CSS breakpoints when possible).

## `STATUS_ORDER` — `src/content/types/project.ts`

The canonical progression `["dev","alpha","beta","prod","archived"]`.
Anywhere that lists statuses (toolbar filter pills, sort ordering) reads
from this so a future rename or reorder is one edit. Re-exported from
`src/content/adapter.ts` for pages.
