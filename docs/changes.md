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

## 2026-08-23 — About resume is a pair of links, not an iframe
- **What:** `/about` Preview and Download are the same outlined secondary actions as the other About chips. Preview opens the PDF in a new tab. `AboutPreviewDialog` no longer takes `pdfSrc` or embeds `<iframe>`/`<object>`/`<embed>`.
- **Why:** Firefox-family browsers (LibreWolf, Zen) treat a PDF iframe src as a download as soon as it is in the DOM, even inside a closed dialog. That also left Preview as a black pane.
- **Refs:** `src/pages/about.astro`, `src/components/AboutPreviewDialog.astro`, `test/content/profile-resume.test.ts`

## 2026-08-22 — ASTRO_SITE uses repository owner
- **What:** CI and deploy set `ASTRO_SITE` from `github.repository_owner` instead of `github.actor`. Contract tests match that.
- **Why:** CodeRabbit and other bots become `github.actor` on PRs, so the site URL would be wrong and CI would fail. The owner login is the GitHub Pages host.
- **Refs:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `test/ci/`

## 2026-08-22 — About shows synced resume.pdf
- **What:** Assemble records `resume` when `resume.pdf` is on the profile root. About previews and downloads that file and hides `/resume` when it is missing. `AboutPreviewDialog` embeds a PDF when `pdfSrc` is set.
- **Why:** Sync already copied `.portfolio/resume.pdf` from the profile remote. The domain object never kept that file, and the About dialog was a dashed placeholder, so the resume never appeared on the site.
- **Refs:** `src/content/assemble/profile.ts`, `src/pages/about.astro`, `src/components/AboutPreviewDialog.astro`

## 2026-07-29 — sync:dev:all uses remote profile when configured
- **What:** `sync:dev:all` passes prod `profile` into `buildSyncPlan` when set; remote profile/projects overwrite fixtures. Clearer 404 copy when a required remote file is missing (token/private-repo hint).
- **Why:** Mixed local sync should prefer real remotes over placeholder profile, matching project remotes.
- **Refs:** `src/sync/run-dev.ts`, `scripts/sync-dev.ts`, ADR 0003

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
