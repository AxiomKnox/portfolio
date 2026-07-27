/**
 * Semver helpers for GitHub tag → git-meta (PROG-80).
 * Leading `v` is accepted for parse only; chosen tag name is returned pass-through.
 */

export type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  /** null = release (no prerelease); prerelease sorts lower than release of same core. */
  prerelease: string[] | null;
  raw: string;
};

const SEMVER_RE =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function splitPrerelease(raw: string): string[] {
  return raw.split(".").map((part) => part);
}

function compareIdent(a: string, b: string): number {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);
  if (aNum && bNum) {
    return Number(a) - Number(b);
  }
  if (aNum) return -1;
  if (bNum) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Parse a tag name as semver. Returns null when not semver-parseable. */
export function parseSemver(name: string): ParsedSemver | null {
  const match = SEMVER_RE.exec(name.trim());
  if (!match) return null;
  const prereleaseRaw = match[4];
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: prereleaseRaw ? splitPrerelease(prereleaseRaw) : null,
    raw: name,
  };
}

/** Compare two parsed semvers; positive if a > b. */
export function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  if (a.prerelease === null && b.prerelease === null) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;

  const len = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i++) {
    const ai = a.prerelease[i];
    const bi = b.prerelease[i];
    if (ai === undefined) return -1;
    if (bi === undefined) return 1;
    const cmp = compareIdent(ai, bi);
    if (cmp !== 0) return cmp;
  }
  return 0;
}

/**
 * Among tag names, pick the maximum semver (optional leading `v` for parse only).
 * Returns the original winning tag name, or null if none parse as semver.
 */
export function pickMaxSemverTag(names: string[]): string | null {
  let best: ParsedSemver | null = null;
  for (const name of names) {
    const parsed = parseSemver(name);
    if (!parsed) continue;
    if (!best || compareSemver(parsed, best) > 0) {
      best = parsed;
    }
  }
  return best?.raw ?? null;
}
