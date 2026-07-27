## Per-item explanations

### 1. `Rejected; T5 shipped hotspots; Done. Only Navbar / brand-icons skips remain…`
**What it is:** Performance ticket **PROG-52 (T5)** — make heavy interactive pieces load later so pages feel lighter, guided by the T3 hotspot list in `docs/research/t3-architecture-deepening.md` §3.

**Where:** Lazy ReactFlow in `ProjectArchitectureIsland.tsx`; lazy calendar in `ProjectsToolbar.tsx`; ambient policy in `ambient-stars-policy.ts` + `AmbientBackground` with `client:idle` in `Layout.astro`; HeroGrid / architecture use `client:visible`. Navbar still `client:load` for motion/ambient toggles; brand icons stay eager via `icon-catalog.tsx` / `BrandIcon`.

**State:** **Done** for T5. Main hotspots shipped. Navbar + brand-icons were **intentionally skipped** (low priority / measure-first in T3).

**Why the label confuses:** “Rejected” sounds like T5 failed. It means “don’t keep these skips as open T5 work.” Ticket is Done; skips are documented deferrals, not unfinished acceptance criteria.

**Action left:** None for T5 unless a later perf pass revisits Navbar or icon payload with metrics.

---

### 2. `Rejected; PROG-42 SEO packaging; Superseded by PROG-46…`
**What it is:** **PROG-42** was Lovable’s SEO/AI-search review (headings, metadata, robots, sitemap, llms.txt, OG, JSON-LD, plus content ideas). **PROG-46 (T8)** was the real “do the packaging fixes” ticket.

**Where:** Shipped packaging lives in `llms.txt.ts`, `robots.txt.ts`, `jsonld.ts`, `site.ts`, Layout/page titles, `@astrojs/sitemap`, OG assets — not in PROG-42 itself.

**State:** PROG-46 is **Done**. PROG-42 is **Canceled** on Linear (2026-07-24) — packaging superseded; MLOps leftover dismissed (see item 8).

**Why confusing:** Two tickets looked like open SEO debt. Packaging finished under PROG-46; PROG-42 is closed.

**Action left:** None for packaging or PROG-42.

---

### 3. `Keep; @svgr/* required…`
**What it is:** DevDependencies `@svgr/core` and `@svgr/plugin-jsx` — SVG→React helpers used by **`unplugin-icons`**, not imported by app code.

**Where:** `package.json` devDependencies; T3 kill-list §2 “Audit / likely keep.”

**State:** **Keep** (still present after T4 prune of forms/tabler).

**Why confusing:** “Not imported” looks removable. Removing them can break the icon build even with zero app imports.

**Action left:** None unless a deliberate prune-build proves they are unused.

---

### 4. `Keep; Dual icon paths…` → **SHIPPED single Lucide path**
**What it is (was):** Two Lucide delivery mechanisms plus brand icons. **Now:** one unplugin Lucide path + brand Iconify path.

**Where:** ADR-0002 decision 7; `icon-catalog.tsx` + `icon-renderers.tsx` (`UiIcon` / `BrandIcon`). Islands use `UiIcon`; `ui/*` uses `~icons/lucide/*`. **No `lucide-react`.**

**State:** **Done** — dual Lucide path closed; brand vs UI chrome split remains intentional.

**Action left:** After `shadcn add`, rewrite emitted `lucide-react` imports; do not re-add the package.

---

### 5. `Keep; Status color maps…` → **SHIPPED shared paint + labels**
**What it is (was):** Same status→dot-color mapping copied in several UI places (`STATUS_DOT` / `STATUS_META`).

**Where now:** Dot paint = `--status-*` tokens + `.status-dot[data-status]` in `src/styles.css`. Labels = `src/lib/status-display.ts` (`compact` vs `prose`). Domain `Status` / `STATUS_ORDER` stay in `src/data/projects.ts`. Consumers: `ProjectCard`, `ProjectsToolbar`, `projects/[id].astro`.

**State:** **Done** — triple map smell closed; short vs long labels kept on purpose.

**Why confusing:** “Maps” + prune context sounded deletable. They were live UI presentation, not dead deps.

**Action left:** None unless adding a new `Status` value (extend tokens + `status-display` + `STATUS_ORDER`).

---

### 6. `Toolbar exploration sync; Search-token ↔ chips…` (`docs/filtering-search.md`)
**What it is:** Desire for the projects search box to be a full “exploration” surface: every filter as typed syntax, and every token reflected as chips (and back).

**Where:** `docs/filtering-search.md` + `src/lib/project-discovery.ts` sync helpers.

**State:** **Shipped** (PROG-73) — two-way Search-token ↔ chip sync via `mergeExplorationPatch` / `syncExplorationState`.

**Action left:** Optional polish only (multi-`year:` chip UX, richer mid-edit token affordances).

---

### 7. `GradientPreview hexes → tokens` (PROG-45)
**What it is:** Project/avatar preview gradients are hardcoded hex strings in `GradientPreview.tsx` (`grad-1`…`grad-6`, `grad-avatar`), not CSS design tokens in `styles.css`.

**Where:** `src/components/GradientPreview.tsx`; T3 §2 points this at **PROG-45** / design pass, not T4 kill.

**State:** **Open** under living-docs / design refresh. PROG-45 is still **Backlog**.

**Why confusing:** Tied to PROG-45 (docs refresh), so it can look like “SEO/docs” or “dead code.” It’s visual-system debt: hard hexes vs theme tokens.

**Action left:** When doing PROG-45 (or a design pass), move gradients to CSS variables/tokens without visual change.

---

### 8. `PROG-42 leftover — optional MLOps guide` → **DISMISSED**
**What it is (was):** Semrush-style content idea from PROG-42: write an “MLOps best practices” guide for keyword traffic. PROG-46 called it optional / out of packaging wave.

**Where:** Discuss brief `discuss-optional-mlops-guide.md` (historical). No guide page exists; none will be built.

**State:** **Rejected / dismissed** by owner (2026-07-24). PROG-42 **Canceled** on Linear.

**Why confusing:** Lived under “SEO review,” so it looked like unfinished T8. Packaging had already shipped; this was a separate content idea the owner does not want.

**Action left:** None. Do not reopen PROG-46 or invent a `/guides` surface for this.

---