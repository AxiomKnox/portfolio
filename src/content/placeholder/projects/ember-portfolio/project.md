---
id: ember-portfolio
title: Ember Portfolio
summary: The site you're on right now — a content-driven portfolio compiled from
  repo READMEs.
category: web
type: Static site engine
status: prod
techStack:
  - TypeScript
  - React
  - Vite
  - Tailwind
  - Bun
featured: true
links:
  github: https://github.com/example/ember-portfolio
preview: grad-2
associated:
  - atlas-deploy
---

Ember is the portfolio engine powering this site. It scrapes a set of GitHub repos and a personal-content repo at build time, normalizes them into a typed data file, and renders static pages.

## Design goals

- **Content lives in Markdown.** No CMS to babysit.
- **One data file** feeds every route, so mutations are auditable in git.
- **Static output** — deploys to any dumb file host.
