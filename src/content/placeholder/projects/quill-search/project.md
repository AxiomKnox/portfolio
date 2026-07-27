---
id: quill-search
title: Quill Search
summary: A local-first, semantic search engine for your own Markdown notes and PDFs.
category: web
type: Local-first web app
status: alpha
techStack:
  - TypeScript
  - React
  - DuckDB
  - HuggingFace
links:
  github: https://github.com/example/quill-search
  live: https://quill.example.dev
preview: grad-4
associated:
  - harbor-mlops
---

Quill indexes your notes on-device with a small embedding model, giving you instant semantic search without shipping anything to a server.

## Stack

Runs entirely in-browser with WebGPU when available, and falls back to WASM.
