import { type GitMeta, synthesizeGitMeta } from "@/content/assemble/git-meta";
import type { GitHubClient } from "@/sync/github";
import { pickMaxSemverTag } from "@/sync/semver";

/**
 * Tags → git-meta.json payload (PROG-80).
 * - zero tags → unreleased + ISO now
 * - tags but none semver-parseable → fail-closed
 * - else max-semver tag name (pass-through) + target commit committer.date
 *   (lightweight + annotated; annotated peels first; tagger.date ignored)
 */
export async function gitMetaFromTags(params: {
  client: GitHubClient;
  owner: string;
  repo: string;
  source: string;
  now?: Date;
}): Promise<GitMeta> {
  const tags = await params.client.listAllTags({
    owner: params.owner,
    repo: params.repo,
    source: params.source,
  });

  if (tags.length === 0) {
    return synthesizeGitMeta(params.now ?? new Date());
  }

  const chosen = pickMaxSemverTag(tags.map((t) => t.name));
  if (!chosen) {
    throw new Error(
      `${params.source}: repository has ${tags.length} tag(s) but none are semver-parseable — fail-closed`,
    );
  }

  const releaseDate = await params.client.resolveTagDate({
    owner: params.owner,
    repo: params.repo,
    tag: chosen,
    source: params.source,
  });

  return {
    version: chosen,
    releaseDate: new Date(releaseDate).toISOString(),
  };
}
