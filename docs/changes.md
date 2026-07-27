# Changes log

Slim, agent-maintained log of **material** decisions and why. Not a full git changelog.

**When to append:** after a meaningful product/architecture/UX change (feature, ADR-level decision, schema/sync contract, design-token policy). Skip typos, drive-by refactors, and pure formatting.

**Format** (newest first):

```md
## YYYY-MM-DD — short title
- **What:** …
- **Why:** …
- **Refs:** PROG-… / paths / ADR (optional)
```

---

## 2026-07-27 — Homepage featured fill + sparse timeline
- **What:** Homepage projects use `selectHomepageProjects` (featured first, fill to 3 by recency; else 3 most recent). Experience timeline grid adapts for 1–2 entries (narrower frame, hide rail when alone).
- **Why:** Featured preference without an empty strip; one Fresher role no longer sits in a lonely 3-col timeline.
- **Refs:** `src/content/homepage-projects.ts`, `src/pages/index.astro`, `getFeaturedProjects`

## 2026-07-27 — Icon slot overflow (About / skills)
- **What:** `UiIcon` / `BrandIcon` render in fixed `icon-slot` boxes with `overflow: visible`; About skills icons bumped to 16px; learning cards only use `overflow-hidden` when blurred.
- **Why:** Glyphs were clipped by line-box / card overflow on the About skills list.
- **Refs:** `src/lib/icon-renderers.tsx`, `src/pages/about.astro`, `src/styles.css`

## 2026-07-27 — HMR ignores for local graph indexes
- **What:** Vite `server.watch.ignored` excludes `.codegraph/`, `.gitnexus/`, `graphify-out/`.
- **Why:** Those dirs churn while indexing; they are gitignored and must not force Astro HMR.
- **Refs:** `astro.config.mjs`, `.gitignore`

## 2026-07 — Content Collections + sync (PROG-73 era)
- **What:** Live content via Collections loaders + GitHub sync; fixtures under `placeholder/`; thin `adapter.ts`.
- **Why:** Replace content-as-code `src/data/*.ts` with remote-backed immutable files.
- **Refs:** ADR 0003, PROG-75–83

## 2026-07 — Design-system tokens in `src/styles.css`
- **What:** Status / preview / theme tokens centralized; components consume tokens.
- **Why:** Avoid hardcoded colors; keep Starwind/shadcn hybrid coherent.
- **Refs:** `docs/design-system.md`, ADR 0002
