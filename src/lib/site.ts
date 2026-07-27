import { withBase } from "@/lib/base";

function siteOrigin(site?: URL | string | null): string | undefined {
  if (site == null) return import.meta.env.SITE as string | undefined;
  return typeof site === "string" ? site : site.origin;
}

function toAbsolute(pathname: string, site?: URL | string | null): string {
  const origin = siteOrigin(site);
  if (!origin) return pathname;
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  return new URL(pathname, base).href;
}

/** Absolute URL for an internal site path (applies Astro `base`). */
export function absoluteUrl(path: string, site?: URL | string | null): string {
  return toAbsolute(withBase(path), site);
}

/**
 * Canonical page URL without query/hash.
 * `pathname` should already include Astro `base` (e.g. `Astro.url.pathname`).
 */
export function canonicalUrl(pathname: string, site?: URL | string | null): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return toAbsolute(normalized, site);
}
