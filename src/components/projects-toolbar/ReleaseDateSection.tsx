import { addMonths, format, startOfMonth } from "date-fns";
import { Component, lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UiIcon } from "@/lib/icon-renderers";
import {
  displayToISO,
  isoToDisplay,
  maskDisplayDate,
  type ToolbarState,
} from "@/lib/project-discovery";

function loadCalendar() {
  return import("@/components/ui/calendar")
    .then((m) => ({ default: m.Calendar }))
    .catch(async () => {
      await new Promise((r) => setTimeout(r, 350));
      return import("@/components/ui/calendar").then((m) => ({ default: m.Calendar }));
    });
}

class CalendarLoadBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-[280px] w-[260px] flex-col items-center justify-center gap-2 px-4 sm:w-[500px]">
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Calendar failed to load
          </p>
          <button
            type="button"
            className="font-mono text-[10px] text-foreground underline-offset-2 hover:underline"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onRetry();
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function SectionHeader({ label, onClear }: { label: string; onClear?: () => void }) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
        >
          clear
        </button>
      )}
    </div>
  );
}

export function ReleaseDateSection({
  state,
  setState,
  availableYears,
}: {
  state: ToolbarState;
  setState: (patch: Partial<ToolbarState>) => void;
  availableYears: number[];
}) {
  const [fromInput, setFromInput] = useState(isoToDisplay(state.dateFrom));
  const [toInput, setToInput] = useState(isoToDisplay(state.dateTo));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [Calendar, setCalendar] = useState(() => lazy(loadCalendar));
  const retryCalendar = () => setCalendar(() => lazy(loadCalendar));
  const [leftMonth, setLeftMonth] = useState(() => startOfMonth(new Date()));
  const [rightMonth, setRightMonth] = useState(() => startOfMonth(addMonths(new Date(), 1)));

  useEffect(() => setFromInput(isoToDisplay(state.dateFrom)), [state.dateFrom]);
  useEffect(() => setToInput(isoToDisplay(state.dateTo)), [state.dateTo]);

  const seedPaneMonths = () => {
    const left = startOfMonth(state.dateFrom ? new Date(state.dateFrom) : new Date());
    let right = startOfMonth(state.dateTo ? new Date(state.dateTo) : addMonths(left, 1));
    if (right.getTime() === left.getTime()) right = startOfMonth(addMonths(left, 1));
    setLeftMonth(left);
    setRightMonth(right);
  };

  const activeYear = (() => {
    if (!state.dateFrom || !state.dateTo) return null;
    const y = state.dateFrom.slice(0, 4);
    if (state.dateFrom === `${y}-01-01` && state.dateTo === `${y}-12-31`) return y;
    return null;
  })();

  const setYearRange = (year: string) => {
    if (activeYear === year) {
      setState({ dateFrom: undefined, dateTo: undefined });
    } else {
      setState({ dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` });
    }
  };

  const commitFrom = (v: string) => {
    if (v === "") return setState({ dateFrom: undefined });
    const iso = displayToISO(v);
    if (iso) setState({ dateFrom: iso });
  };
  const commitTo = (v: string) => {
    if (v === "") return setState({ dateTo: undefined });
    const iso = displayToISO(v);
    if (iso) setState({ dateTo: iso });
  };

  const dateRange: DateRange | undefined =
    state.dateFrom || state.dateTo
      ? {
          from: state.dateFrom ? new Date(state.dateFrom) : undefined,
          to: state.dateTo ? new Date(state.dateTo) : undefined,
        }
      : undefined;

  const onRangeSelect = (range: DateRange | undefined) =>
    setState({
      dateFrom: range?.from ? toISODate(range.from) : undefined,
      dateTo: range?.to ? toISODate(range.to) : undefined,
    });

  return (
    <div>
      <SectionHeader
        label="Release date"
        onClear={
          state.dateFrom || state.dateTo
            ? () => setState({ dateFrom: undefined, dateTo: undefined })
            : undefined
        }
      />

      {availableYears.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {availableYears.map((y) => {
            const ys = String(y);
            const active = activeYear === ys;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYearRange(ys)}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                  active
                    ? "border-foreground/40 bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {ys}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <MaskedDateInput
          value={fromInput}
          onChange={setFromInput}
          onCommit={commitFrom}
          placeholder="dd-mm-yyyy"
          aria-label="From date"
        />
        <span className="font-mono text-[10px] text-muted-foreground">→</span>
        <MaskedDateInput
          value={toInput}
          onChange={setToInput}
          onCommit={commitTo}
          placeholder="dd-mm-yyyy"
          aria-label="To date"
        />
        <Popover
          open={pickerOpen}
          onOpenChange={(open) => {
            setPickerOpen(open);
            if (open) seedPaneMonths();
          }}
        >
          <PopoverTrigger
            aria-label="Open calendar"
            className={`flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground ${
              pickerOpen ? "bg-muted text-foreground" : "bg-background"
            }`}
          >
            <UiIcon name="calendar" size={14} />
          </PopoverTrigger>
          <PopoverContent side="right" align="start" sideOffset={12} className="w-auto p-0">
            {pickerOpen ? (
              <CalendarLoadBoundary onRetry={retryCalendar}>
                <Suspense
                  fallback={
                    <div className="flex h-[280px] w-[260px] items-center justify-center sm:w-[500px]">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Loading calendar…
                      </p>
                    </div>
                  }
                >
                  <div className="pointer-events-auto flex flex-col gap-3 p-2 md:flex-row">
                    <Calendar
                      mode="range"
                      captionLayout="dropdown"
                      month={leftMonth}
                      onMonthChange={setLeftMonth}
                      selected={dateRange}
                      onSelect={onRangeSelect}
                    />
                    <Calendar
                      mode="range"
                      captionLayout="dropdown"
                      month={rightMonth}
                      onMonthChange={setRightMonth}
                      selected={dateRange}
                      onSelect={onRangeSelect}
                    />
                  </div>
                </Suspense>
              </CalendarLoadBoundary>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function MaskedDateInput({
  value,
  onChange,
  onCommit,
  placeholder,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  return (
    <input
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(maskDisplayDate(e.target.value))}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit((e.target as HTMLInputElement).value);
      }}
      placeholder={placeholder}
      className="h-7 w-[7.5rem] rounded-md border border-border bg-background px-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none"
      {...rest}
    />
  );
}
