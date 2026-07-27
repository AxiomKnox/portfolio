/** View-transition fade driven by `data-page-transition` on `<html>`. */

export const DEFAULT_PAGE_TRANSITION = "fade" as const;
export const PAGE_TRANSITION_ATTR = "data-page-transition";
/** Set on `<html>` when site motion is reduced — CSS skips VT animations. */
export const PAGE_TRANSITION_SKIP_ATTR = "data-page-transition-skip";
/**
 * sessionStorage flag: user reached a project detail via in-app navigation.
 * Detail "Back" uses `history.back()` when set; otherwise falls back to `/projects`.
 */
export const PROJECT_BACK_STORAGE_KEY = "portfolio:project-back";

/**
 * Parallel crossfade timing (CSS vars must match).
 * Old main and new main animate together, same duration, zero delay —
 * one continuous strip, not an exit phase followed by an enter phase.
 * Old opacity 1→0 while new opacity 0→1.
 * Because both run concurrently, the total wall-clock duration of the
 * transition equals a single phase (not phase × 2).
 */
export const PAGE_TRANSITION_PHASE_MS = 220;
export const PAGE_TRANSITION_TOTAL_MS = PAGE_TRANSITION_PHASE_MS;

/** `/projects/:id` detail id, or null for index / other routes. */
export function extractProjectDetailId(pathname: string): string | null {
  const path = normalizeRoutePath(pathname);
  const m = path.match(/^\/projects\/([^/]+)$/);
  return m?.[1] ?? null;
}

/**
 * Remember list/home origin when ClientRouter enters a project detail.
 * Skips detail↔detail so Back still returns to the original list surface via history.
 * Stores path + optional search (`/projects?q=foo`) for href sync; `history.back()`
 * still preserves the real history entry (query + scroll) when used.
 */
export function rememberProjectBackPath(fromPath: string, toPath: string, fromSearch = ""): void {
  if (typeof sessionStorage === "undefined") return;
  const toId = extractProjectDetailId(toPath);
  const fromId = extractProjectDetailId(fromPath);
  if (!toId || fromId) return;
  try {
    const search =
      !fromSearch || fromSearch === "?"
        ? ""
        : fromSearch.startsWith("?")
          ? fromSearch
          : `?${fromSearch}`;
    sessionStorage.setItem(PROJECT_BACK_STORAGE_KEY, `${fromPath}${search}`);
  } catch {
    /* private mode / quota */
  }
}

/** Stored origin path (+ search), or null for cold entry. */
export function getProjectBackPath(): string | null {
  try {
    return sessionStorage.getItem(PROJECT_BACK_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** True when detail Back should call `history.back()` instead of the `/projects` fallback. */
export function shouldUseHistoryBackForProject(): boolean {
  return getProjectBackPath() != null;
}

export function clearProjectBackPath(): void {
  try {
    sessionStorage.removeItem(PROJECT_BACK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Skip VT animations when site motion is reduced (`data-motion="reduced"`). */
export function shouldSkipPageTransitionAnimations(opts: {
  dataMotion: string | null | undefined;
}): boolean {
  return opts.dataMotion === "reduced";
}

/** Normalize pathname: leading slash, no trailing slash (except root). */
export function normalizeRoutePath(pathname: string): string {
  if (!pathname) return "/";
  let path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/** Strip Astro `BASE_URL` prefix, then normalize. */
export function stripBaseFromPath(pathname: string, baseUrl: string): string {
  const baseTrimmed = baseUrl.endsWith("/") && baseUrl !== "/" ? baseUrl.slice(0, -1) : baseUrl;
  let path = pathname;
  if (baseTrimmed !== "/" && path.startsWith(baseTrimmed)) {
    path = path.slice(baseTrimmed.length) || "/";
  }
  return normalizeRoutePath(path);
}
