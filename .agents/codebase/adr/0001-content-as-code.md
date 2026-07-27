# ADR 0001: Content as code

**Status:** Superseded by [ADR 0003: Content Collections store + GitHub sync](./0003-content-collections-and-sync.md)

## Context

The portfolio needs to display a person's profile and a list of projects with rich metadata, markdown descriptions, and interactive architecture diagrams. We need to decide where that content lives and how it reaches the UI.

Alternatives considered:

1. **Headless CMS** (Contentful, Sanity, etc.) — content edited in a web UI, fetched at build or runtime
2. **Markdown/JSON files** — content in separate files, loaded and typed at build time
3. **Typed TypeScript modules** — content as exported constants in `src/data/*.ts`

## Decision

~~Store all site content in two typed TypeScript files: `src/data/profile.ts` and `src/data/projects.ts`. Pages and shell components read them through `src/content/adapter.ts` (and presentation helpers under `src/content/`). No fetch layer, no CMS, no database.~~

**Superseded:** live store is `src/content/**` via Content Collections + loaders; optional GitHub sync writes that tree; pages still use the thin exclusive adapter. See ADR 0003.

## Consequences

Historical (under ADR-0001):

- Content and types stayed in sync via the compiler
- Zero network dependency for content; SSG builds were deterministic
- Simple mental model: edit data file → site updates

## Agent implications

Follow [ADR 0003](./0003-content-collections-and-sync.md). Do not treat `src/data/*.ts` as the live store (those modules are gone).

## Notes

Kept for history. Hard reverse of ADR-0003 would mean restoring TS modules and dropping sync — do not do that without a new ADR.
