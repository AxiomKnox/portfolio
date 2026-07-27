import { z } from "astro/zod";
import type { RemoteRef, SyncConfig } from "@/sync/types";

const remoteRefSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string(),
  ref: z.string().min(1).optional(),
});

const projectRemoteSchema = remoteRefSchema.extend({
  id: z.string().min(1),
});

export const syncConfigSchema = z
  .object({
    /** Omit / TODO owner/repo → skip profile remote (after live-root wipe). */
    profile: remoteRefSchema.optional(),
    projects: z.array(projectRemoteSchema),
  })
  .strict();

/** Normalize remote `path` (trim, strip leading/trailing `/`). */
export function normalizeRemotePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

/**
 * Parse + validate sync.config.ts export.
 * Profile: omitted or TODO owner/repo → skipped (no sync).
 * Projects: TODO owner/repo still fail closed — comment/remove unfinished stubs.
 */
export function parseSyncConfig(raw: unknown): SyncConfig {
  const parsed = syncConfigSchema.parse(raw);
  const projects = parsed.projects.map((p) => ({
    ...p,
    path: normalizeRemotePath(p.path),
  }));

  const ids = new Set<string>();
  for (const p of projects) {
    if (ids.has(p.id)) {
      throw new Error(`sync.config.ts: duplicate project id "${p.id}"`);
    }
    ids.add(p.id);
    assertNotTodoRemote("project", p.id, p.owner, p.repo);
  }

  const profile = resolveOptionalProfile(parsed.profile);

  return profile ? { profile, projects } : { projects };
}

/** Real remote → include; omitted / TODO placeholders → skip profile sync. */
function resolveOptionalProfile(
  profile: z.infer<typeof remoteRefSchema> | undefined,
): RemoteRef | undefined {
  if (!profile) return undefined;
  if (isTodoPlaceholder(profile.owner) || isTodoPlaceholder(profile.repo)) {
    return undefined;
  }
  return { ...profile, path: normalizeRemotePath(profile.path) };
}

function assertNotTodoRemote(kind: string, label: string, owner: string, repo: string): void {
  if (isTodoPlaceholder(owner) || isTodoPlaceholder(repo)) {
    throw new Error(
      `sync.config.ts: ${kind} "${label}" still has TODO owner/repo placeholders — fill real remotes before sync`,
    );
  }
}

function isTodoPlaceholder(value: string): boolean {
  return /^TODO\b/i.test(value.trim());
}

/** Join remote path segments without duplicate slashes. */
export function joinRemotePath(...parts: string[]): string {
  return parts
    .map((p) => normalizeRemotePath(p))
    .filter((p) => p.length > 0)
    .join("/");
}
