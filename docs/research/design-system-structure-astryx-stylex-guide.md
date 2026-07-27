# Design-system structure for this portfolio (Astryx / Stylex as guides)

**Date:** 2026-07-26 (comparison addendum 2026-07-27)  
**Scope:** Research only — recommend a **structure** for tokens / themes / components; re-evaluate **adopt Astryx wholesale** vs **implement its shape** without the library.  
**Non-goals for this note:** Do not implement, restyle, or change Linear. Do not add packages here.  
**Owner intent (Linear project comment, 2026-07-20):**

> Try this for design systems… Astryx… Or at least research it and implement a similar but more custom to use case… for design systems, components, typography, colors, theming (**not** light/dark mode but accents)… Try & Play around with Stylex as well.

**2026-07-27 re-open:** Owner asked whether adopting Astryx wholesale might actually be better than only copying its structure. Re-evaluated without status-quo bias (see §9).

Working default until owner chooses otherwise: **structure and mental model** from Astryx/Stylex; stay on Astro + Starwind/shadcn hybrid ([ADR 0002](../../.agents/codebase/adr/0002-astro-starwind-shadcn-hybrid.md)) — unless §9’s adopt path is explicitly chosen.

---

## 1. Question

What layered design-system structure fits **this** portfolio (Astro SSG, Starwind static shell, shadcn Base UI React islands, Tailwind v4 + CSS variables in `src/styles.css`), and is that better delivered by **adopting Astryx** or by **implementing Astryx’s shape** on the existing stack?

---

## 2. Sources (primary)

| Source | Role |
| --- | --- |
| [Linear project comment](https://linear.app/general-stuff/project/personal-project-portfolio-027014ac53c4) (2026-07-20, Astryx/Stylex) | Owner ask: structure + accents; library optional |
| [Astryx site](https://astryx.atmeta.com/) + [introducing post](https://astryx.atmeta.com/blog/introducing-astryx) (2026-06-18) | System promise: behavior vs look; agent-ready; Beta |
| [Astryx README](https://github.com/facebook/astryx/blob/main/README.md) | Foundations / Components / Patterns; React + StyleX; theme packages; 150+ components |
| [`@astryxdesign/core` README](https://github.com/facebook/astryx/blob/main/packages/core/README.md) | Quick start: CSS imports + React `Theme` provider; Next/Vite-first; Tailwind bridge; CLI/`astryx init` |
| [Astryx styling docs](https://astryx.atmeta.com/docs/styling) | Tokens as CSS custom properties; Tailwind bridge; data-attribute selector surface; StyleX only required for swizzle |
| [StyleX defining variables](https://stylexjs.com/docs/learn/theming/defining-variables) | Token groups + defaults; derived tokens; Context-like theming |
| [StyleX creating themes](https://stylexjs.com/docs/learn/theming/creating-themes) | Themes = override packs applied to a subtree |
| `docs/design-system.md`, `src/styles.css`, ADR 0002, `starwind.config.json` | Current portfolio seams (re-checked 2026-07-27) |
| PROG-74 | Known debt: GradientPreview hard hexes → tokens |

Secondary (context only): Meta marketing posts summarizing Astryx layers — claims traced back to README/docs above.

---

## 3. What Astryx / StyleX teach (steal the ideas, not the packages)

### 3.1 Astryx — three layers + theme packs

From the Astryx README architecture:

1. **Foundations** — typography, color, layout, accessibility primitives  
2. **Components** — reusable building blocks (behavior + a11y)  
3. **Patterns** — recipes for common workflows (tables, detail layouts, nav, …)

Core separation (intro + styling docs):

- **System** owns behavior, accessibility, quality  
- **Themes** own look via **CSS custom property overrides** (token-level: color, type, radius, motion)  
- Consumers may style with StyleX *or* Tailwind/`className` — **all resolve to the same tokens**  
- Preferred external CSS hook: stable component class + **`data-*` prop/state attributes** (not bare `.primary` classes)  
- Agent-ready docs/CLI: one predictable surface for humans and agents  

Packages split (`core` vs `theme-*`) is an organizational hint: **core components stay theme-agnostic; brand packs are swappable CSS**.

### 3.2 StyleX — token groups and theme overrides

StyleX theming APIs (even if unused here) encode a clean model:

1. **`defineVars` groups** — e.g. `colors`, `spacing` — with defaults (optionally mode-aware via media queries)  
2. **Derived tokens** — compile-time functions that build on other tokens in the same group  
3. **`createTheme`** — alternate value packs for a **subtree** (Context-like), not a global fork of every component  

Useful translation without StyleX: keep **named token groups**, allow **derived** values, and treat **accent packs** as override sets that sit beside light/dark — matching the owner’s “theming = accents, not light/dark” comment.

### 3.3 Mapping ideas → this stack

| Idea from Astryx/StyleX | Already true here (2026-07-27) | Gap |
| --- | --- | --- |
| Tokens as CSS variables | `src/styles.css` `:root` / `.dark` + `@theme inline` (shadcn-shaped names: `--background`, `--primary`, …) | Groups mixed in one file; preview gradients hard-coded (PROG-74); light ambient blobs still raw hex (`#bae6fd`, …) |
| Light/dark as mode | `.dark` on `<html>` + `ThemeToggle`; motion/ambient via `data-motion` + localStorage | Accent packs not modeled separately from mode (no `data-accent`) |
| Tailwind bridge to tokens | `@theme inline` → `bg-background`, etc. | Living-docs drift addressed under PROG-45 wave; layer TOC still missing |
| Data-attr state paint | `.status-dot[data-status]`; brand-icon / motion data attrs | Good pattern to extend for accent/variant axes |
| Foundations / components / patterns | Informal (`docs/design-system.md`, layouts, component tree) | No explicit three-layer TOC or folder contract |
| Behavior vs look | ADR 0002 hybrid (Starwind Astro shell / shadcn Base UI islands) | Hybrid is policy; not yet described as “design system layers” |
| Agent-ready single surface | `.agents/` + `docs/` (+ CodeGraph/Graphify) | Design-system structure not yet a crisp agent map (Astryx CLI would be a different surface) |

---

## 4. Recommended structure (for THIS portfolio)

Keep libraries: **Tailwind v4 + CSS variables + Starwind + shadcn**. Do not add StyleX or `@astryxdesign/*` unless owner chooses the adopt path in §9.

### 4.1 Conceptual layers (document + enforce)

```text
Foundations     tokens, type scale, spacing/radius, motion/ambient prefs, status palette, icon rules
Components      Starwind (static) + shadcn ui/* (islands) + shared chrome (Navbar, Footer, toggles)
Patterns        visitor recipes: project card/row, toolbar exploration, architecture diagram shell, about dialogs
```

- **Foundations** answer: “what values exist?”  
- **Components** answer: “what interactive/static atoms exist?”  
- **Patterns** answer: “how do we compose a portfolio surface?”  

This mirrors Astryx’s Foundations / Components / Patterns without importing their component set.

### 4.2 Token groups (StyleX-shaped, CSS-native)

Organize (and eventually split or clearly section) `src/styles.css` as:

| Group | Examples today | Notes |
| --- | --- | --- |
| **Mode** | `--background`, `--foreground`, `.dark` overrides | Light/dark only |
| **Brand / accent** | `--primary`, `--ring`, chart accents | Future: swappable accent packs *without* forking mode |
| **Surface** | `--card`, `--muted`, `--border`, `--popover` | Elevated vs page |
| **Status** | `--status-dev` … `--status-archived` | Domain-specific; keep data-attr API |
| **Type** | `--font-sans` / `--font-mono`, documented scale in `design-system.md` | Geist via Astro Fonts |
| **Shape** | `--radius` (+ sm/md/lg/xl) | Already derived |
| **Motion / ambient** | prefs in `localStorage` (`motion`, ambient modes) | Promote key motion timings/opacities to tokens when touched |
| **Preview gradients** | today hex map in `GradientPreview.tsx` | Move to CSS tokens (PROG-74) under Foundations |

Rule (already in `docs/design-system.md`, reinforce): components never hardcode colors; only Foundations tokens.

**Accent theming (owner ask):** model accents as a **second axis** beside mode:

```text
<html class="dark" data-accent="blue">   <!-- or class accent-blue -->
```

Mode swaps surfaces/text; accent pack swaps `--primary` / `--ring` / related brand signals. Do not collapse “theme” to mean only light/dark.

### 4.3 Component placement (minimal churn)

Preserve ADR 0002 layout; make roles explicit in docs (folder moves optional later):

| Path | Layer role |
| --- | --- |
| `src/styles.css` (+ optional future `src/styles/tokens/*.css`) | Foundations |
| `src/components/starwind/**` | Components — static Astro primitives |
| `src/components/ui/**` | Components — React island primitives (shadcn) |
| `src/components/{Navbar,Footer,*Toggle,AboutPreviewDialog}.*` | Components — app chrome |
| `src/components/{ProjectCard,ProjectsToolbar,ArchitectureDiagram,GradientPreview,HeroGrid,StepsAccordion}.*` | Patterns (or “portfolio components”) |
| `src/components/islands/**` | Pattern hosts (client boundaries) |
| `docs/design-system.md` | Foundations catalog |
| `docs/components.md` + `docs/layouts.md` | Components + Patterns catalogs |

Optional later (only if owner wants physical clarity): `src/components/patterns/` for portfolio recipes — **not required** to start; a documented TOC is enough.

### 4.4 Theme application model (StyleX Context idea → CSS)

StyleX applies themes to a **subtree**. Here the natural root is `<html>` / `Layout.astro`:

1. **Mode** — `.dark` (existing)  
2. **Accent** — `data-accent` or class (new, when guided)  
3. Components continue to consume semantic Tailwind utilities (`bg-background`, `text-primary`) that already map through `@theme inline`

No StyleX compiler; no Astryx theme packages.

### 4.5 Docs as the “agent surface”

Astryx invests in one predictable docs/CLI surface. For this repo, the cheap equivalent is:

1. Rewrite `docs/design-system.md` TOC as **Foundations → Themes (mode + accent) → Components → Patterns**  
2. Cross-link ADR 0002 hybrid policy  
3. List “do not hardcode” + data-attr conventions  
4. Keep agent routing pointed at that doc (living-docs pass = PROG-45)

---

## 5. Suggested phased adoption (when owner guides)

Research-only ordering — **no implementation in this ticket:**

| Phase | Outcome | Fits existing tickets |
| --- | --- | --- |
| **A — Structure docs** | Layered TOC in `docs/design-system.md`; mark pattern vs atom in `components.md` | Can precede or fold into PROG-45 |
| **B — Token hygiene** | Gradient hexes → CSS tokens; section/split token groups in CSS | PROG-74 |
| **C — Accent axis** | Decide accent packs + `data-accent` contract; keep mode separate | New, needs owner choices |
| **D — Pattern catalog** | Name portfolio patterns (card/row, toolbar, architecture, about dialogs) with one ownership sentence each | Docs-only until a visual change |
| **E — Hybrid policy stay** | No Astryx components; no StyleX; Starwind/shadcn boundaries unchanged unless new ADR | ADR 0002 |

Out of spine until owner says otherwise: full folder reorg, Storybook, Astryx CLI/MCP, StyleX build plugins.

---

## 6. Coverage verdict

| Need | Verdict |
| --- | --- |
| Structure guidance without adopting Astryx/Stylex | **Yes** — Foundations / Components / Patterns + CSS token groups + accent-vs-mode |
| Adopt Astryx wholesale for this portfolio | **Not recommended now** — see §9 (wins only under specific conditions) |
| Fits Astro hybrid | **Shape path:** yes. **Adopt path:** fights ADR 0002 + expands client JS |
| Owner “accents not just light/dark” | **Addressed** as second theme axis; values TBD (Q1) |
| Ready to implement end-to-end design system | **No** — waiting on owner guidance (questions below) |

---

## 7. Questions for the owner (detailed)

Answer these to lock Phase A/B scope. Each option lists tradeoffs for **this** repo. Leans are suggestions, not decisions.

### Q1 — Accent packs: one brand blue vs several named packs

**What this means here:** Today `--primary` / `--ring` / chart-1 / sidebar-primary are a single blue OKLCH family in `:root` and `.dark`. There is no `data-accent` (or equivalent). “Theming” in the owner comment meant **accents**, not another light/dark system.

| Option | What you get | Cost / risk | Lean |
| --- | --- | --- | --- |
| **A. Single accent (status quo + document)** | One brand blue; docs name it the only accent axis value; light/dark still swap surfaces | Zero new UI; no visitor toggle; accent “theming” stays a design rule, not a runtime feature | **Default if you want structure work without product surface** |
| **B. 2–3 named packs (e.g. blue / teal / amber)** | Real second axis: `<html class="dark" data-accent="teal">` overrides `--primary` (and related brand signals); optional future toggle | Must define which tokens each pack owns; decide persistence (localStorage vs none); avoid colliding with status palette and chart hues | Choose if you want playable accent demos or multi-mood branding |
| **C. Many packs / full theme marketplace style** | Astryx-like theme package thinking | Overkill for a personal portfolio; maintenance and a11y contrast matrix explode | Avoid unless this site becomes a multi-brand sandbox |

**Ask:** Do you want accents as a **documented single brand**, or as **swappable packs visitors (or you) can switch**?

---

### Q2 — Docs-only layering first vs also splitting CSS

**What this means here:** Almost all foundations live in one `src/styles.css` (~500 lines): `@theme inline`, `:root`/`.dark`, status dots, ambient blobs/glows (light ambient still hard hex), frosted/solid surfaces, view-transition tokens, React Flow tweaks. `docs/design-system.md` catalogs tokens but not Foundations → Components → Patterns.

| Option | What you get | Cost / risk | Lean |
| --- | --- | --- | --- |
| **A. Docs-only Phase A** | Rewrite `docs/design-system.md` TOC as Foundations / Themes (mode + accent) / Components / Patterns; mark pattern vs atom in component docs; no file moves | Immediate agent/human clarity; zero visual/runtime risk; CSS stays messy until a later pass | **Preferred first step** — cheap, reversible, unblocks mental model |
| **B. Docs + CSS section headers only** | Same as A, plus clear comment banners inside `styles.css` (`/* === Mode === */`, etc.) without new files | Slightly better navigation for agents editing tokens; still one file for Vite/Tailwind | Good middle if you dislike multi-file CSS |
| **C. Split into `src/styles/tokens/*.css` in the first pass** | Physical Foundations modules (mode, brand, status, motion, …) imported from `styles.css` | Import-order / `@layer` footguns with Tailwind v4 + Starwind; churn while migration spine is busy; little visitor value | Defer until after PROG-74 or when `styles.css` pain is acute |

**Ask:** Is Phase A **documentation (and maybe comment banners)**, or do you want a **file split in the same change**?

---

### Q3 — Is PROG-74 the right first Foundations code slice?

**What PROG-74 is:** Move `GradientPreview.tsx`’s `GRADIENTS` map (`grad-1`…`grad-6`, `grad-avatar` — raw hex linear-gradients) into CSS tokens in `styles.css`, no visual change. Callers: `ProjectCard`, about, project detail. Status: Backlog under deferred UX parent (PROG-72), not part of PROG-45 docs refresh.

**Related debt (same spirit, not in PROG-74):** Light-mode `.ambient-blob-*` backgrounds are still hex (`#bae6fd`, `#fecaca`, …) while dark glows already use `color-mix` on `--primary` / `--foreground`.

| Option | What you get | Cost / risk | Lean |
| --- | --- | --- | --- |
| **A. Yes — PROG-74 first** | Small, ticketed, measurable Foundations win; proves “components don’t hardcode color”; good rehearsal for accent/token discipline | Doesn’t by itself create accent packs or layer docs | **Yes, after or with thin docs Phase A** |
| **B. Docs Phase A only first; PROG-74 later** | Structure vocabulary before any CSS churn | Hex debt remains; agents keep seeing hardcodes as “normal” | Fine if spine bandwidth is tight |
| **C. Broader Foundations sweep first** (gradients + ambient light hexes + token group cleanup) | Cleaner token story in one pass | Larger diff; harder review; mixes tickets | Only if you explicitly want a Foundations mini-epic |

**Ask:** Should the first **code** slice stay narrowly **PROG-74**, or widen to ambient hexes / token grouping at the same time?

---

### Q4 — Patterns folder vs document-in-place

**What this means here (current tree):**

| Role (conceptual) | Paths today |
| --- | --- |
| Components — Starwind | `src/components/starwind/{button,dialog}/**` (Astro; `starwind.config.json`) |
| Components — shadcn islands | `src/components/ui/{button,accordion,calendar,dropdown-menu,popover}.tsx` |
| Components — chrome | `Navbar`, `Footer`, `ThemeToggle`, `MotionToggle`, `AmbientToggle`, `AboutPreviewDialog` |
| Patterns (portfolio recipes) | `ProjectCard`, `ProjectsToolbar` (+ `projects-toolbar/*`), `ArchitectureDiagram`, `GradientPreview`, `HeroGrid`, `StepsAccordion`, `islands/*` |

| Option | What you get | Cost / risk | Lean |
| --- | --- | --- | --- |
| **A. Document-in-place** | Catalog each pattern in docs with one ownership sentence; keep import paths stable | Zero churn; agents must read docs to know “pattern vs atom” | **Preferred until a file is already being touched for another reason** |
| **B. Create `src/components/patterns/` when touching** | Physical clarity as you edit ProjectCard/toolbar/etc.; gradual move | Import churn, test path updates, merge conflict risk mid-spine | OK as a rule of thumb for *future* edits, not a big-bang move |
| **C. Big-bang patterns folder now** | Clean tree immediately | Noise PR; fights “no drive-by refactors”; no visitor value | Avoid |

**Ask:** For patterns, do you want **docs ownership only**, or a **lazy folder move** policy when those files are already in a change?

---

### Q5 — Timing vs migration spine (optional)

Park design-system structure until after PROG-64/60 and T6→T9/T10/T11→merge, or allow a **thin docs Phase A** in parallel? Docs-only A is low conflict; CSS splits and Astryx adoption are not.

---

## 8. Ready state

Research + adopt-vs-shape comparison complete (2026-07-27). **Recommendation: implement the shape on the current Astro + Starwind/shadcn stack; do not adopt Astryx/StyleX packages unless the conditions in §9 flip.**

**Owner answers locked 2026-07-27** (see §10). Phase A (docs + optional CSS banners) and narrow Phase B (PROG-74) proceeded from those locks.

---

## 9. Adopt Astryx vs implement the shape (2026-07-27)

### 9.1 What “adopt Astryx” would mean

From primary sources ([README](https://github.com/facebook/astryx/blob/main/README.md), [core Quick Start](https://github.com/facebook/astryx/blob/main/packages/core/README.md), [styling docs](https://astryx.atmeta.com/docs/styling), [introducing post](https://astryx.atmeta.com/blog/introducing-astryx)):

- **Beta** React design system (StyleX-authored internals; consumers need **no** StyleX compiler unless swizzling).
- Install `@astryxdesign/core` + a `@astryxdesign/theme-*`, import reset/core/theme CSS (optional Tailwind bridge), wrap UI in React `<Theme>`.
- ~150 components, theme packs as CSS custom-property overrides, CLI (`astryx init`, component docs, templates, theme build) aimed at humans **and** agents.
- Documented happy paths: **Next.js and Vite**; Astro SSG + Astro components are not first-class in the quick start.

### 9.2 What you’d replace / integrate with **now**

| Current seam | Role | Adopt impact |
| --- | --- | --- |
| ADR 0002 hybrid | Starwind Astro shell; shadcn Base UI only where needed; minimize client JS | **Supersede or heavily revise** — Astryx components are React |
| `src/components/starwind/**` | Button + Dialog (Astro, zero island JS for about dialogs) | Replace with Astryx React → new islands / client boundaries |
| `src/components/ui/**` | shadcn Base UI (toolbar, calendar, menus, …) | Replace or dual-run (worst of both) |
| `src/styles.css` + `@theme inline` | shadcn-shaped OKLCH tokens (`--background`, `--primary`, status-*, ambient, view transitions) | Remap to Astryx token names (`--color-background-surface`, etc.) or maintain a parallel bridge — large, fragile |
| Domain UI | Status dots, `GradientPreview`, ambient prefs, React Flow architecture island, projects toolbar | Keep as custom patterns anyway — Astryx doesn’t own portfolio domain |
| Agent surface | `.agents/` + `docs/` + graph tools | Gain Astryx CLI index; lose coherence if two systems document components |
| Deploy | Astro static → GitHub Pages | CSS import OK; **JS weight and island count** are the real cost |

### 9.3 Honest tradeoffs

| | **Adopt Astryx** | **Implement the shape** (recommended) |
| --- | --- | --- |
| **Wins** | Maintained a11y primitives; theme packs + Tailwind bridge; CLI/agent component index; Foundations/Components/Patterns as a productized system | Keeps ADR 0002 + SSG budget; matches existing OKLCH/shadcn token vocabulary; small phased wins (docs → PROG-74 → accents); portfolio-specific patterns stay first-class |
| **Loses / pays** | Rewrite shell to React; dual token systems or full remapping; Beta churn; migration spine distraction; little reuse for ReactFlow/toolbar/status | You maintain Starwind/shadcn seams yourself; no Meta CLI; accent packs & layer docs are DIY |
| **Fit to goal** | Strong if the goal is “run Meta’s DS” | Strong if the goal is “structured tokens/themes/components for **this** site” (owner’s original “similar but custom”) |

### 9.4 Verdict

**For this project today: implement the shape — do not adopt Astryx wholesale.**

The valuable part of Astryx for a personal Astro portfolio is already portable: **layered mental model**, **themes as CSS variable packs**, **accent axis beside mode**, **data-attribute paint**, **docs as the agent surface**. The expensive part of Astryx — **React component ownership + Theme provider + token rename** — fights the accepted hybrid and the domain-specific UI you already built.

**When adopt would win instead:**

1. You **abandon or reverse** ADR 0002 toward a React-first shell (most UI as islands or a Vite/Next app), **and**
2. You want **catalog + CLI** more than a minimal GH Pages portfolio, **and**
3. You’re willing to **remap tokens and restyle** to an Astryx theme (or invest in `defineTheme`), **and**
4. Beta risk and a multi-week UI migration are acceptable **outside** the current content/sync spine.

**When shape clearly wins (current state):** Astro SSG + Starwind dialogs/buttons, shadcn islands only where interactive, custom ambient/motion/status/gradients, migration still in flight, owner ask centered on structure and accents.

**Middle path (usually not worth it):** “Astryx themes CSS only” without components — you still inherit foreign token names and layer CSS without gaining the component/CLI payoff; better to keep shadcn-shaped vars and copy the **pack** idea.

---

## 10. Locked decisions (2026-07-27)

Owner guidance for Phase A/B (answers to §7):

| Q | Lock |
| --- | --- |
| **Q1 Accent** | **A — one brand accent first.** Document the existing blue `--primary` / `--ring` family as the only accent; no `data-accent` packs yet. |
| **Q2 Docs vs CSS split** | **Docs-first.** No `src/styles/tokens/*.css` split. Light comment banners inside `src/styles.css` are OK if useful. |
| **Q3 PROG-74 scope** | After thin docs Phase A, do **narrow** PROG-74 only: `GradientPreview` hex map → CSS tokens. Do **not** widen to ambient light hexes or a full token-group sweep in the same change. |
| **Q4 Patterns** | **Document-in-place.** No big-bang `src/components/patterns/` folder. |
| **Hybrid / Starwind** | Work **with** Starwind / [ADR 0002](../../.agents/codebase/adr/0002-astro-starwind-shadcn-hybrid.md), not against upcoming Starwind migrations. Shape path stays; no Astryx/StyleX packages. |

Living catalog: [`docs/design-system.md`](../design-system.md) (Foundations → Components → Patterns).
