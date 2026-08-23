import { useEffect, useState } from "react";
import {
  displayToISO,
  isoToDisplay,
  maskDisplayDate,
  type ToolbarState,
} from "@/lib/project-discovery";

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

  useEffect(() => setFromInput(isoToDisplay(state.dateFrom)), [state.dateFrom]);
  useEffect(() => setToInput(isoToDisplay(state.dateTo)), [state.dateTo]);

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
