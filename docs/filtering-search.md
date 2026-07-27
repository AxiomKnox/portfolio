# Filtering & search

The `/projects` page is the single place with a rich filter UI. All state
is kept in one object on the route component and mutated through a
partial-patch `setState`.

## `ToolbarState`

```ts
interface ToolbarState {
  category: "all" | Category;
  query: string;               // free-form + tokens
  sort: "newest" | "oldest" | "title" | "status";
  view: "grid" | "list";
  statuses: Status[];          // multi-select
  techs: string[];             // multi-select, case-insensitive match
  hasGithub: boolean;
  hasLive: boolean;
  dateFrom?: string;           // ISO yyyy-mm-dd (inclusive)
  dateTo?: string;             // ISO yyyy-mm-dd (inclusive)
}
```

## Search token grammar

Parsed by `parseQuery(input)` in `src/lib/project-discovery.ts`:

```
<token>  := <key>:"<value>" | <key>:<value> | <bareword>
<key>    := tech | year | status | from | to | gh | live
```

Examples:

```
react                          → text: ["react"]
tech:"React"                   → tech: ["react"]
tech:React tech:Docker         → tech: ["react","docker"]  (AND across tokens)
year:2024 year:2026            → year: ["2024","2026"]    (OR within a key)
status:prod                    → status: ["prod"]
from:01-01-2024 to:31-12-2024  → date bounds (ISO)
gh:1 live:1                    → Has source / Has live site
edge tech:"Cloudflare"         → text + tech AND'd together
```

- `text` words are AND'd; each must appear in
  `title + summary + description + techStack`.
- `tech` words must all appear in the project's `techStack`
  (case-insensitive `includes`).
- `year` matches the project's `releaseDate` year; multiple years are OR.
- `status` matches `project.status`; multiple statuses are OR.

### Search-token ↔ chip sync (PROG-73)

Two-way exploration sync lives in `project-discovery` (`mergeExplorationPatch`,
`syncExplorationState`, `buildExplorationQuery`, `filterFieldsFromQuery`):

- Typing / editing filter tokens updates chip fields (`statuses`, `techs`,
  dates, `hasGithub` / `hasLive`).
- Adding / removing chips (or Filter panel facets) rewrites the matching
  tokens in `query`, preserving free-text bare words.
- Full-year date ranges serialize as `year:YYYY`; arbitrary bounds use
  `from:` / `to:` (display `dd-mm-yyyy`).
- The search suggestion popover toggles the same chip fields; accepted
  suggestions consume matching free text and leave the structured token in
  the box.

## Filter categories

Opened via the `Filter` button. Sections:

1. **Status** — pill row over `STATUS_ORDER`. Each pill shows the
   status color dot from `STATUS_META`.
2. **Links** — two toggles: `Has source` (`github`), `Has live site`
   (`live`).
3. **Tech stack** — every distinct tech across all projects, sorted
   alphabetically, rendered with `<BrandIcon>` at `size=11` so the row
   matches project cards visually.

A `Clear all` action wipes statuses, techs, link toggles, and the date
range. Individual tech section has its own `clear`.

## Date range

Opened via the `Date` button. Uses shadcn `Calendar` in `mode="range"`
with `numberOfMonths={2}` and `captionLayout="dropdown"`, giving the
year and month dropdowns for fast jumping. Selection is written back as
ISO `yyyy-mm-dd` strings for straightforward `<` / `>` comparisons
against `Project.releaseDate`.

The trigger button shows a human range label when set:

```
From May 2024
Until Dec 2025
May 2024 – Dec 2025
```

## Active chips

Below the toolbar, a horizontal chip row visualizes every active filter.
Each chip has an `X` to remove that single filter. Chips are generated
for:

- each active status (with color dot)
- each active tech (with icon)
- `Has source`, `Has live site` toggles
- the date range (single chip covering both endpoints)

## Sort & view

- Sort keys map to:
  - `newest` / `oldest` → `sortDate(p)` string compare
  - `title` → `a.title.localeCompare(b.title)`
  - `status` → fixed order `prod, beta, alpha, dev, archived`
- `view` swaps `<ProjectCard>` grid for `<ProjectRow>` list.

## Filtering pipeline (`src/lib/project-discovery.ts`)

Order applied by `filterAndSortProjects` (island calls it; toolbar owns the UI):

1. Category tab.
2. Multi-select statuses.
3. Multi-select techs (all must be present).
4. `hasGithub` / `hasLive` toggles.
5. Date range (`releaseDate` between `dateFrom` and `dateTo`).
6. Parsed query: `tech` AND, `year` OR, `status` OR, `text` AND across
   the searchable haystack.
7. Sort.

## Known follow-up

Search-token ↔ chip exploration sync shipped in **PROG-73**. Remaining
polish (if wanted): multi-`year:` OR chips beyond a single date-range
chip, and richer in-progress token editing affordances.
