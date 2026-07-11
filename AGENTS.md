## Agent skills

### Issue tracker

GitHub Issues on `MysteryMan11/portfolio` via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` at repo root and `docs/adr/` for ADRs. See `docs/agents/domain.md`.

## Cursor Cloud specific instructions

This branch is a static Astro (SSG) + React-islands portfolio using **pnpm** (Node `>=22.12.0`). Standard scripts live in `package.json`; see `README.md` for the full command table.

- **Content sync is required before `pnpm dev`.** `src/content/projects/` and `src/content/personal/` are generated (gitignored) and start empty on a fresh checkout. `pnpm run build` auto-runs it via the `prebuild` hook, but `pnpm dev` has no such hook — run `pnpm run sync` first, otherwise the site renders with zero projects. Sources come from `content-sources/` fixtures (`projects-config.json` has an empty `remoteRepos`, so no network/`GITHUB_TOKEN` is needed).
- **No standalone lint script.** Type/diagnostics checking is `astro check`, which runs as part of `pnpm run build`. Tests are `pnpm test` (vitest, in `tests/`).
- **`portfolio.md` at repo root is intentionally absent** (gitignored). The `personal` collection is therefore empty, so build/dev print harmless `The collection "personal" ... is empty` warnings and hero/about personal fields fall back to defaults. Not an error.
- Dev server runs at `http://localhost:4321/`; `pnpm preview` requires a prior `pnpm run build`.
