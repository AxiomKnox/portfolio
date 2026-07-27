# Design system

Aesthetic: quiet, technical, developer-notebook. Hairline borders, mono
labels for meta, tight typography, restrained color used only for state
signals (status dots, primary accent).

Layer model (Astryx-shaped, stack-native — see
[`docs/research/design-system-structure-astryx-stylex-guide.md`](./research/design-system-structure-astryx-stylex-guide.md)):

| Layer | Answers | Where it lives |
| --- | --- | --- |
| **Foundations** | What values exist? | `src/styles.css` tokens + rules below |
| **Components** | What atoms exist? | Starwind + shadcn `ui/*` + app chrome |
| **Patterns** | How do we compose a portfolio surface? | Documented in place (no `patterns/` folder) |

**Starwind coexistence:** UI policy is [ADR 0002](../.agents/codebase/adr/0002-astro-starwind-shadcn-hybrid.md) — Starwind (or plain Astro) for the static shell; shadcn Base UI React islands only where interaction needs them. Design-system work documents and tokenizes on that hybrid; it does not fight upcoming Starwind migrations.

Never hardcode a color (`text-white`, `bg-black`, `bg-[#...]`) in a
component. Add or reuse a semantic token instead.

---

## Foundations

### Tokens (`src/styles.css`)

All colors are OKLCH tokens exposed as CSS variables, then mapped through
`@theme inline` so Tailwind utilities like `bg-background` and
`text-muted-foreground` resolve to them. Both light and dark palettes are
defined; the `.dark` class on `<html>` switches modes. Token groups stay in
one file (comment banners only — no `tokens/*.css` split).

| Group | Examples | Notes |
| --- | --- | --- |
| **Mode** | `--background`, `--foreground`, `.dark` overrides | Light/dark surfaces and text |
| **Brand / accent** | `--primary`, `--ring`, `--chart-1`, sidebar primary | **One brand accent** (blue OKLCH family). No swappable `data-accent` packs yet. |
| **Surface** | `--card`, `--muted`, `--border`, `--popover` | Elevated vs page |
| **Status** | `--status-dev` … `--status-archived` | Domain; paint via `.status-dot[data-status]` |
| **Type** | `--font-sans` / `--font-mono` | Geist via Astro Fonts |
| **Shape** | `--radius` (+ sm/md/lg/xl via `@theme`) | Derived radii |
| **Preview gradients** | `--preview-grad-1` … `--preview-grad-6`, `--preview-grad-avatar`, `--preview-grad-label` | Used by `.gradient-preview[data-gradient]` + label class (PROG-74) |
| **Motion / ambient** | `--ambient-blob-1`…`4`, `--ambient-star`, `data-motion`, blob/glow classes, page-transition vars | Prefs in `localStorage`; blob fills and star canvas paint are Foundations tokens |

Key tokens:

| Token | Purpose |
| --- | --- |
| `--background` / `--foreground` | Page surface + primary text |
| `--card` / `--card-foreground` | Elevated surfaces (cards, popovers) |
| `--muted` / `--muted-foreground` | Secondary surfaces + de-emphasized text |
| `--primary` / `--primary-foreground` | Brand blue accent (buttons, links, chart-1) |
| `--border` / `--input` / `--ring` | Hairlines, form outlines, focus rings |
| `--destructive` | Error state |
| `--status-dev` / `--status-alpha` / `--status-beta` / `--status-prod` / `--status-archived` | Project Status dots (`.status-dot`) |
| `--preview-grad-*` | Deterministic preview swatches (`grad-1`…`grad-6`, `grad-avatar`) |
| `--preview-grad-label` | Light label text on colorful preview swatches |
| `--ambient-blob-1` … `--ambient-blob-4` | Light-mode ambient shape fills (`.ambient-blob-*`) |
| `--ambient-star` | Dark-mode starfield canvas paint (`AmbientBackground`) |
| `--radius` (0.5rem) → derived `--radius-sm/md/lg/xl` | Corner radii |

Custom utility classes:

- `.bg-grid` — hairline dot/line backdrop used behind the hero and inside
  gradient previews.
- `.status-dot` — Status fill via `data-status`; see Status color system.
- `.gradient-preview` — Preview fill via `data-gradient`; see Preview gradients.
- `.gradient-preview-label` — Label on a swatch (`--preview-grad-label`).
- `.ambient-blob` / `.ambient-blob-*` — Light-mode soft shapes (`--ambient-blob-*`).
- `.ambient-glow` / `.ambient-glow-*` — Dark-mode glows (`color-mix` of `--primary` / `--foreground`).
- `.font-mono` — Geist Mono Variable for meta labels, chips, code.
- `.surface-frosted` / `.surface-solid` — frosted cards vs solid sections over ambient.

### Theme rules (mode + accent)

- Default theme is dark; the toggle persists to `localStorage["theme"]`.
- Root class `.dark` on `<html>` is toggled by `ThemeToggle`.
- **Accent:** single brand blue (`--primary` / `--ring`). Accent theming is a
  documented design rule, not a visitor toggle. Multi-pack `data-accent` is
  deferred.

### Tech icons: color in light, monochrome in dark

Brand icons render in pack/native color in light mode (with manual
`lightModeOverrideColor` for simple-icons that lack inherent brand color).
In dark mode, `.brand-icon` shapes are filled with `--muted-foreground` by
default. Icons with `darkModeGrayscale` opt out of that fill, keep native
SVG paints, and use `filter: grayscale(1)` instead (silhouette preserved).
Lucide UI icons do not use `.tech-icon` and stay tinted by `currentColor`
in both themes.

### Typography

- Sans: **Geist Variable** (`--font-sans`)
- Mono: **Geist Mono Variable** (`--font-mono`)
- Body ligatures: `font-feature-settings: "ss01", "cv11"`
- Antialiasing on `body`

Scale in practice:

| Use | Class |
| --- | --- |
| Hero title | `text-4xl sm:text-6xl font-medium tracking-tight` |
| Page title | `text-3xl sm:text-4xl font-medium tracking-tight` |
| Section h2 | `text-2xl font-medium tracking-tight` |
| Card title | `text-base font-medium tracking-tight` |
| Body | `text-sm text-muted-foreground` (or `text-foreground/90` for higher contrast) |
| Meta / label | `font-mono text-[10px] uppercase tracking-wider text-muted-foreground` |
| Chip / pill | `font-mono text-[10px]` |

The uppercase mono meta label (e.g. `/projects`, `PROD`, `TECH`) is a
recurring motif — use it any time you introduce a section or need a
low-key label.

### Prose / Markdown

Markdown from `Project.description` is rendered at build time by `marked`
(GFM) via `src/lib/markdown.ts`, then injected as HTML on the detail page.
Styling comes from `@tailwindcss/typography` via
`@plugin "@tailwindcss/typography"` in `src/styles.css`.

Applied classes on the wrapper:

```
prose prose-sm max-w-none dark:prose-invert
prose-headings:font-medium prose-headings:tracking-tight
prose-a:text-primary
prose-code:font-mono prose-code:text-xs
```

That gives headings, lists, blockquotes, tables, links, inline code, and
fenced code blocks with the site's tone.

### Status color system

Every project has a `Status` (`dev | alpha | beta | prod | archived`).
A small colored dot represents the state everywhere it's shown.

Paint lives in CSS tokens (`src/styles.css`), not per-component Tailwind
palette classes:

| Status | Token | Meaning |
| --- | --- | --- |
| `dev` | `--status-dev` | In active development |
| `alpha` | `--status-alpha` | Early testing |
| `beta` | `--status-beta` | Public beta |
| `prod` | `--status-prod` | Shipped |
| `archived` | `--status-archived` (→ muted-foreground) | Frozen / no longer maintained |

Markup uses `.status-dot` + `data-status="<Status>"`. Labels come from
`src/lib/status-display.ts`: **compact** (Prod / Dev) on cards and the
toolbar; **prose** (Production / In development) on the project detail
page. Domain order stays in `STATUS_ORDER` (`src/content/types/project.ts`).

If you add or rename a status, update `STATUS_ORDER`, the `--status-*`
tokens / `.status-dot[data-status]` rules, and `status-display.ts`.

### Preview gradients

When a project has no `preview.png` / `preview.webp`, or a profile has no
photo, UI shows a deterministic gradient swatch via `GradientPreview`.

| `data-gradient` / content token | CSS variable |
| --- | --- |
| `grad-1` … `grad-6` | `--preview-grad-1` … `--preview-grad-6` |
| `grad-avatar` | `--preview-grad-avatar` |

Unknown ids fall back to `grad-1` (`resolvePreviewGradientId` in
`src/lib/preview.ts`). Paint: `.gradient-preview[data-gradient="…"]`.
To add a swatch, add the CSS variable + a `data-gradient` rule, then register
the id in `PREVIEW_GRADIENT_IDS`.

### Spacing, borders, radii

- Page gutter: `px-6`; content max width: `max-w-6xl`.
- Section vertical rhythm: `py-16` to `py-24`.
- Cards: `rounded-lg border border-border bg-card`.
- Chips / pills: `rounded-md border border-border bg-background` for inactive,
  `bg-muted text-foreground border-foreground/40` for active.
- Hover on cards: subtle lift (`-translate-y-0.5`) + `border-foreground/30`
  + a soft shadow — never a color flood.

---

## Components

Atoms and chrome. Full props/behavior: [`docs/components.md`](./components.md).
Layouts: [`docs/layouts.md`](./layouts.md).

| Role | Path |
| --- | --- |
| Starwind (static Astro) | `src/components/starwind/**` — button, dialog |
| shadcn Base UI (islands) | `src/components/ui/**` — button, accordion, calendar, dropdown-menu, popover |
| App chrome | `Navbar`, `Footer`, `ThemeToggle`, `MotionToggle`, `AmbientToggle`, `AboutPreviewDialog`, `AmbientBackground` |

Prefer Starwind / Astro for static shell; reach for `ui/*` only when the
island needs Base UI behavior (toolbar, menus, calendar).

---

## Patterns

Portfolio recipes — **documented in place** (paths stay put; no
`src/components/patterns/` move). Ownership one-liners:

| Pattern | Path | Owns |
| --- | --- | --- |
| Project card / row | `ProjectCard.tsx` | Grid vs list presentation of a `Project` + preview/tech chips |
| Projects toolbar | `ProjectsToolbar.tsx` + `projects-toolbar/*` | Filter / search / sort / view exploration UI |
| Projects page island | `islands/ProjectsPageIsland.tsx` | Client boundary hosting toolbar + cards |
| Architecture diagram | `ArchitectureDiagram.tsx` + architecture island | React Flow project graph shell |
| Gradient preview | `GradientPreview.tsx` | Tokenized preview/avatar swatch (Foundations paint) |
| Hero grid | `HeroGrid.tsx` | Home hero composition |
| Steps accordion | `StepsAccordion.*` | Multi-step disclosure on relevant pages |
| About preview dialogs | `AboutPreviewDialog.astro` | Starwind dialog wrappers for cert/resume |

When a pattern already needs a behavioral change, updating its entry here
(and in `components.md`) is enough — do not big-bang relocate files for
layer clarity alone.
