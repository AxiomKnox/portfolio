# Component catalog

Custom components live in `src/components/`. shadcn/ui primitives live in
`src/components/ui/` and are used as-is (except Lucide: use `~icons/lucide/*`,
never `lucide-react`). This file documents the project-specific components only.

**Layer roles** (see [`design-system.md`](./design-system.md)): Starwind +
`ui/*` + chrome toggles/Navbar/Footer are **Components**; portfolio recipes
(`ProjectCard`, toolbar, islands, `GradientPreview`, etc.) are **Patterns**
documented in place — no `patterns/` folder move.

## `Navbar` — `src/components/Navbar.astro`

Sticky top bar with `backdrop-blur`. Static `links` array; edit here to add
nav entries. Renders the `AM` initials tile, full name (from profile), and
theme / motion / ambient toggles.

## `Footer` — `src/components/Footer.astro`

Name, one-paragraph credit line, copyright with current year, and social
icons rendered as `<BrandIcon>` inside 9x9 rounded borders. Data comes from
`profile.links`.

## `AboutPreviewDialog` — `src/components/AboutPreviewDialog.astro`

Starwind dialog for certification rows on `/about`. It shows a dashed
placeholder pane, not a PDF. Do not pass a PDF URL into this dialog:
Firefox-family browsers download `iframe` / `object` / `embed` of
`application/pdf` as soon as that markup is in the DOM.

Resume Preview and Download on `/about` are ordinary links that share the
same outlined secondary classes as the other About actions. Preview opens
the file (`target="_blank"`). Download uses the `download` attribute.

## `ThemeToggle` / `MotionToggle` / `AmbientToggle`

Astro markup in `src/components/*Toggle.astro`. Click handlers and icon
paint live in `src/lib/site-prefs-client.ts` so they stay actionable
across View Transitions (`transition:persist` on the Navbar).

- **Theme** — `localStorage["theme"]` (`light` / `dark`); toggles `.dark`
  on `<html>`. FOUC boot in `Layout.astro` applies before first paint.
- **Motion** — `localStorage["motion"]` (`reduced` / `full`) or OS
  `prefers-reduced-motion`; sets `data-motion="reduced"` and skips page
  transitions when reduced.
- **Ambient** — `ambient-mode-dark` / `ambient-mode-light`; dispatches
  `ambient-style-change` for `AmbientBackground`.

## `ProjectCard` / `ProjectRow` — `src/components/ProjectCard.tsx`

Two presentations of the same `Project`, selected by the toolbar's view
mode. The preview image sets a matching `view-transition-name`
(`project-{id}-image`) so ClientRouter morphs it into the detail hero;
the title just fades with the rest of the page.

**`ProjectCard`** (grid):
- `<GradientPreview>` header
- Category · status dot · status label (mono meta row)
- Title, 2-line clamped summary
- Up to 3 tech chips with `<BrandIcon>`; overflow shown as `+N`
- Hover: subtle lift + border tint + soft shadow

**`ProjectRow`** (list):
- Smaller left thumbnail (`h-24 w-40`, hidden on mobile)
- Same meta row, full tech chip list (no truncation)

Both wrap the entire card in an `<a href={withBase(\`/projects/${id}\`)}>`.

Internal `CATEGORY_LABEL` is defined at file top. Status dots use
`.status-dot` + `data-status`; labels via `statusLabel(..., "compact")`
from `src/lib/status-display.ts`.

## `GradientPreview` — `src/components/GradientPreview.tsx`

Renders a fixed gradient chosen by `id`. Adds a low-opacity `bg-grid`
overlay with `mix-blend-overlay` for texture. Optional `label` appears
bottom-left in mono white/70.

Registered gradients: `grad-1` … `grad-6`, plus `grad-avatar` (used on
`/about`). Paint is Foundations CSS (`--preview-grad-*` +
`.gradient-preview[data-gradient]`); optional labels use
`.gradient-preview-label` / `--preview-grad-label`. Ids resolve via
`resolvePreviewGradientId` in `src/lib/preview.ts`. Unknown ids fall back
to `grad-1`. To add a swatch, add the CSS token/rule and register the id
in `PREVIEW_GRADIENT_IDS`.

## `ProjectsToolbar` — `src/components/ProjectsToolbar.tsx`

The projects index toolbar. See `filtering-search.md` for the full model.
At a glance:

- Category tabs (single-select).
- Search input with a suggestion popover (Tech / Year / Status quick
  actions). Supports typed tokens.
- Filter popover: Status pills, Links toggles (Has source / Has live
  site), Tech-stack multi-select derived from every project's `techStack`.
- Date popover: two-month `Calendar` in range mode with
  `captionLayout="dropdown"` (year + month dropdowns).
- Sort dropdown: `newest | oldest | title | status`.
- View toggle: `grid | list`.
- Active-chip row below the toolbar, each with an `X` to remove.
- Exports the `parseQuery(input)` helper used by the projects island.
- Lucide chrome via `<UiIcon>` from `icon-renderers` (catalog in `icon-catalog`).

## `ArchitectureDiagram` — `src/components/ArchitectureDiagram.tsx`

Wraps `reactflow` with:

- A custom `StepNode` node type that shows a numeric `step` label and a
  human title, and applies an active ring when `selectedId` matches.
- Edges are `smoothstep`, animated when either endpoint is selected.
- `fitView`, `nodesDraggable={false}`, attribution hidden.
- Node click → `onSelect(node.id)` (drives the accordion).

## `StepsAccordion` — `src/components/StepsAccordion.tsx`

shadcn `Accordion` in single-collapsible mode bound to the same
`selectedId` as the diagram. Each item shows a two-digit index, the step
title, and — when expanded — the step's `detail` string. Toggling either
side updates the shared selection.

## Icons — `src/lib/icon-catalog.tsx` + `src/lib/icon-renderers.tsx`

**4→2 layout (current):** catalogs and paint policies are split, not four
legacy files (`Icon.astro` / `icon-registry` / `brand-icons` / `tech-icons`).

| Export | Module | Role |
| --- | --- | --- |
| `UI_ICONS` / `UiIconName` | `icon-catalog` | Curated Lucide chrome map (`~icons/lucide/*`) |
| `BRAND_ICONS` / coverage helpers | `icon-catalog` | Brand/tech/social map + `assertBrandCatalogCoverage` |
| `UiIcon` | `icon-renderers` | Strict Lucide chrome renderer (`aria-hidden`, throws if missing) |
| `BrandIcon` | `icon-renderers` | Brand glyph or letter fallback; `.brand-icon` CSS hooks |

- **UI chrome:** Astro pages and islands use `<UiIcon name="…" />`. shadcn
  `ui/*` imports `~icons/lucide/*` React components directly (same Iconify
  pipeline). **No `lucide-react` dependency.**
- **Brand:** `<BrandIcon name size className />` — letter tile when unknown;
  light-mode override / dark grayscale via `data-*` + `styles.css`.
- Adding UI chrome: extend `UI_ICONS`. Adding a brand: extend `BRAND_ICONS`
  (prefer Iconify entry over letter fallback).

See `utilities.md` for catalog details.
