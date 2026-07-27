# Discussion — Status color maps consolidation

**Status:** SHIPPED — single paint source (CSS tokens + `.status-dot`) and shared label policy (`status-display.ts`).  
**Date:** 2026-07-24  
**Related:** `deferred-items-plain-language-explanations.md` §5; `docs/design-system.md` Status color system.

---

## Verdict (implemented)

| Decision | Choice |
| --- | --- |
| Approach | **C hybrid:** CSS owns color (Approach B paint); TS owns label variants (Approach A for copy) |
| Labels | **Keep fork** — `compact` (cards/toolbar) vs `prose` (detail) |
| Scope | Status only (not `CATEGORY_LABEL`) |
| Seam | Presentation stays out of `src/data/projects.ts` |

### Live sources of truth

| Concern | Where |
| --- | --- |
| Domain `Status` + `STATUS_ORDER` | `src/data/projects.ts` |
| Dot paint (`--status-*`, `.status-dot[data-status]`) | `src/styles.css` |
| Compact / prose labels | `src/lib/status-display.ts` (`statusLabel`) |

Consumers: `ProjectCard.tsx`, `ProjectsToolbar.tsx`, `projects/[id].astro` — no local `STATUS_DOT` / `STATUS_META` color tables.

### Acceptance (met)

1. Same visual status language via tokens (dev/alpha/beta/prod/archived).
2. Dot treatment: `.status-dot` (1.5×1.5 rem circle).
3. Surfaces: list/grid, toolbar chips/filters, detail hero + Properties.
4. `STATUS_ORDER` unchanged for filter/sort.
5. Fuzzy match still uses compact labels + ids.
6. Astro + React both use `data-status` + shared label helper.
7. Short vs long labels preserved deliberately.

---

## Historical discussion (pre-ship)

The three duplicated maps and Approach A/B/C options lived below for decisioning. Implementation chose the hybrid above rather than parking.

<details>
<summary>Original inventory (archived)</summary>

Canonical **dot language** was byte-identical across `ProjectCard`, `ProjectsToolbar` (`STATUS_META`), and `projects/[id].astro`, with label fork Prod/Dev vs Production/In development. Consolidation was blocked on user approval of approach/label policy; that approval is now recorded in the verdict table.

</details>
