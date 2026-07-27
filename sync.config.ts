import type { SyncConfig } from "./src/sync/types.ts";

/**
 * Prod sync remotes (no secrets). Auth via `GITHUB_TOKEN` in `.env` / CI.
 * Used by `bun run sync` and project remotes in `bun run sync:dev:all`.
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
    // TODO: real GitHub owner/repo for the profile content remote
    owner: "TODO",
    repo: "TODO",
    path: "profile",
    // ref: "main",
  },
  projects: [
    // {
    //   id: "atlas-deploy",
    //   // TODO: real owner/repo for this project's portfolio folder
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    // {
    //   id: "ember-portfolio",
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    // {
    //   id: "harbor-mlops",
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    // {
    //   id: "quill-search",
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    // {
    //   id: "signal-forge",
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    // {
    //   id: "tessera",
    //   owner: "TODO",
    //   repo: "TODO",
    //   path: "",
    // },
    {
      id: "data-science-internship",
      owner: "MysteryMan11",
      repo: "Data-Science-Internship",
      path: "portfolio",
    },
  ],
};

export default config;
