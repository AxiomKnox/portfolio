import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATUS_ORDER, type Status } from "@/content/types";
import { BrandIcon, UiIcon } from "@/lib/icon-renderers";
import type { ToolbarState } from "@/lib/project-discovery";
import { statusLabel } from "@/lib/status-display";
import { ReleaseDateSection, SectionHeader } from "./ReleaseDateSection";

const TECH_COLLAPSED_COUNT = 12;

export function FilterPanel({
  state,
  setState,
  allTechs,
  availableYears,
  facetCount,
}: {
  state: ToolbarState;
  setState: (patch: Partial<ToolbarState>) => void;
  allTechs: string[];
  availableYears: number[];
  facetCount: number;
}) {
  const [techExpanded, setTechExpanded] = useState(false);

  const toggleTech = (t: string) => {
    const has = state.techs.some((x) => x.toLowerCase() === t.toLowerCase());
    setState({
      techs: has
        ? state.techs.filter((x) => x.toLowerCase() !== t.toLowerCase())
        : [...state.techs, t],
    });
  };
  const toggleStatus = (s: Status) => {
    const has = state.statuses.includes(s);
    setState({ statuses: has ? state.statuses.filter((x) => x !== s) : [...state.statuses, s] });
  };

  return (
    <Popover>
      <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <UiIcon name="filter" size={14} />
        <span className="hidden sm:inline">Filter</span>
        {facetCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 font-mono text-[10px] text-primary-foreground">
            {facetCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="border-b border-border px-3 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Filters
          </span>
        </div>

        <div className="max-h-[480px] space-y-3 overflow-y-auto p-2.5">
          <div>
            <SectionHeader
              label="Status"
              onClear={state.statuses.length > 0 ? () => setState({ statuses: [] }) : undefined}
            />
            <div className="flex flex-wrap gap-1">
              {STATUS_ORDER.map((s) => {
                const active = state.statuses.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                      active
                        ? "border-foreground/40 bg-muted text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="status-dot" data-status={s} />
                    {statusLabel(s)}
                  </button>
                );
              })}
            </div>
          </div>

          <ReleaseDateSection state={state} setState={setState} availableYears={availableYears} />

          <div>
            <SectionHeader
              label="Links"
              onClear={
                state.hasGithub || state.hasLive
                  ? () => setState({ hasGithub: false, hasLive: false })
                  : undefined
              }
            />
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setState({ hasGithub: !state.hasGithub })}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  state.hasGithub
                    ? "border-foreground/40 bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <UiIcon name="github" size={12} /> Has source
              </button>
              <button
                type="button"
                onClick={() => setState({ hasLive: !state.hasLive })}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  state.hasLive
                    ? "border-foreground/40 bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <UiIcon name="globe" size={12} /> Has live site
              </button>
            </div>
          </div>

          <div>
            <SectionHeader
              label="Tech stack"
              onClear={state.techs.length > 0 ? () => setState({ techs: [] }) : undefined}
            />
            <div className="flex flex-wrap gap-1">
              {(techExpanded ? allTechs : allTechs.slice(0, TECH_COLLAPSED_COUNT)).map((t) => {
                const active = state.techs.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTech(t)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                      active
                        ? "border-foreground/40 bg-muted text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BrandIcon name={t} size={11} />
                    {t}
                  </button>
                );
              })}
              {allTechs.length > TECH_COLLAPSED_COUNT && (
                <button
                  type="button"
                  onClick={() => setTechExpanded((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={techExpanded ? "Show fewer" : "Show all"}
                >
                  {techExpanded ? (
                    <>collapse</>
                  ) : (
                    <>
                      <UiIcon name="more-horizontal" size={12} />
                      {allTechs.length - TECH_COLLAPSED_COUNT} more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
