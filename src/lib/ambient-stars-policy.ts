export type StarsAnimationPolicy = "animate" | "static" | "idle";

/**
 * Decide whether the ambient stars canvas should animate, draw once, or stop.
 * Idle means no rAF loop — callers must not reschedule frames.
 */
export function starsAnimationPolicy(opts: {
  isDark: boolean;
  mode: "off" | "glow" | "stars" | "shapes";
  reducedMotion: boolean;
  tabHidden: boolean;
}): StarsAnimationPolicy {
  if (opts.tabHidden) return "idle";
  if (!opts.isDark || opts.mode !== "stars") return "idle";
  if (opts.reducedMotion) return "static";
  return "animate";
}

/** Cap canvas backing-store density — mobile does not need 2× stars buffers. */
export function starsDevicePixelRatio(opts: {
  devicePixelRatio: number;
  narrowViewport: boolean;
}): number {
  const raw = Number.isFinite(opts.devicePixelRatio) ? opts.devicePixelRatio : 1;
  const cap = opts.narrowViewport ? 1 : 1.5;
  return Math.max(1, Math.min(cap, raw));
}

/**
 * Star count budget from viewport area. Narrow viewports keep a much smaller
 * field so main-thread paint stays cheap during Lighthouse mobile runs.
 */
export function starsParticleCount(opts: {
  width: number;
  height: number;
  narrowViewport: boolean;
}): number {
  const area = Math.max(0, opts.width) * Math.max(0, opts.height);
  if (area <= 0) return 0;
  const density = opts.narrowViewport ? 22_000 : 14_000;
  const count = Math.floor(area / density);
  if (opts.narrowViewport) return Math.max(28, Math.min(90, count));
  return Math.max(40, Math.min(140, count));
}
