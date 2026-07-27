# Domain docs — agent consumer rules

How agents should consume this repo's domain documentation.

## Layout

This repo keeps agent-oriented domain docs under `.agents/codebase/` (not at the repo root):

```
.agents/codebase/
├── README.md          ← entry point
├── CONTEXT.md         ← glossary (ubiquitous language)
├── architecture.md    ← system map
├── route-trace.md     ← /projects/:id walkthrough
├── module-seams.md    ← depth & seam analysis
└── adr/               ← architectural decisions
```

Human-first design docs live separately in `docs/`.

## Before exploring or changing code

1. Read [`.agents/codebase/README.md`](./README.md) for task routing
2. Read [`.agents/codebase/CONTEXT.md`](./CONTEXT.md) for domain terms
3. Skim relevant ADRs in [`.agents/codebase/adr/`](./adr/) for the area you're touching

## Use the glossary's vocabulary

When naming things (issues, variables, test descriptions, comments), use terms as defined in `CONTEXT.md`. Do not use synonyms listed under `_Avoid_`.

If a concept isn't in the glossary, either you're inventing language (reconsider) or there's a gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your change contradicts an existing ADR, say so explicitly:

> _Contradicts ADR-0001 (content as code) — reopening because…_

Do not silently introduce a CMS, database, or fetch layer.
