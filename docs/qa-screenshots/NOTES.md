# Acceptance QA — Astro finish-line

Date: 2026-07-14  
Preview: `bun run preview` → http://127.0.0.1:4322/

## Checklist

| Criterion | Result |
| --- | --- |
| Theme: `localStorage.theme`, default dark, toggle light/dark | **Pass** — after toggle `theme=light`, `html.dark` removed; persists across `/about` navigation |
| Theme flash prevention (inline head script) | **Pass** — script present on all built HTML pages |
| About shadcn dialogs | **Pass** — Preview opens Radix dialog with title + PDF placeholder |
| Toolbar `tech:"React"` | **Pass** — filters to 2 projects (Ember, Quill) |
| Category filter + empty combo | **Pass** — DevOps + React → 0 / "no matching projects" |
| Diagram ↔ accordion sync | **Pass** — expanding "02 CI runner" expands accordion region |
| GFM markdown (`marked`) | **Pass** — unit check produces `<del>` + `<table>` |
| `ASTRO_BASE=/` local | **Pass** — `.env` unchanged |
| CI base `/repo-name` build | **Pass** — `ASTRO_SITE` + `ASTRO_BASE=/repo-name` → build 10 pages |
| Bundle >500 kB | **Accepted** per grill (no forced code-split) |
| Lighthouse (home, desktop) | A11y **96**, Best Practices **96**, SEO **100** (tool excludes performance/TTI) |

## Screenshots

Under `docs/qa-screenshots/`:

- `qa-home-dark.png`, `qa-home-light.png`
- `qa-about-light.png`
- `qa-projects-light.png`
- `qa-detail-light.png`
- Lighthouse `report.html` / `report.json`

Dark captures for about/projects/detail were partially covered via theme persistence after toggle; primary dark baseline is home.
