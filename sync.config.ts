import type { SyncConfig } from "./src/sync/types.ts";

/**
 * Prod sync remotes (no secrets). Auth via `GITHUB_TOKEN` in `.env` / CI.
 * Used by `bun run sync` and remotes in `bun run sync:dev:all`
 * (projects + profile when set; remote wins over fixtures).
 *
 * Fill TODO owner/repo (and path/ref as needed) with the real private remotes
 * that hold profile + per-project portfolio folders. Project `id` is the live
 * destination under `src/content/projects/<id>/` (generated; not committed).
 *
 * Local fixtures: `src/content/placeholder/` + `sync.config.dev.ts` via
 * `bun run sync:dev` / `sync:dev:all`.
 *
 * `path` = remote folder containing the known files (`project.md` / `profile.md`, …).
 * Use `""` for repo root.
 */
const config: SyncConfig = {
  profile: {
    owner: "AxiomKnox",
    repo: "axiomknox",
    path: ".portfolio",
    // ref: "main",
  },
  projects: [
    {
      id: "data-science-internship",
      owner: "AxiomKnox",
      repo: "Data-Science-Internship",
      path: ".portfolio",
    },
    {
      id: "push-based-cicd",
      owner: "AxiomKnox",
      repo: "Push-Based-CICD-to-Linode",
      path: ".portfolio",
    },
    {
      id: "food-image-classification",
      owner: "AxiomKnox",
      repo: "Food_Image_Classification",
      path: ".portfolio",
    },
    {
      id: "portfolio",
      owner: "AxiomKnox",
      repo: "portfolio",
      path: ".portfolio",
    },
  ],
};

export default config;
