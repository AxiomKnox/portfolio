## Agent skills

### Codebase orientation

Start at [`.agents/codebase/README.md`](.agents/codebase/README.md) for system map, task routing, and constraints. Domain glossary: [`.agents/codebase/CONTEXT.md`](.agents/codebase/CONTEXT.md). ADRs: [`.agents/codebase/adr/`](.agents/codebase/adr/).

**Linear:** this repo → project **Personal Project Portfolio** (`personal-project-portfolio-027014ac53c4`). Filter issues by that project; see [`.cursor/rules/linear-project.mdc`](.cursor/rules/linear-project.mdc).

**Git:**
- Work/push the custom migration branch only (`lovable-astro-migration` / current worktree branch)
- Do not update `astro-2` unless the user explicitly asks
- Never touch `main`/`master` unless the user explicitly asks
- No workaround-heavy git (temp clones etc.); keep it simple
- Prefer normal push; no force to protected branches
- Remote GitHub `lovable-astro-migration` on the portfolio repo is **broken / out of sync**: it has wrong files from an outdated local lovable primary checkout, **not** this worktree’s correct contents. Do **not** assume remote matches this worktree. Fix requires **manual intervention** (manual copy/edit + correcting/replaying history from this worktree onto that remote) — agents must not auto-“fix” it unless the user explicitly asks.

Human design docs (layouts, components, tokens) live in [`docs/`](docs/README.md) — separate from agent docs.

**Changes log:** after material changes, append a short entry to [`docs/changes.md`](docs/changes.md) (what + why; newest first). Skip typos/formatting. This is a repo changelog for agents — not Cursor/Claude `MEMORY.md` (those are tool-local session memory).

**Tests:** all unit/contract tests live under root [`tests/`](tests/), mirroring `src/` areas (e.g. `src/lib/site.ts` → `tests/lib/site.test.ts`, `src/content/profile-display.ts` → `tests/content/profile-display.test.ts`). Import app code via `@/` aliases — do not co-locate `*.test.ts` under `src/`. Run with `bun test` (or `bun run test`).

### Knowledge graphs

Local indexes (never commit): `.codegraph/`, `.gitnexus/`, `graphify-out/`. Bootstrap: `pwsh -File "$HOME\.cursor\scripts\bootstrap-graphs.ps1"`. Full routing/playbooks/commercial gate: `~/.cursor/skills/graph-stack-bootstrap/SKILL.md`.

**Graphify CLI:** package is **graphifyy**; command is **graphify**. Prefer bare `graphify` if on PATH (`uv tool install "graphifyy[mcp,terraform]"`); else `uvx --from graphifyy graphify …`. Never `bunx`/`npx graphify` or `python -m graphify`.

| Job | Tool |
| --- | --- |
| Symbols / callers / routes | CodeGraph |
| Docs + infra + ADRs map | Graphify |
| Blast radius / change risk | GitNexus (skip if `.gitnexusrc` has `"gitnexus": "disabled"`) |
| Exact string hunt | Grep OK immediately |
