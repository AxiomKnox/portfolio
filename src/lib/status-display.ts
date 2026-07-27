import { STATUS_ORDER, type Status } from "@/content/types";

/**
 * Presentation for Project Status — labels only.
 * Dot paint lives in CSS (`.status-dot[data-status]` + `--status-*` tokens).
 * Domain lifecycle identity stays in `src/content/types/project.ts` (`Status`, `STATUS_ORDER`).
 */

export type StatusLabelVariant = "compact" | "prose";

const STATUS_LABELS: Record<Status, Record<StatusLabelVariant, string>> = {
  prod: { compact: "Prod", prose: "Production" },
  beta: { compact: "Beta", prose: "Beta" },
  alpha: { compact: "Alpha", prose: "Alpha" },
  dev: { compact: "Dev", prose: "In development" },
  archived: { compact: "Archived", prose: "Archived" },
};

/** Compact (cards/toolbar) vs prose (detail page) — intentional density fork. */
export function statusLabel(status: Status, variant: StatusLabelVariant = "compact"): string {
  return STATUS_LABELS[status][variant];
}

/** Fuzzy / suggestion text: id + compact label. */
export function statusSearchText(status: Status): string {
  return `${status} ${STATUS_LABELS[status].compact}`;
}

/** Exhaustiveness helper for tests / call sites iterating presentation. */
export function statusDisplayEntries(
  variant: StatusLabelVariant = "compact",
): { status: Status; label: string }[] {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status][variant],
  }));
}
