import type { ReactNode } from "react";
import type { Status } from "@/content/types";
import { BrandIcon, UiIcon } from "@/lib/icon-renderers";
import { isoToDisplay, type ToolbarState } from "@/lib/project-discovery";
import { statusLabel } from "@/lib/status-display";

export function ActiveFilterChips({
  state,
  onToggleStatus,
  onToggleTech,
  onClearGithub,
  onClearLive,
  onClearDates,
}: {
  state: ToolbarState;
  onToggleStatus: (s: Status) => void;
  onToggleTech: (t: string) => void;
  onClearGithub: () => void;
  onClearLive: () => void;
  onClearDates: () => void;
}) {
  const dateActive = !!(state.dateFrom || state.dateTo);
  const dateLabel = (() => {
    if (state.dateFrom && state.dateTo)
      return `${isoToDisplay(state.dateFrom)} → ${isoToDisplay(state.dateTo)}`;
    if (state.dateFrom) return `From ${isoToDisplay(state.dateFrom)}`;
    if (state.dateTo) return `Until ${isoToDisplay(state.dateTo)}`;
    return null;
  })();

  const facetCount =
    state.statuses.length +
    state.techs.length +
    (state.hasGithub ? 1 : 0) +
    (state.hasLive ? 1 : 0) +
    (dateActive ? 1 : 0);

  if (facetCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {state.statuses.map((s) => (
        <ActiveChip key={`s-${s}`} onRemove={() => onToggleStatus(s)}>
          <span className="status-dot" data-status={s} />
          {statusLabel(s)}
        </ActiveChip>
      ))}
      {state.techs.map((t) => (
        <ActiveChip key={`t-${t}`} onRemove={() => onToggleTech(t)}>
          <BrandIcon name={t} size={11} />
          {t}
        </ActiveChip>
      ))}
      {state.hasGithub && (
        <ActiveChip onRemove={onClearGithub}>
          <UiIcon name="github" size={12} /> Has source
        </ActiveChip>
      )}
      {state.hasLive && (
        <ActiveChip onRemove={onClearLive}>
          <UiIcon name="globe" size={12} /> Has live site
        </ActiveChip>
      )}
      {dateActive && dateLabel && (
        <ActiveChip onRemove={onClearDates}>
          <UiIcon name="calendar" size={12} /> {dateLabel}
        </ActiveChip>
      )}
    </div>
  );
}

function ActiveChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove filter"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground transition-colors hover:border-foreground/40 hover:bg-muted"
    >
      {children}
    </button>
  );
}
