/** Repo-root `sync.config.ts` / `sync.config.dev.ts` shapes (no secrets). */

export type RemoteRef = {
  owner: string;
  repo: string;
  /** Remote folder path (no leading/trailing slash), or "" for repo root. */
  path: string;
  /** Branch, tag, or commit SHA. Omit → repository default branch. */
  ref?: string;
};

export type ProjectRemote = RemoteRef & {
  /** Destination folder under `src/content/projects/<id>/`; must match project.md FM `id`. */
  id: string;
};

export type SyncConfig = {
  /**
   * Profile content remote for prod `bun run sync`. Omit or leave TODO owner/repo
   * to skip profile sync after the live-root wipe.
   */
  profile?: RemoteRef;
  /** Live project remotes only — TODO stubs in this array still fail closed. */
  projects: ProjectRemote[];
};

/** Local fixture ref under `src/content/placeholder/` (dev sync only). */
export type FixtureRef = {
  /** Path under `src/content/placeholder/` (no leading/trailing slash). */
  path: string;
};

export type FixtureProject = FixtureRef & {
  /** Destination folder under live `src/content/projects/<id>/`. */
  id: string;
};

/** Repo-root `sync.config.dev.ts` — fixtures only (stable placeholder catalog). */
export type DevSyncConfig = {
  profile: FixtureRef;
  projects: FixtureProject[];
};
