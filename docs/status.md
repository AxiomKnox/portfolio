# Portfolio status

Living milestone doc for astro-2. Last updated: 2026-07-07.

For pipeline mechanics see [new-source-of-truth/architecture-flow.md](./new-source-of-truth/architecture-flow.md). For domain terms see [CONTEXT.md](../CONTEXT.md) at repo root.

---

## Executive summary

The v1 **content pipeline is largely implemented** on branch `astro-2`: sync module, schema, query layer, page fixes, tests, ADR, and file reorg. **Build passes** with 2 local fixture projects. **Not at v1 launch yet** — real project repos are not wired back in, UI polish backlog is untouched, and work is **uncommitted local WIP**.

---

## Session timeline


| Phase                  | What                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Session 1 (2026-07-06) | Domain grilling → `CONTEXT.md`; codebase design; no code                                              |
| Session 2 (2026-07-07) | Full v1 pipeline; code review + fixes; docs reorg; `lib/` vs `src/` separation; architecture-flow doc |


---

## v1 content pipeline — done


| #   | Item                                                                        | Status |
| --- | --------------------------------------------------------------------------- | ------ |
| 1   | `lib/portfolio/schema.ts` — `webapp`, lowercase status, no `featured`       | Done   |
| 2   | `src/content.config.ts` imports schema                                      | Done   |
| 3   | Sync in `lib/portfolio/sync/`                                               | Done   |
| 4   | `git-release.ts` — git notes, release-date rules                            | Done   |
| 5   | `relations.ts` — bidirectional graph                                        | Done   |
| 6   | `query.ts` — pages use query layer                                          | Done   |
| 7   | Page bugs — homepage 3-recent, no filter tabs, related card                 | Done   |
| 8   | Architecture — `architecture.tsx` → `architecture.json` (AST, no execution) | Done   |


Also done: ADR-0001 (accepted, updated for module split), 20 vitest tests in `tests/portfolio/`, code-review P0–P2 fixes, `docs/legacy/` reorg, dead `src/data/architecture/` removed.

### Module layout

```
lib/portfolio/          ← build-time: schema + sync
src/lib/portfolio/      ← runtime: query + display
tests/portfolio/        ← tests
scripts/sync-content.ts ← thin CLI
src/content/            ← generated (gitignored)
```

### Verification (last known)


| Command            | Result             |
| ------------------ | ------------------ |
| `pnpm test`        | 20/20              |
| `pnpm sync`        | 2 fixture projects |
| `pnpm astro check` | 0 errors           |
| `pnpm build`       | Pass               |


---

## Remaining — your action items (content)


| Task                                                                 | Why                               |
| -------------------------------------------------------------------- | --------------------------------- |
| Add `resume.pdf` next to root `portfolio.md`                         | Sync skips if missing             |
| Re-add remote repos to `projects-config.json`                        | Currently `remoteRepos: []`       |
| Per project: `## Project Category` in `project.md`                   | Sync throws if missing            |
| Per project: `architecture.tsx` with `export const architectureData` | Required at sync                  |
| Per project: `preview.png`                                           | Expected for cards                |
| Git notes + semver tags on project repos                             | Metadata source; no notes → `dev` |
| Fill `portfolio.md` / hero fields meaningfully                       | Partial hardcode remains in UI    |


---

## Remaining — codebase

### Launch / correctness

- Re-enable and verify remotes against real git notes/tags
- Hero: `"Available for projects"` still hardcoded in `index.astro`
- `architecture.json` loaded outside content collection (query glob + fs fallback)
- **Commit WIP** when ready — large uncommitted diff on `astro-2`

### Architecture deepening (from review — pick one)

1. **Release Date resolution module** — unify git notes + tags (top pick)
2. **Architecture loading in query** — single path, no dual glob/fs
3. **Content Sync orchestrator** — extract content-writer adapter
4. **Related Project graph** — sync vs query ownership

### Lower priority

- GitHub adapter: bearer token on redirects
- `README.md` broken `docs/dump/` link
- `skills-lock.json` path drift

---

## Remaining — UI / UX

See [things-to-improve-after-AI.md](./things-to-improve-after-AI.md). Not started this session.

**Bugs:** dark mode on client navigation; fonts in preview vs dev; Lighthouse.

**Design:** lock design system (TweakCN Vercel theme); font/theming consistency; hero layout vs reference; translucent cards; Starwind card rewrite; projects page stair-step layout.

**Deferred consult:** morph transitions; `?q=` URL params — phase 2+.

---

## Phases

### v1 gaps still open


| Requirement              | Gap                                        |
| ------------------------ | ------------------------------------------ |
| Architecture per project | Need real `architecture.tsx` in every repo |
| Hero from portfolio.md   | Partial — hardcoded label                  |
| Real project count       | Only 2 fixtures until remotes return       |


### Phase 2+ (do not build yet)

- Projects filter / sort / search / list view / URL query params
- Notion-style table UI
- Skills aggregated from projects (future per content-inputs)

### Open doc discussions

- design-guidelines homepage “experience timeline” vs CONTEXT (About only for v1)
- `personal/` vs informal `portfolio/` folder naming — see architecture-flow.md

---

## Suggested next order

1. `resume.pdf` + one real remote repo with category + architecture
2. `pnpm sync` → confirm 3+ projects
3. Dark mode route-change fix
4. Commit + push `astro-2`
5. UI polish batch OR deepen git-release module
6. v1 launch → phase 2 filters

---

## Reference map


| Doc                                                                                    | Purpose                             |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| [CONTEXT.md](../CONTEXT.md)                                                            | Domain glossary + v1 decisions      |
| [new-source-of-truth/content-inputs.md](./new-source-of-truth/content-inputs.md)       | Field definitions                   |
| [new-source-of-truth/design-guidelines.md](./new-source-of-truth/design-guidelines.md) | Page/section UI spec                |
| [new-source-of-truth/architecture-flow.md](./new-source-of-truth/architecture-flow.md) | Sync → Astro pipeline               |
| [adr/0001-portfolio-content-module.md](./adr/0001-portfolio-content-module.md)         | Module layout ADR                   |
| [astro-2-portfolio-handoff.md](./astro-2-portfolio-handoff.md)                         | Session 1 handoff (partially stale) |
| [things-to-improve-after-AI.md](./things-to-improve-after-AI.md)                       | UI/bug backlog                      |




---

---

---



