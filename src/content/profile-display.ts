/**
 * Profile display helpers for About / homepage.
 * Lives next to the content adapter so pages stay collections-ready.
 */

/**
 * Parse `LEARNING_SIGNALS_ENABLED` from env.
 * Unset / anything other than `true` or `1` → off.
 */
export function parseLearningSignalsEnabled(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

export interface ExperienceEntry {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  summary: string;
}

/** Hide certifications section when the list is empty. */
export function shouldShowCertifications(certifications: readonly unknown[]): boolean {
  return certifications.length > 0;
}

/**
 * Content marker (`learning: true`) gated by the build-time flag.
 * Pass `enabled` from {@link LEARNING_SIGNALS_ENABLED} (`astro:env/server`).
 */
export function showLearningSignal(item: { learning?: boolean }, enabled: boolean): boolean {
  return enabled && item.learning === true;
}

export function experienceHeadline(
  experience: readonly Pick<ExperienceEntry, "role" | "company">[],
): string | null {
  const first = experience[0];
  return first ? `${first.role} · ${first.company}` : null;
}

export function experienceTimelineEntries(
  experience: readonly ExperienceEntry[],
): ExperienceEntry[] {
  return [...experience];
}
