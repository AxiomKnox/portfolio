/** Prefix an internal path with Astro `base` (import.meta.env.BASE_URL). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base === "/") return normalized;
  const baseTrimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${baseTrimmed}${normalized}`;
}
