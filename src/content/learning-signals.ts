/**
 * Server-only learning-signals flag + page helper.
 * Reads `LEARNING_SIGNALS_ENABLED` via `astro:env/server` (not PUBLIC_).
 */
import { LEARNING_SIGNALS_ENABLED as LEARNING_SIGNALS_ENABLED_RAW } from "astro:env/server";
import {
  parseLearningSignalsEnabled,
  showLearningSignal as showLearningSignalFor,
} from "@/content/profile-display";

/** Parsed once at build/dev — unset / empty → off; `true` or `1` → on. */
export const LEARNING_SIGNALS_ENABLED = parseLearningSignalsEnabled(LEARNING_SIGNALS_ENABLED_RAW);

/** Content marker (`learning: true`) gated by {@link LEARNING_SIGNALS_ENABLED}. */
export function showLearningSignal(item: { learning?: boolean }): boolean {
  return showLearningSignalFor(item, LEARNING_SIGNALS_ENABLED);
}
