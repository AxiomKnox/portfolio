import { splitFrontmatter } from "@/content/assemble/frontmatter";
import { joinRemotePath } from "@/sync/config";
import { gitMetaFromTags } from "@/sync/git-meta-from-tags";
import type { GitHubClient } from "@/sync/github";
import type { ProjectRemote, RemoteRef, SyncConfig } from "@/sync/types";

export type PlannedFile = {
  /** Absolute-ish repo-relative path using `/` (e.g. src/content/projects/x/project.md). */
  relativePath: string;
  bytes: Uint8Array;
};

export type SyncPlan = {
  files: PlannedFile[];
  /** Optional known files to delete under a destination root when absent remotely. */
  deleteIfPresent: string[];
};

const textEncoder = new TextEncoder();

function toUtf8(text: string): Uint8Array {
  return textEncoder.encode(text);
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes);
}

async function requireFile(
  client: GitHubClient,
  remote: RemoteRef,
  relative: string,
  source: string,
): Promise<Uint8Array> {
  const path = joinRemotePath(remote.path, relative);
  const bytes = await client.getRawContents({
    owner: remote.owner,
    repo: remote.repo,
    path,
    ref: remote.ref,
    source: `${source}:${relative}`,
  });
  if (!bytes) {
    throw new Error(
      `${source}: required file missing remotely: ${path || relative} ` +
        `(404 — file absent on the default branch/ref, or GITHUB_TOKEN cannot read this private repo)`,
    );
  }
  return bytes;
}

async function optionalFile(
  client: GitHubClient,
  remote: RemoteRef,
  relative: string,
  source: string,
): Promise<Uint8Array | null> {
  const path = joinRemotePath(remote.path, relative);
  return client.getRawContents({
    owner: remote.owner,
    repo: remote.repo,
    path,
    ref: remote.ref,
    source: `${source}:${relative}`,
  });
}

export async function planProjectSync(params: {
  client: GitHubClient;
  project: ProjectRemote;
  contentRoot?: string;
}): Promise<SyncPlan> {
  const contentRoot = params.contentRoot ?? "src/content";
  const source = `project:${params.project.id} (${params.project.owner}/${params.project.repo})`;
  const dest = `${contentRoot}/projects/${params.project.id}`;
  const files: PlannedFile[] = [];
  const deleteIfPresent: string[] = [];

  const projectMd = await requireFile(params.client, params.project, "project.md", source);
  const { data: frontmatter } = splitFrontmatter(decodeUtf8(projectMd));
  const fm = frontmatter as { id?: unknown };
  if (typeof fm.id !== "string" || fm.id.length === 0) {
    throw new Error(`${source}: project.md frontmatter missing required id`);
  }
  if (fm.id !== params.project.id) {
    throw new Error(
      `${source}: config id "${params.project.id}" does not match project.md frontmatter id "${fm.id}"`,
    );
  }
  files.push({ relativePath: `${dest}/project.md`, bytes: projectMd });

  const architecture = await optionalFile(
    params.client,
    params.project,
    "architecture.json",
    source,
  );
  if (architecture) {
    files.push({ relativePath: `${dest}/architecture.json`, bytes: architecture });
  } else {
    deleteIfPresent.push(`${dest}/architecture.json`);
  }

  const previewPng = await optionalFile(params.client, params.project, "preview.png", source);
  const previewWebp = await optionalFile(params.client, params.project, "preview.webp", source);
  if (previewPng && previewWebp) {
    throw new Error(
      `${source}: remote has both preview.png and preview.webp — keep only one (fail-closed)`,
    );
  }
  if (previewPng) {
    files.push({ relativePath: `${dest}/preview.png`, bytes: previewPng });
    deleteIfPresent.push(`${dest}/preview.webp`);
  } else {
    deleteIfPresent.push(`${dest}/preview.png`);
  }
  if (previewWebp) {
    files.push({ relativePath: `${dest}/preview.webp`, bytes: previewWebp });
    deleteIfPresent.push(`${dest}/preview.png`);
  } else {
    deleteIfPresent.push(`${dest}/preview.webp`);
  }

  const meta = await gitMetaFromTags({
    client: params.client,
    owner: params.project.owner,
    repo: params.project.repo,
    source,
  });
  files.push({
    relativePath: `${dest}/git-meta.json`,
    bytes: toUtf8(`${JSON.stringify(meta, null, 2)}\n`),
  });

  return { files, deleteIfPresent };
}

export async function planProfileSync(params: {
  client: GitHubClient;
  profile: RemoteRef;
  contentRoot?: string;
}): Promise<SyncPlan> {
  const contentRoot = params.contentRoot ?? "src/content";
  const source = `profile (${params.profile.owner}/${params.profile.repo})`;
  const dest = `${contentRoot}/profile`;
  const files: PlannedFile[] = [];
  const deleteIfPresent: string[] = [];

  const profileMd = await requireFile(params.client, params.profile, "profile.md", source);
  files.push({ relativePath: `${dest}/profile.md`, bytes: profileMd });

  const resume = await optionalFile(params.client, params.profile, "resume.pdf", source);
  if (resume) {
    files.push({ relativePath: `${dest}/resume.pdf`, bytes: resume });
  } else {
    deleteIfPresent.push(`${dest}/resume.pdf`);
  }

  const photo = await optionalFile(params.client, params.profile, "profile_photo.png", source);
  if (photo) {
    files.push({ relativePath: `${dest}/profile_photo.png`, bytes: photo });
  } else {
    deleteIfPresent.push(`${dest}/profile_photo.png`);
  }

  const certDir = joinRemotePath(params.profile.path, "certifications");
  const listing = await params.client.listContents({
    owner: params.profile.owner,
    repo: params.profile.repo,
    path: certDir,
    ref: params.profile.ref,
    source: `${source}:certifications/`,
  });
  if (listing) {
    for (const entry of listing) {
      if (entry.type !== "file" || !entry.name.toLowerCase().endsWith(".pdf")) continue;
      const bytes = await params.client.getRawContents({
        owner: params.profile.owner,
        repo: params.profile.repo,
        path: entry.path,
        ref: params.profile.ref,
        source: `${source}:certifications/${entry.name}`,
      });
      if (!bytes) {
        throw new Error(
          `${source}: certifications listing included ${entry.name} but contents fetch returned 404`,
        );
      }
      files.push({
        relativePath: `${dest}/certifications/${entry.name}`,
        bytes,
      });
    }
  }

  return { files, deleteIfPresent };
}

/**
 * Fetch every configured remote first (fail-closed); do not write until the full plan succeeds.
 * Skips profile when `config.profile` is absent (omitted / TODO in sync.config).
 */
export async function buildSyncPlan(params: {
  client: GitHubClient;
  config: SyncConfig;
  contentRoot?: string;
}): Promise<SyncPlan> {
  const files: PlannedFile[] = [];
  const deleteIfPresent: string[] = [];

  if (params.config.profile) {
    const profilePlan = await planProfileSync({
      client: params.client,
      profile: params.config.profile,
      contentRoot: params.contentRoot,
    });
    files.push(...profilePlan.files);
    deleteIfPresent.push(...profilePlan.deleteIfPresent);
  }

  for (const project of params.config.projects) {
    const projectPlan = await planProjectSync({
      client: params.client,
      project,
      contentRoot: params.contentRoot,
    });
    files.push(...projectPlan.files);
    deleteIfPresent.push(...projectPlan.deleteIfPresent);
  }

  return { files, deleteIfPresent };
}
