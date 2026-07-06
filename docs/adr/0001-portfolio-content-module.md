---
status: accepted
---

# Portfolio content module

The portfolio content pipeline splits build-time ingestion from runtime query/display:

- **`lib/portfolio/`** — shared schema (`schema.ts`) and Content Sync module (`sync/`): `syncPortfolio()` is the external seam; GitHub HTTP and local fixture adapters sit behind sync so domain rules — category from markdown (`## Project Category`), status from git notes (not tag prerelease), bidirectional related-project normalization, and CONTEXT release-date rules — never leak into Astro pages or duplicate across sync and schema.
- **`src/lib/portfolio/`** — runtime only: `query.ts` (pages read projects through it) and `display.ts` (category/status labels).
- **`tests/portfolio/`** — tests mirror the module structure; not colocated under `src/`.
- **`scripts/sync-content.ts`** — thin CLI calling `syncPortfolio()`.

Each project repo ships `architecture.tsx` exporting `export const architectureData = { nodes, edges, steps }` matching `ArchitectureData` in `ArchitectureDiagram.tsx`. Sync imports the file via `tsx`, validates against `architectureDataSchema`, and writes `architecture.json` beside the synced `project.md` under `src/content/projects/{slug}/`.

**Considered Options:** Keeping the monolithic `scripts/sync-content.ts` and inferring category from project ids was rejected because it contradicts CONTEXT.md and scatters release/relation rules. Storing architecture in frontmatter or a global `src/data/architecture/` glob was rejected in favor of per-project synced JSON colocated with content.
