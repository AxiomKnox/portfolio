# Decision brief — A / B / C inventory sync

**Status:** CLOSED — A / B / C resolved (2026-07-24). No further inventory edits required for this brief.

Verified against codebase + T3 (`docs/research/t3-architecture-deepening.md`) + T5 Linear comment on PROG-52.

---

## 1. Shared understanding

### A) ReactFlow — DECIDED (closed)
**ReactFlow is intentional and stays.** No SVG replacement is planned.

T5 already landed the load boundary: `ProjectArchitectureIsland` `lazy()`-imports `ArchitectureDiagram` (keeps ReactFlow out of the island chunk until a live diagram mounts) and mounts with `client:visible`. Fallback path never loads ReactFlow.

### B) Navbar FOUC + brand catalog — RESOLVED (2026-07-24)
**Navbar motion/ambient toggles → Option C SHIPPED.** `MotionToggle.astro` / `AmbientToggle.astro` + `site-prefs-client.ts` (same pattern as `ThemeToggle`). React islands removed; FOUC / ClientRouter handled via inline boot attrs + `astro:before-swap` / `astro:page-load` rebind. Aligns with `motion-preference.ts` OS-reduce policy.

**Brand catalog lazy load → closed: no change.** Keep eager `BRAND_ICONS` / `BrandIcon` via `unplugin-icons`. User accepted status quo; no metrics gate or split work.

### C) lucide-react vs iconify — SHIPPED (closed)
**Single Lucide delivery path via unplugin-icons.** `lucide-react` removed from dependencies.

| Path | Stack | Role |
| --- | --- | --- |
| Lucide UI chrome | `unplugin-icons` + `@iconify-json/lucide` → `UI_ICONS` / `UiIcon` (islands + Astro) | Pages, dialogs, toolbar, toggles, cards |
| shadcn `ui/*` | Same pipeline: direct `~icons/lucide/*` imports | accordion, calendar, dropdown-menu |
| Brand/tech | `unplugin-icons` + `@iconify-json/{devicon,logos,simple-icons}` → `BRAND_ICONS` / `BrandIcon` | Tech badges / profile links |

Modules: `src/lib/icon-catalog.tsx` + `src/lib/icon-renderers.tsx`. After `shadcn add`, rewrite any emitted `lucide-react` imports to `~icons/lucide/*` and do not re-add the package.

### Related follow-ups closed outside A/B/C (same wave)
| Item | Status |
| --- | --- |
| Status color maps consolidation | **SHIPPED** — CSS `--status-*` / `.status-dot` + `status-display.ts` |
| Optional MLOps guide (PROG-42 leftover) | **DISMISSED** — PROG-42 Canceled |
| Shared-element project-image morph (VT) | **REMOVED** — fade-only page transitions for all nav |

---

## 2. Recommended inventory edits (all applied / closed)

| Item | Action |
| --- | --- |
| `Keep; ReactFlow kept (lazy)…` | **Keep / confirm** as intentional keep (lazy + `client:visible`) |
| `ReactFlow → lighter SVG replacement…` | **Remove** from active deferred (user veto) |
| `Navbar stay client:load (FOUC)` / toggles | **Done** — Option C shipped (Astro + vanilla; see §3) |
| `brand-icons lazy load` | **Closed — no change** (keep eager catalog) |
| `lucide-react vs iconify consolidation` | **Done** — single unplugin Lucide path; `lucide-react` dropped |
| `.env.telemetry` / Astro telemetry opt-out | **Done** — no tracked `.env.telemetry`; `ASTRO_TELEMETRY_DISABLED` set in `astro.config.mjs` |

---

## 3. Discussion options — Navbar + brand-icons (historical)

### Navbar motion/ambient toggles — Option C SHIPPED

| Option | Tradeoff | Status |
| --- | --- | --- |
| **A. Keep `client:load` (status quo)** | Tiny global JS; icons/state ready ASAP | Superseded |
| **B. `client:idle` / `client:visible`** | Less priority contention; brief wrong-icon until hydrate | Superseded |
| **C. Rewrite as Astro + vanilla JS** (like `ThemeToggle`) | Removes two React islands; best FOUC control | **SHIPPED** |
| **D. Park forever** | Mark intentional keep | N/A |

**Evidence:** `Navbar.astro` imports `ThemeToggle` / `MotionToggle` / `AmbientToggle` (all `.astro`). Handlers + paint in `src/lib/site-prefs-client.ts`; motion resolve via `src/lib/motion-preference.ts`. No `MotionToggle.tsx` / `AmbientToggle.tsx`.

#### Starwind vs Astro+vanilla (short compare)

Starwind offers Astro+vanilla primitives (`ThemeToggle`, `Toggle`, `Switch`) that are copy-in and customizable — same general stack as Option C.

| Approach | Fit for this navbar |
| --- | --- |
| **Current (ThemeToggle-pattern + `site-prefs-client`)** | One client module owns theme + motion + ambient + ClientRouter rebind + `data-motion` / page-transition skip. Matches OS-reduce policy and shared storage keys already used by the inline boot script. |
| **Starwind `ThemeToggle` / `Toggle`** | Good for theme-only chrome and a11y defaults; would still need custom wiring for ambient cycle (3-state), motion ↔ `motion-preference.ts`, and VT/`astro:*` lifecycle. Risk of dual preference keys (`colorTheme` vs existing theme key) if adopted raw. |

**Why C / current wins here:** prefs are multi-control and already centralized; Starwind would help more if we were starting from zero theme UI or wanted its Toggle a11y shell without a shared prefs bus. Optional later: restyle buttons with Starwind `Toggle` visuals only, without adopting its storage/events.

### brand-icons lazy load — CLOSED (no change)

| Option | Tradeoff | Status |
| --- | --- | --- |
| **A. Keep eager catalog** | Simple; no evidence it dominates transfer | **Accepted** |
| **B. Metrics gate first** | Measure before any split | Not pursued |
| **C. Split / dynamic per icon** | Complexity + flicker risk | Not pursued |

---

## 4. Evidence paths

| Claim | Where |
| --- | --- |
| ReactFlow lazy | `src/components/islands/ProjectArchitectureIsland.tsx` L5–8, L29–42 |
| Island `client:visible` | `src/pages/projects/[id].astro` (architecture island mount) |
| ReactFlow still used | `src/components/ArchitectureDiagram.tsx` + `package.json` `reactflow` |
| T3 SVG replace deferred (now user-vetoed) | `docs/research/t3-architecture-deepening.md` §2 Deferred |
| T5 ReactFlow done; Navbar / brand-catalog lazy skipped | Linear PROG-52 comment |
| Navbar Astro toggles (no React islands) | `src/components/Navbar.astro`; `MotionToggle.astro`; `AmbientToggle.astro`; `ThemeToggle.astro` |
| Prefs + ClientRouter | `src/lib/site-prefs-client.ts`; motion policy `src/lib/motion-preference.ts` |
| Ambient island still React (background only) | `src/layouts/Layout.astro` + `AmbientBackground.tsx` (`client:idle`) |
| Telemetry opt-out (no `.env.telemetry`) | `astro.config.mjs` (`ASTRO_TELEMETRY_DISABLED ??= "1"`); scripts in `package.json` are plain `astro …`; note in `.env.example` |
| unplugin-icons Vite plugin | `astro.config.mjs` |
| Lucide + brand catalogs / renderers | `src/lib/icon-catalog.tsx`, `src/lib/icon-renderers.tsx` |
| No `lucide-react` | `package.json`; islands + `ui/*` use `UiIcon` or `~icons/lucide/*` |
| Single Lucide path policy | ADR 0002 §7 |
| Status paint / labels | `src/styles.css` (`.status-dot`); `src/lib/status-display.ts` |
| Page transitions fade-only | `src/lib/page-transition.ts`; `src/styles.css` (`::view-transition-*` main-content) |

---

**Parent sync line:** A/B/C inventory brief **CLOSED**. Next deferred wave: Data & Input layer under `deferred-data-input-astro-starwind-grouped.md` §1 (via Wayfinder) — before Tn issues. Starwind/UI hybrid (§3 of that brief) stays deferred separately. PROG-72 UX follow-ups (toolbar sync, GradientPreview tokens) remain outside this brief.
