---
id: signal-forge
title: Signal Forge
summary: An observability side-car that stitches traces, logs, and metrics into
  a single timeline.
category: devops
type: Observability side-car
status: dev
techStack:
  - Rust
  - Prometheus
  - Grafana
  - Docker
links:
  github: https://github.com/example/signal-forge
preview: grad-5
associated:
  - atlas-deploy
---

Signal Forge is a Rust side-car I run next to my services. It normalizes OTLP data and pushes a single, compact stream to any long-term store.

## Trade-offs

Optimizes for readability over exhaustive fidelity — perfect for solo-dev shops, less so for FAANG-scale fleets.
