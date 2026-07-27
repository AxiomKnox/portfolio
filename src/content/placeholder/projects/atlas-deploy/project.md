---
id: atlas-deploy
title: Atlas Deploy
summary: A zero-config, multi-cloud deployment pipeline that ships static and
  edge workloads in under 40 seconds.
category: devops
type: Deployment platform
status: prod
techStack:
  - Go
  - Docker
  - Terraform
  - Cloudflare
  - AWS
  - GitHub Actions
  - Prometheus
featured: true
links:
  github: https://github.com/example/atlas-deploy
  live: https://atlas.example.dev
preview: grad-1
associated:
  - ember-portfolio
---

Atlas Deploy started as a weekend experiment to shorten the loop between `git push` and a live URL.

It now runs my own portfolio, three side projects, and two client apps. The core is a small Go orchestrator that fans out builds across a pool of ephemeral Firecracker VMs, uploads artifacts to R2, and flips a DNS-level router.

## Highlights

- **Cold start under 800 ms** thanks to snapshotted VM state.
- **Provider-agnostic** — targets Cloudflare, Fly.io, and AWS Lambda@Edge from the same manifest.
- **Preview URLs per PR**, torn down automatically on merge.
