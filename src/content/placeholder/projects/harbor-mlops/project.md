---
id: harbor-mlops
title: Harbor MLOps
summary: An opinionated MLOps harness that turns Jupyter experiments into
  reproducible training pipelines.
category: ml
type: MLOps framework
status: alpha
techStack:
  - Python
  - PyTorch
  - MLflow
  - Kubernetes
  - FastAPI
  - Grafana
featured: true
links:
  github: https://github.com/example/harbor-mlops
preview: grad-3
associated:
  - atlas-deploy
---

Harbor is a thin layer over MLflow and Argo Workflows that codifies how my team ships models.

Notebooks are the input; a versioned model artifact, a Grafana dashboard, and a callable HTTP endpoint are the output.

## Why

Every ML team I've worked on rebuilds the same glue. Harbor bakes the glue in and stays out of your way.
