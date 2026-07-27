/**
 * Project discovery — filter / URL / Search-token seam (T6 / PROG-51).
 * Pure module: ToolbarState ↔ URL params, parseQuery, filterAndSortProjects.
 */
import { type Category, type Project, STATUS_ORDER, type Status, sortDate } from "@/content/types";

export type SortKey = "newest" | "oldest" | "title" | "status";
export type View = "grid" | "list";

export interface ToolbarState {
  category: Category | "all";
  query: string;
  sort: SortKey;
  view: View;
  statuses: Status[];
  techs: string[];
  hasGithub: boolean;
  hasLive: boolean;
  dateFrom?: string; // ISO yyyy-mm-dd
  dateTo?: string;
}

export interface ParsedQuery {
  text: string[];
  tech: string[];
  year: string[];
  status: string[];
  from?: string; // ISO
  to?: string; // ISO
  hasGithub?: boolean;
  hasLive?: boolean;
}

/** Structured Search-token keys mirrored by active filter chips. */
export const FILTER_TOKEN_KEYS = new Set([
  "tech",
  "year",
  "status",
  "from",
  "to",
  "gh",
  "github",
  "source",
  "live",
]);

const CHIP_SYNC_KEYS = [
  "statuses",
  "techs",
  "hasGithub",
  "hasLive",
  "dateFrom",
  "dateTo",
] as const satisfies readonly (keyof ToolbarState)[];

const ALLOWED_CATEGORIES = new Set(["all", "devops", "web", "ml"]);
const ALLOWED_SORTS = new Set(["newest", "oldest", "title", "status"]);

const STATUS_SORT_ORDER: Record<Status, number> = {
  prod: 0,
  beta: 1,
  alpha: 2,
  dev: 3,
  archived: 4,
};

/** Fresh default each call — never share mutable `statuses` / `techs` arrays across mounts. */
export function createDefaultToolbarState(): ToolbarState {
  return {
    category: "all",
    query: "",
    sort: "newest",
    view: "grid",
    statuses: [],
    techs: [],
    hasGithub: false,
    hasLive: false,
  };
}

/** Snapshot for spreads/tests only — prefer `createDefaultToolbarState()` for React state. */
export const DEFAULT_TOOLBAR_STATE: ToolbarState = createDefaultToolbarState();

/**
 * True when any visitor-applied filter differs from defaults.
 * Includes search `q` and category — a true “clear filters” reset covers all of these.
 * Sort and view are presentation prefs, not filters.
 */
export function hasActiveFilters(state: ToolbarState): boolean {
  return (
    state.category !== "all" ||
    state.query.trim().length > 0 ||
    state.statuses.length > 0 ||
    state.techs.length > 0 ||
    state.hasGithub ||
    state.hasLive ||
    !!state.dateFrom ||
    !!state.dateTo
  );
}

/** URL keys that change which projects are shown (not sort/view presentation). */
export const PROJECT_FILTER_PARAM_KEYS = [
  "q",
  "cat",
  "statuses",
  "techs",
  "gh",
  "live",
  "from",
  "to",
] as const;

/**
 * True when the address bar carries project filters.
 * Used by the projects page pre-paint gate: static HTML always SSR's the full
 * list (no query at prerender), so deep-linked filters must hide results until
 * the island applies URL state — otherwise CLS collapses a tall grid.
 */
export function urlSearchHasProjectFilters(params: URLSearchParams): boolean {
  return PROJECT_FILTER_PARAM_KEYS.some((key) => params.has(key));
}

/**
 * Full filter reset: query, category, statuses, techs, link flags, dates.
 * Preserves `sort` and `view`.
 */
export function clearAllFilters(state: ToolbarState): ToolbarState {
  return {
    ...state,
    category: "all",
    query: "",
    statuses: [],
    techs: [],
    hasGithub: false,
    hasLive: false,
    dateFrom: undefined,
    dateTo: undefined,
  };
}

// ---------- Date parsing (SOURCE-parity) ----------
// Accept: ddmmyyyy, ddmmyy, dd-mm-yyyy, dd-mm-yy, dd/mm/yyyy, dd/mm/yy, yyyy-mm-dd
function pad(n: string) {
  return n.length === 1 ? `0${n}` : n;
}

function expandYear(y: string): string {
  if (y.length === 4) return y;
  const n = Number(y);
  if (Number.isNaN(n)) return y;
  return n <= 69 ? `20${pad(y)}` : `19${pad(y)}`;
}

export function isoToDisplay(iso?: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function displayToISO(v: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(v.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return iso;
}

export function normalizeDateInput(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/.exec(v);
  if (m) {
    const d = pad(m[1]);
    const mo = pad(m[2]);
    const y = expandYear(m[3]);
    const iso = `${y}-${mo}-${d}`;
    if (!Number.isNaN(new Date(iso).getTime())) return `${d}-${mo}-${y}`;
    return null;
  }
  m = /^(\d{6}|\d{8})$/.exec(v);
  if (m) {
    const s = m[1];
    const d = s.slice(0, 2);
    const mo = s.slice(2, 4);
    const y = s.length === 8 ? s.slice(4, 8) : expandYear(s.slice(4, 6));
    const iso = `${y}-${mo}-${d}`;
    if (!Number.isNaN(new Date(iso).getTime())) return `${d}-${mo}-${y}`;
    return null;
  }
  return null;
}

export function anyToISO(v: string): string | null {
  const disp = normalizeDateInput(v);
  return disp ? displayToISO(disp) : null;
}

export function maskDisplayDate(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  let out = d;
  if (digits.length > 2) out += `-${m}`;
  if (digits.length > 4) out += `-${y}`;
  return out;
}

/** Parse Search-token DSL: `foo tech:"React" status:prod year:2024 from:… to:… gh:1 live:1` */
export function parseQuery(input: string): ParsedQuery {
  const out: ParsedQuery = { text: [], tech: [], year: [], status: [] };
  const re = /(\w+):"([^"]+)"|(\w+):(\S+)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const key = (m[1] || m[3])?.toLowerCase();
    const val = m[2] || m[4];
    const raw = m[5];
    if (key && val) {
      if (key === "from") {
        const iso = anyToISO(val);
        if (iso) out.from = iso;
      } else if (key === "to") {
        const iso = anyToISO(val);
        if (iso) out.to = iso;
      } else if (key === "gh" || key === "github" || key === "source") {
        out.hasGithub = val === "1" || val.toLowerCase() === "true";
      } else if (key === "live") {
        out.hasLive = val === "1" || val.toLowerCase() === "true";
      } else if (key === "tech" || key === "year" || key === "status") {
        out[key].push(val.toLowerCase());
      } else {
        out.text.push(val.toLowerCase());
      }
    } else if (raw) {
      out.text.push(raw.toLowerCase());
    }
  }
  return out;
}

/** Quote token values that contain whitespace. */
export function formatFilterToken(key: string, value: string): string {
  return /\s/.test(value) ? `${key}:"${value}"` : `${key}:${value}`;
}

/**
 * Bare words + unknown `key:value` pairs from the search box.
 * Structured filter tokens (`tech:`, `status:`, …) are omitted.
 */
export function extractFreeText(input: string): string {
  const parts: string[] = [];
  const re = /(\w+):"([^"]+)"|(\w+):(\S+)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const key = (m[1] || m[3])?.toLowerCase();
    const val = m[2] ?? m[4];
    const raw = m[5];
    if (key && val !== undefined) {
      if (!FILTER_TOKEN_KEYS.has(key)) parts.push(m[0]);
    } else if (raw) {
      parts.push(raw);
    }
  }
  return parts.join(" ").trim();
}

function isFullYearRange(dateFrom?: string, dateTo?: string): string | null {
  if (!dateFrom || !dateTo) return null;
  const y = dateFrom.slice(0, 4);
  if (dateFrom === `${y}-01-01` && dateTo === `${y}-12-31`) return y;
  return null;
}

function resolveTechLabel(token: string, knownTechs: string[]): string | null {
  const hit = knownTechs.find((t) => t.toLowerCase() === token.toLowerCase());
  return hit ?? null;
}

/**
 * Map Search-token DSL → chip / facet fields.
 * Incomplete tokens keep matching previous chips while the user is still typing.
 */
export function filterFieldsFromQuery(
  query: string,
  knownTechs: string[] = [],
  prev?: Pick<ToolbarState, "statuses" | "techs" | "hasGithub" | "hasLive" | "dateFrom" | "dateTo">,
): Pick<ToolbarState, "statuses" | "techs" | "hasGithub" | "hasLive" | "dateFrom" | "dateTo"> {
  const q = parseQuery(query);

  const statuses: Status[] = [];
  for (const s of STATUS_ORDER) {
    if (q.status.includes(s)) {
      statuses.push(s);
      continue;
    }
    if (
      prev?.statuses.includes(s) &&
      q.status.some((t) => t.length > 0 && s.startsWith(t) && t !== s)
    ) {
      statuses.push(s);
    }
  }

  const techs: string[] = [];
  for (const token of q.tech) {
    const exact = resolveTechLabel(token, knownTechs);
    if (exact) {
      if (!techs.some((t) => t.toLowerCase() === exact.toLowerCase())) techs.push(exact);
      continue;
    }
    const editing = (prev?.techs ?? []).filter(
      (chip) => chip.toLowerCase().startsWith(token) || token.startsWith(chip.toLowerCase()),
    );
    if (editing.length) {
      for (const chip of editing) {
        if (!techs.some((t) => t.toLowerCase() === chip.toLowerCase())) techs.push(chip);
      }
    } else if (token.length > 0 && !knownTechs.length) {
      // No catalog (tests / early call) — keep the typed token as a chip.
      if (!techs.some((t) => t.toLowerCase() === token)) techs.push(token);
    }
  }

  const hasGithub = !!q.hasGithub;
  const hasLive = !!q.hasLive;

  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  if (q.from || q.to) {
    dateFrom = q.from;
    dateTo = q.to;
  } else if (q.year.length === 1) {
    const y = q.year[0]!;
    dateFrom = `${y}-01-01`;
    dateTo = `${y}-12-31`;
  } else if (q.year.length > 1) {
    dateFrom = undefined;
    dateTo = undefined;
  } else if (prev && queryHasIncompleteDateToken(query) && (prev.dateFrom || prev.dateTo)) {
    dateFrom = prev.dateFrom;
    dateTo = prev.dateTo;
  } else {
    dateFrom = undefined;
    dateTo = undefined;
  }

  return { statuses, techs, hasGithub, hasLive, dateFrom, dateTo };
}

function queryHasIncompleteDateToken(query: string): boolean {
  const re = /(\w+):"([^"]+)"|(\w+):(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const key = (m[1] || m[3])?.toLowerCase();
    const val = m[2] || m[4];
    if ((key === "from" || key === "to") && val && !anyToISO(val)) return true;
  }
  return false;
}

/** Serialize chip / facet fields to Search-token DSL (no free text). */
export function serializeFilterTokens(
  state: Pick<ToolbarState, "statuses" | "techs" | "hasGithub" | "hasLive" | "dateFrom" | "dateTo">,
  options?: { orphanYears?: string[] },
): string {
  const tokens: string[] = [];
  for (const s of state.statuses) tokens.push(formatFilterToken("status", s));
  for (const t of state.techs) tokens.push(formatFilterToken("tech", t));

  const orphanYears = options?.orphanYears?.filter(Boolean) ?? [];
  if (orphanYears.length > 1 && !state.dateFrom && !state.dateTo) {
    for (const y of orphanYears) tokens.push(formatFilterToken("year", y));
  } else {
    const fullYear = isFullYearRange(state.dateFrom, state.dateTo);
    if (fullYear) {
      tokens.push(formatFilterToken("year", fullYear));
    } else {
      if (state.dateFrom) tokens.push(formatFilterToken("from", isoToDisplay(state.dateFrom)));
      if (state.dateTo) tokens.push(formatFilterToken("to", isoToDisplay(state.dateTo)));
    }
  }

  if (state.hasGithub) tokens.push("gh:1");
  if (state.hasLive) tokens.push("live:1");
  return tokens.join(" ").trim();
}

/** Free text from `state.query` + serialized filter chips. */
export function buildExplorationQuery(state: ToolbarState): string {
  const text = extractFreeText(state.query);
  const parsed = parseQuery(state.query);
  const tokens = serializeFilterTokens(state, {
    orphanYears: parsed.year.length > 1 ? parsed.year : undefined,
  });
  return [text, tokens].filter(Boolean).join(" ").trim();
}

function queryHasFilterTokens(query: string): boolean {
  const q = parseQuery(query);
  return (
    q.tech.length > 0 ||
    q.status.length > 0 ||
    q.year.length > 0 ||
    !!q.from ||
    !!q.to ||
    !!q.hasGithub ||
    !!q.hasLive
  );
}

function hasChipFilters(
  state: Pick<ToolbarState, "statuses" | "techs" | "hasGithub" | "hasLive" | "dateFrom" | "dateTo">,
): boolean {
  return (
    state.statuses.length > 0 ||
    state.techs.length > 0 ||
    state.hasGithub ||
    state.hasLive ||
    !!state.dateFrom ||
    !!state.dateTo
  );
}

/**
 * Align Search-token `query` ↔ chip fields.
 * - Query with filter tokens wins → chips updated from tokens
 * - Chips without tokens → query rewritten to include tokens
 */
export function syncExplorationState(state: ToolbarState, knownTechs: string[] = []): ToolbarState {
  if (queryHasFilterTokens(state.query)) {
    return { ...state, ...filterFieldsFromQuery(state.query, knownTechs, state) };
  }
  if (hasChipFilters(state)) {
    return { ...state, query: buildExplorationQuery(state) };
  }
  return state;
}

/**
 * Merge a toolbar patch with two-way Search-token ↔ chip sync (PROG-73).
 * Category / sort / view patches pass through unchanged.
 */
export function mergeExplorationPatch(
  state: ToolbarState,
  patch: Partial<ToolbarState>,
  options?: { knownTechs?: string[] },
): Partial<ToolbarState> {
  const knownTechs = options?.knownTechs ?? [];
  const touchesQuery = Object.hasOwn(patch, "query");
  const touchesChips = CHIP_SYNC_KEYS.some((k) => Object.hasOwn(patch, k));

  if (!touchesQuery && !touchesChips) return patch;

  if (touchesQuery && !touchesChips) {
    const query = patch.query ?? "";
    return {
      ...patch,
      ...filterFieldsFromQuery(query, knownTechs, state),
    };
  }

  if (touchesChips && !touchesQuery) {
    const merged = { ...state, ...patch };
    return { ...patch, query: buildExplorationQuery(merged) };
  }

  // Both: chip fields from patch win; free text taken from patch.query, then tokens rewritten.
  const merged = { ...state, ...patch };
  const free = extractFreeText(patch.query ?? state.query);
  const withFree: ToolbarState = { ...merged, query: free };
  return { ...patch, query: buildExplorationQuery(withFree) };
}

function readCsv(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readBool(params: URLSearchParams, key: string): boolean {
  const v = params.get(key);
  return v === "1" || v === "true";
}

/** Map URL search params → toolbar filter fields (excludes view preference). */
export function readSearchState(params: URLSearchParams): Omit<ToolbarState, "view"> {
  const cat = params.get("cat") ?? "all";
  const sort = params.get("sort") ?? "newest";
  const statuses = readCsv(params, "statuses").filter((s): s is Status =>
    STATUS_ORDER.includes(s as Status),
  );
  return {
    category: (ALLOWED_CATEGORIES.has(cat) ? cat : "all") as Category | "all",
    query: params.get("q") ?? "",
    sort: (ALLOWED_SORTS.has(sort) ? sort : "newest") as SortKey,
    statuses,
    techs: readCsv(params, "techs"),
    hasGithub: readBool(params, "gh"),
    hasLive: readBool(params, "live"),
    dateFrom: params.get("from") || undefined,
    dateTo: params.get("to") || undefined,
  };
}

/** Map toolbar state → URL search params (omits defaults). */
export function writeSearchParams(state: ToolbarState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== "all") params.set("cat", state.category);
  if (state.sort !== "newest") params.set("sort", state.sort);
  if (state.statuses.length) params.set("statuses", state.statuses.join(","));
  if (state.techs.length) params.set("techs", state.techs.join(","));
  if (state.hasGithub) params.set("gh", "1");
  if (state.hasLive) params.set("live", "1");
  if (state.dateFrom) params.set("from", state.dateFrom);
  if (state.dateTo) params.set("to", state.dateTo);
  return params;
}

/** Apply ToolbarState + Search-token DSL, then sort. */
export function filterAndSortProjects(projects: Project[], state: ToolbarState): Project[] {
  const q = parseQuery(state.query);
  let list = projects.filter((p) => {
    if (state.category !== "all" && p.category !== state.category) return false;
    if (state.statuses.length && !state.statuses.includes(p.status)) return false;
    if (state.techs.length) {
      const tech = p.techStack.map((t) => t.toLowerCase());
      if (!state.techs.every((t) => tech.includes(t.toLowerCase()))) return false;
    }
    if (state.hasGithub && !p.links.github) return false;
    if (state.hasLive && !p.links.live) return false;
    const fromBound = q.from ?? state.dateFrom;
    const toBound = q.to ?? state.dateTo;
    if (fromBound && p.releaseDate < fromBound) return false;
    if (toBound && p.releaseDate > toBound) return false;
    if (q.tech.length) {
      const tech = p.techStack.map((t) => t.toLowerCase());
      if (!q.tech.every((t) => tech.some((x) => x.includes(t)))) return false;
    }
    if (q.year.length) {
      const year = new Date(sortDate(p)).getFullYear().toString();
      if (!q.year.includes(year)) return false;
    }
    if (q.status.length && !q.status.includes(p.status)) return false;
    if (q.text.length) {
      const hay = `${p.title} ${p.summary} ${p.description} ${p.techStack.join(" ")}`.toLowerCase();
      if (!q.text.every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  switch (state.sort) {
    case "newest":
      list = list.sort((a, b) => sortDate(b).localeCompare(sortDate(a)));
      break;
    case "oldest":
      list = list.sort((a, b) => sortDate(a).localeCompare(sortDate(b)));
      break;
    case "title":
      list = list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "status":
      list = list.sort((a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]);
      break;
  }
  return list;
}
