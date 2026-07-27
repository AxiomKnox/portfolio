import { z } from "astro/zod";

/** Exact sidecar shape (PROG-80). Extra keys fail Zod `.strict()`. */
export const gitMetaSchema = z
  .object({
    version: z.string().min(1),
    releaseDate: z.coerce.date(),
  })
  .strict();

export type GitMeta = {
  version: string;
  /** ISO string for island-serializable domain Project. */
  releaseDate: string;
};

export function synthesizeGitMeta(now = new Date()): GitMeta {
  return {
    version: "unreleased",
    releaseDate: now.toISOString(),
  };
}

/**
 * Parse optional git-meta.json contents.
 * Missing/undefined → synthesize. Present-but-invalid → throw (fail-closed).
 */
export function resolveGitMeta(raw: unknown | undefined, now = new Date()): GitMeta {
  if (raw === undefined || raw === null) {
    return synthesizeGitMeta(now);
  }
  const parsed = gitMetaSchema.parse(raw);
  return {
    version: parsed.version,
    releaseDate: parsed.releaseDate.toISOString(),
  };
}
