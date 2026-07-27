import { useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { type Category, type Project, STATUS_ORDER, type Status } from "@/content/types";
import { BrandIcon, UiIcon } from "@/lib/icon-renderers";
import {
  clearAllFilters,
  displayToISO,
  extractFreeText,
  hasActiveFilters,
  mergeExplorationPatch,
  normalizeDateInput,
  type SortKey,
  type ToolbarState,
} from "@/lib/project-discovery";
import { statusLabel, statusSearchText } from "@/lib/status-display";
import { ActiveFilterChips } from "./projects-toolbar/ActiveFilterChips";
import { FilterPanel } from "./projects-toolbar/FilterPanel";
import { fuzzyScore, rankByFuzzy, type SuggestCandidate } from "./projects-toolbar/fuzzy";

export type { SortKey, ToolbarState, View } from "@/lib/project-discovery";

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "devops", label: "DevOps" },
  { id: "web", label: "Web" },
  { id: "ml", label: "ML" },
];

function stripMatchingFreeText(query: string, label: string): string {
  const needle = label.trim().toLowerCase();
  if (!needle) return extractFreeText(query);
  const kept = extractFreeText(query)
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.toLowerCase() !== needle && !needle.startsWith(w.toLowerCase()));
  return kept.join(" ");
}

export function ProjectsToolbar({
  state,
  setState,
  projects,
  count,
}: {
  state: ToolbarState;
  setState: (patch: Partial<ToolbarState>) => void;
  projects: Project[];
  count: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchAnchorRef = useRef<HTMLDivElement | null>(null);
  const suppressFocusOpenRef = useRef(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const allTechs = useMemo(() => {
    const s = new Set<string>();
    for (const p of projects) {
      for (const t of p.techStack) s.add(t);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const availableYears = useMemo(() => {
    const s = new Set<number>();
    for (const p of projects) s.add(new Date(p.releaseDate).getFullYear());
    return [...s].sort((a, b) => b - a);
  }, [projects]);

  /** Patch toolbar state with Search-token ↔ chip sync. */
  const applyState = (patch: Partial<ToolbarState>) => {
    setState(mergeExplorationPatch(state, patch, { knownTechs: allTechs }));
  };

  const toggleTech = (t: string) => {
    const has = state.techs.some((x) => x.toLowerCase() === t.toLowerCase());
    applyState({
      techs: has
        ? state.techs.filter((x) => x.toLowerCase() !== t.toLowerCase())
        : [...state.techs, t],
    });
  };
  const toggleStatus = (s: Status) => {
    const has = state.statuses.includes(s);
    applyState({
      statuses: has ? state.statuses.filter((x) => x !== s) : [...state.statuses, s],
    });
  };

  const facetCount =
    state.statuses.length +
    state.techs.length +
    (state.hasGithub ? 1 : 0) +
    (state.hasLive ? 1 : 0) +
    (state.dateFrom || state.dateTo ? 1 : 0);

  const filtersActive = hasActiveFilters(state);

  const resetFilters = () => {
    const next = clearAllFilters(state);
    setState({
      category: next.category,
      query: next.query,
      statuses: next.statuses,
      techs: next.techs,
      hasGithub: next.hasGithub,
      hasLive: next.hasLive,
      dateFrom: next.dateFrom,
      dateTo: next.dateTo,
    });
  };

  const clearSearch = () => {
    applyState({ query: "" });
    inputRef.current?.focus();
  };

  const needle = state.query.trim().toLowerCase();

  const dropdownTechs = useMemo(() => {
    const list = needle ? rankByFuzzy(allTechs, needle, (t) => t) : allTechs;
    return list.slice(0, 12);
  }, [allTechs, needle]);
  const dropdownStatuses = useMemo(() => {
    if (!needle) return STATUS_ORDER;
    return rankByFuzzy(STATUS_ORDER, needle, (s) => statusSearchText(s));
  }, [needle]);
  const dropdownYears = useMemo(() => {
    if (!needle) return availableYears;
    return rankByFuzzy(availableYears, needle, (y) => String(y));
  }, [availableYears, needle]);

  const detectedDate = useMemo(() => {
    if (!state.query.trim()) return null;
    const tokens = state.query.trim().split(/\s+/);
    for (const t of tokens) {
      const disp = normalizeDateInput(t);
      if (disp) {
        const iso = displayToISO(disp);
        if (iso) return { iso, disp };
      }
    }
    return null;
  }, [state.query]);

  const bestSuggestion = useMemo((): SuggestCandidate | null => {
    if (!needle) return null;
    const pool: SuggestCandidate[] = [];
    for (const t of allTechs) {
      const score = fuzzyScore(needle, t);
      if (score != null) pool.push({ kind: "tech", id: t, label: t, score });
    }
    for (const s of STATUS_ORDER) {
      const score = Math.max(fuzzyScore(needle, s) ?? 0, fuzzyScore(needle, statusLabel(s)) ?? 0);
      if (score > 0) pool.push({ kind: "status", id: s, label: statusLabel(s), score });
    }
    for (const y of availableYears) {
      const score = fuzzyScore(needle, String(y));
      if (score != null) pool.push({ kind: "year", id: String(y), label: String(y), score });
    }
    if (pool.length === 0) return null;
    pool.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
    return pool[0] ?? null;
  }, [allTechs, availableYears, needle]);

  const ghostSuffix = useMemo(() => {
    if (!bestSuggestion || !state.query) return "";
    const q = state.query;
    const label = bestSuggestion.label;
    if (label.toLowerCase().startsWith(q.toLowerCase())) return label.slice(q.length);
    return "";
  }, [bestSuggestion, state.query]);

  const queryMatchesLabel = (label: string) => {
    const q = state.query.trim().toLowerCase();
    if (!q) return false;
    const l = label.toLowerCase();
    return l === q || l.startsWith(q) || l.includes(q);
  };

  const pickTech = (t: string) => {
    const has = state.techs.some((x) => x.toLowerCase() === t.toLowerCase());
    const techs = has
      ? state.techs.filter((x) => x.toLowerCase() !== t.toLowerCase())
      : [...state.techs, t];
    if (!has && queryMatchesLabel(t)) {
      applyState({ techs, query: stripMatchingFreeText(state.query, t) });
    } else {
      applyState({ techs });
    }
    inputRef.current?.focus();
  };
  const pickStatus = (s: Status) => {
    const has = state.statuses.includes(s);
    const statuses = has ? state.statuses.filter((x) => x !== s) : [...state.statuses, s];
    const consume = !has && (queryMatchesLabel(statusLabel(s)) || queryMatchesLabel(s));
    if (consume) {
      applyState({
        statuses,
        query: stripMatchingFreeText(stripMatchingFreeText(state.query, statusLabel(s)), s),
      });
    } else {
      applyState({ statuses });
    }
    inputRef.current?.focus();
  };
  const pickYear = (y: number) => {
    const active = state.dateFrom === `${y}-01-01` && state.dateTo === `${y}-12-31`;
    if (active) {
      applyState({ dateFrom: undefined, dateTo: undefined });
    } else if (queryMatchesLabel(String(y))) {
      applyState({
        dateFrom: `${y}-01-01`,
        dateTo: `${y}-12-31`,
        query: stripMatchingFreeText(state.query, String(y)),
      });
    } else {
      applyState({ dateFrom: `${y}-01-01`, dateTo: `${y}-12-31` });
    }
    inputRef.current?.focus();
  };

  const acceptBestSuggestion = () => {
    if (!bestSuggestion) return;
    if (bestSuggestion.kind === "tech") {
      const t = bestSuggestion.id;
      const has = state.techs.some((x) => x.toLowerCase() === t.toLowerCase());
      applyState({
        techs: has ? state.techs : [...state.techs, t],
        query: stripMatchingFreeText(state.query, t),
      });
    } else if (bestSuggestion.kind === "status") {
      const s = bestSuggestion.id as Status;
      const has = state.statuses.includes(s);
      applyState({
        statuses: has ? state.statuses : [...state.statuses, s],
        query: stripMatchingFreeText(stripMatchingFreeText(state.query, statusLabel(s)), s),
      });
    } else {
      const y = Number(bestSuggestion.id);
      applyState({
        dateFrom: `${y}-01-01`,
        dateTo: `${y}-12-31`,
        query: stripMatchingFreeText(state.query, String(y)),
      });
    }
    inputRef.current?.focus();
  };

  const applyDateAs = (iso: string, side: "from" | "to") => {
    applyState(side === "from" ? { dateFrom: iso } : { dateTo: iso });
    inputRef.current?.focus();
  };

  const openSearch = () => {
    if (suppressFocusOpenRef.current) return;
    setSearchOpen(true);
  };
  const closeSearchFromDismiss = () => {
    suppressFocusOpenRef.current = true;
    setSearchOpen(false);
    window.setTimeout(() => {
      suppressFocusOpenRef.current = false;
    }, 150);
  };

  const anyDropdownContent =
    dropdownStatuses.length > 0 ||
    dropdownYears.length > 0 ||
    dropdownTechs.length > 0 ||
    !!detectedDate;
  const searchHasValue = state.query.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 border-b border-border pb-1.5">
        {CATEGORIES.map((c) => {
          const active = state.category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setState({ category: c.id })}
              className={`rounded-md px-2.5 py-1 text-sm transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          );
        })}
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto font-mono text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Popover
          open={searchOpen && anyDropdownContent}
          onOpenChange={(open, details) => {
            if (!open && details?.reason === "outside-press") {
              const target = (details.event as Event | undefined)?.target as Node | null;
              if (target && searchAnchorRef.current?.contains(target)) {
                details.cancel?.();
                return;
              }
              closeSearchFromDismiss();
              return;
            }
            if (!open) {
              closeSearchFromDismiss();
              return;
            }
            setSearchOpen(true);
          }}
        >
          <div
            ref={searchAnchorRef}
            className="relative flex-1 basis-2/3 rounded-md border border-border bg-background focus-within:border-ring"
          >
            <UiIcon
              name="search"
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
            />
            {ghostSuffix && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pl-8 pr-8 font-mono text-xs"
              >
                <span className="whitespace-pre text-transparent">{state.query}</span>
                <span className="whitespace-pre text-muted-foreground/45">{ghostSuffix}</span>
              </div>
            )}
            <input
              ref={inputRef}
              value={state.query}
              onChange={(e) => {
                applyState({ query: e.target.value });
                if (!searchOpen) setSearchOpen(true);
              }}
              onFocus={openSearch}
              onKeyDown={(e) => {
                if (e.key === "Tab" && bestSuggestion && searchOpen) {
                  e.preventDefault();
                  acceptBestSuggestion();
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSearchOpen(false);
                } else if (e.key === "Escape") {
                  if (searchOpen) {
                    e.preventDefault();
                    setSearchOpen(false);
                  } else {
                    e.currentTarget.blur();
                  }
                }
              }}
              placeholder="Search — text or pick a suggestion"
              className="relative z-[1] h-8 w-full rounded-md bg-transparent pl-8 pr-8 font-mono text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            {searchHasValue && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UiIcon name="x" size={12} />
              </button>
            )}
          </div>
          <PopoverContent
            align="start"
            className="w-[440px] p-0"
            anchor={searchAnchorRef}
            initialFocus={false}
            finalFocus={false}
          >
            <div className="border-b border-border px-2.5 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Suggestions
              </span>
            </div>
            <div className="max-h-[380px] space-y-3 overflow-y-auto p-2.5">
              {dropdownStatuses.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Status
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dropdownStatuses.map((s) => {
                      const active = state.statuses.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickStatus(s)}
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
              )}

              {dropdownYears.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Year
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dropdownYears.map((y) => {
                      const active =
                        state.dateFrom === `${y}-01-01` && state.dateTo === `${y}-12-31`;
                      return (
                        <button
                          key={y}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickYear(y)}
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                            active
                              ? "border-foreground/40 bg-muted text-foreground"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dropdownTechs.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Tech
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dropdownTechs.map((t) => {
                      const active = state.techs.some((x) => x.toLowerCase() === t.toLowerCase());
                      return (
                        <button
                          key={t}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickTech(t)}
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
                  </div>
                </div>
              )}

              {detectedDate && (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Detected date
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyDateAs(detectedDate.iso, "from")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <UiIcon name="calendar" size={12} /> from: {detectedDate.disp}
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyDateAs(detectedDate.iso, "to")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <UiIcon name="calendar" size={12} /> to: {detectedDate.disp}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-1.5 font-mono text-[10px] text-muted-foreground">
                <span>
                  <kbd className="rounded border border-border bg-muted px-1">Tab</kbd> accept ·{" "}
                  <kbd className="rounded border border-border bg-muted px-1">Esc</kbd> close
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1">
          <FilterPanel
            state={state}
            setState={applyState}
            allTechs={allTechs}
            availableYears={availableYears}
            facetCount={facetCount}
          />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <UiIcon name="arrow-down-up" size={14} />
              <span className="hidden sm:inline">Sort</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={state.sort}
                onValueChange={(v) => {
                  if (v) setState({ sort: v as SortKey });
                }}
              >
                <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex h-8 items-center rounded-md border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setState({ view: "grid" })}
              aria-label="Grid view"
              className={`flex h-full w-7 items-center justify-center rounded-sm transition-colors ${
                state.view === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UiIcon name="layout-grid" size={14} />
            </button>
            <button
              type="button"
              onClick={() => setState({ view: "list" })}
              aria-label="List view"
              className={`flex h-full w-7 items-center justify-center rounded-sm transition-colors ${
                state.view === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UiIcon name="list" size={14} />
            </button>
          </div>

          <span className="ml-0.5 hidden font-mono text-[11px] text-muted-foreground sm:inline">
            {count} Projects
          </span>
        </div>
      </div>

      <ActiveFilterChips
        state={state}
        onToggleStatus={toggleStatus}
        onToggleTech={toggleTech}
        onClearGithub={() => applyState({ hasGithub: false })}
        onClearLive={() => applyState({ hasLive: false })}
        onClearDates={() => applyState({ dateFrom: undefined, dateTo: undefined })}
      />
    </div>
  );
}
