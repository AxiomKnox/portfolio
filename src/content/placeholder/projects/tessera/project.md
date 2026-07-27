---
id: tessera
title: Tessera
summary: A tiny recommendation model for indie music discovery, trained on
  public playlist data.
category: ml
type: Recommendation API
status: prod
techStack:
  - Python
  - PyTorch
  - Pandas
  - FastAPI
links:
  github: https://github.com/example/tessera
preview: grad-6
associated:
  - harbor-mlops
---

Tessera is a two-tower retrieval model for indie music. It powers a "next song" widget on a friend's music blog.

## Data

Trained on ~2M scrobbles from a public dataset, with content features from track audio.
