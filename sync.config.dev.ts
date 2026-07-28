import type { DevSyncConfig } from "./src/sync/types.ts";

/**
 * Stable fixture catalog for `bun run sync:dev` / `sync:dev:all`.
 * Paths are relative to `src/content/placeholder/`.
 *
 * Do not put live GitHub remotes here — those live in `sync.config.ts`.
 * Mixed mode (`sync:dev:all`) auto-imports project remotes from the prod config.
 */
const config: DevSyncConfig = {
  profile: {
    path: "profile",
  },
  projects: [
    { id: "atlas-deploy", path: "projects/atlas-deploy" },
    { id: "ember-portfolio", path: "projects/ember-portfolio" },
    { id: "harbor-mlops", path: "projects/harbor-mlops" },
    { id: "quill-search", path: "projects/quill-search" },
    { id: "signal-forge", path: "projects/signal-forge" },
    { id: "tessera", path: "projects/tessera" },
  ],
};

export default config;
