/** localStorage key for an explicit user motion choice only. */
export const MOTION_STORAGE_KEY = "motion";

export type MotionStoredChoice = "full" | "reduced";
export type MotionEffective = "full" | "reduced";

/**
 * Product policy for OS `prefers-reduced-motion`:
 * - Persist only an explicit user choice (`full` | `reduced`); do not write on first visit
 *   so a later OS change still applies until the user interacts.
 * - No stored choice + OS reduce ⇒ effective reduced (toggle Off).
 * - Stored `full` ⇒ full even when OS prefers reduce (user override until they turn Off).
 * - Stored `reduced` ⇒ reduced always (do not fight the user).
 * - No stored choice + OS not reduce ⇒ full.
 *
 * Because user On may override OS reduce, CSS must not blindly kill animations under
 * `@media (prefers-reduced-motion: reduce)` when `html[data-motion="full"]` — see styles.css.
 */
export function resolveMotionPreference(opts: {
  stored: string | null | undefined;
  osPrefersReduced: boolean;
}): MotionEffective {
  if (opts.stored === "reduced") return "reduced";
  if (opts.stored === "full") return "full";
  return opts.osPrefersReduced ? "reduced" : "full";
}

export function isMotionReduced(effective: MotionEffective): boolean {
  return effective === "reduced";
}
