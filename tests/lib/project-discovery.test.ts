import { describe, expect, test } from "bun:test";
import type { Project } from "@/content/types";
import {
  buildExplorationQuery,
  clearAllFilters,
  createDefaultToolbarState,
  DEFAULT_TOOLBAR_STATE,
  displayToISO,
  extractFreeText,
  filterAndSortProjects,
  filterFieldsFromQuery,
  hasActiveFilters,
  isoToDisplay,
  maskDisplayDate,
  mergeExplorationPatch,
  normalizeDateInput,
  parseQuery,
  readSearchState,
  serializeFilterTokens,
  syncExplorationState,
  urlSearchHasProjectFilters,
  writeSearchParams,
} from "@/lib/project-discovery";

function project(partial: Partial<Project> & Pick<Project, "id" | "title">): Project {
  return {
    summary: partial.summary ?? "summary",
    description: partial.description ?? "description",
    category: partial.category ?? "web",
    type: partial.type ?? "app",
    status: partial.status ?? "prod",
    version: partial.version ?? "1.0.0",
    releaseDate: partial.releaseDate ?? "2024-06-01",
    techStack: partial.techStack ?? ["React"],
    links: partial.links ?? {},
    preview: partial.preview ?? "grad-1",
    associated: partial.associated ?? [],
    ...partial,
  };
}

describe("parseQuery", () => {
  test("extracts free text and typed tokens", () => {
    const q = parseQuery(`foo tech:"React" status:prod year:2024`);
    expect(q.text).toEqual(["foo"]);
    expect(q.tech).toEqual(["react"]);
    expect(q.status).toEqual(["prod"]);
    expect(q.year).toEqual(["2024"]);
  });

  test("parses from/to into ISO dates", () => {
    const q = parseQuery("from:01-01-2024 to:31-12-2024");
    expect(q.from).toBe("2024-01-01");
    expect(q.to).toBe("2024-12-31");
  });

  test("parses gh/live link tokens", () => {
    const q = parseQuery("gh:1 live:true");
    expect(q.hasGithub).toBe(true);
    expect(q.hasLive).toBe(true);
  });
});

describe("Search-token ↔ chip exploration sync", () => {
  const knownTechs = ["React", "Docker", "Cloudflare Workers"];

  test("extractFreeText keeps bare words and drops filter tokens", () => {
    expect(extractFreeText(`edge tech:"React" status:prod`)).toBe("edge");
    expect(extractFreeText(`foo:bar tech:Docker`)).toBe("foo:bar");
  });

  test("filterFieldsFromQuery maps tokens onto chip fields", () => {
    const fields = filterFieldsFromQuery(`edge tech:react status:prod year:2024 gh:1`, knownTechs);
    expect(fields.techs).toEqual(["React"]);
    expect(fields.statuses).toEqual(["prod"]);
    expect(fields.dateFrom).toBe("2024-01-01");
    expect(fields.dateTo).toBe("2024-12-31");
    expect(fields.hasGithub).toBe(true);
    expect(fields.hasLive).toBe(false);
  });

  test("filterFieldsFromQuery keeps chip while tech token is incomplete", () => {
    const prev = {
      ...createDefaultToolbarState(),
      techs: ["React"],
      statuses: ["prod" as const],
    };
    const fields = filterFieldsFromQuery("tech:re status:pr", knownTechs, prev);
    expect(fields.techs).toEqual(["React"]);
    expect(fields.statuses).toEqual(["prod"]);
  });

  test("serializeFilterTokens emits year for full-year ranges", () => {
    expect(
      serializeFilterTokens({
        statuses: ["beta"],
        techs: ["Docker"],
        hasGithub: true,
        hasLive: false,
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      }),
    ).toBe("status:beta tech:Docker year:2025 gh:1");
  });

  test("serializeFilterTokens quotes tech names with spaces", () => {
    expect(
      serializeFilterTokens({
        statuses: [],
        techs: ["Cloudflare Workers"],
        hasGithub: false,
        hasLive: false,
      }),
    ).toBe(`tech:"Cloudflare Workers"`);
  });

  test("buildExplorationQuery preserves free text beside chips", () => {
    const state = {
      ...createDefaultToolbarState(),
      query: "edge status:prod",
      statuses: ["prod" as const],
      techs: ["React"],
    };
    expect(buildExplorationQuery(state)).toBe("edge status:prod tech:React");
  });

  test("mergeExplorationPatch query → chips", () => {
    const state = createDefaultToolbarState();
    const patch = mergeExplorationPatch(
      state,
      { query: `tech:"React" status:beta live:1` },
      { knownTechs },
    );
    expect(patch.techs).toEqual(["React"]);
    expect(patch.statuses).toEqual(["beta"]);
    expect(patch.hasLive).toBe(true);
    expect(patch.query).toBe(`tech:"React" status:beta live:1`);
  });

  test("mergeExplorationPatch chips → query", () => {
    const state = {
      ...createDefaultToolbarState(),
      query: "edge",
    };
    const patch = mergeExplorationPatch(
      state,
      { techs: ["Docker"], statuses: ["prod" as const] },
      { knownTechs },
    );
    expect(patch.query).toBe("edge status:prod tech:Docker");
    expect(patch.techs).toEqual(["Docker"]);
  });

  test("mergeExplorationPatch removing a chip drops its token", () => {
    const state = {
      ...createDefaultToolbarState(),
      query: "status:prod tech:React",
      statuses: ["prod" as const],
      techs: ["React"],
    };
    const patch = mergeExplorationPatch(state, { techs: [] }, { knownTechs });
    expect(patch.query).toBe("status:prod");
    expect(patch.techs).toEqual([]);
  });

  test("syncExplorationState hydrates chips from q tokens and query from chip URL params", () => {
    const fromTokens = syncExplorationState(
      { ...createDefaultToolbarState(), query: "tech:docker status:beta" },
      knownTechs,
    );
    expect(fromTokens.techs).toEqual(["Docker"]);
    expect(fromTokens.statuses).toEqual(["beta"]);

    const fromChips = syncExplorationState(
      {
        ...createDefaultToolbarState(),
        techs: ["React"],
        hasGithub: true,
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      },
      knownTechs,
    );
    expect(fromChips.query).toBe("tech:React year:2024 gh:1");
  });

  test("round-trip: typed tokens → chips → tokens", () => {
    const typed = mergeExplorationPatch(
      createDefaultToolbarState(),
      { query: `edge tech:React status:prod from:01-01-2024 to:31-12-2024 gh:1` },
      { knownTechs },
    );
    const state = { ...createDefaultToolbarState(), ...typed };
    const rebuilt = buildExplorationQuery(state);
    const again = filterFieldsFromQuery(rebuilt, knownTechs);
    expect(again.techs).toEqual(["React"]);
    expect(again.statuses).toEqual(["prod"]);
    expect(again.dateFrom).toBe("2024-01-01");
    expect(again.dateTo).toBe("2024-12-31");
    expect(again.hasGithub).toBe(true);
    expect(extractFreeText(rebuilt)).toBe("edge");
  });
});

describe("URL search state", () => {
  test("round-trips non-default filter fields", () => {
    const state = {
      ...DEFAULT_TOOLBAR_STATE,
      query: "astro",
      category: "devops" as const,
      sort: "title" as const,
      statuses: ["beta" as const],
      techs: ["Docker"],
      hasGithub: true,
      hasLive: true,
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    };
    const params = writeSearchParams(state);
    const read = readSearchState(params);
    expect(read.query).toBe("astro");
    expect(read.category).toBe("devops");
    expect(read.sort).toBe("title");
    expect(read.statuses).toEqual(["beta"]);
    expect(read.techs).toEqual(["Docker"]);
    expect(read.hasGithub).toBe(true);
    expect(read.hasLive).toBe(true);
    expect(read.dateFrom).toBe("2024-01-01");
    expect(read.dateTo).toBe("2024-12-31");
  });

  test("omits defaults from URL params", () => {
    const params = writeSearchParams(DEFAULT_TOOLBAR_STATE);
    expect(params.toString()).toBe("");
  });

  test("urlSearchHasProjectFilters detects filter keys only", () => {
    expect(urlSearchHasProjectFilters(new URLSearchParams())).toBe(false);
    expect(urlSearchHasProjectFilters(new URLSearchParams("sort=title"))).toBe(false);
    expect(urlSearchHasProjectFilters(new URLSearchParams("from=2023-01-01"))).toBe(true);
    expect(urlSearchHasProjectFilters(new URLSearchParams("q=astro&cat=web"))).toBe(true);
  });
});

describe("filterAndSortProjects", () => {
  const projects = [
    project({
      id: "a",
      title: "Alpha",
      category: "web",
      status: "prod",
      releaseDate: "2024-01-01",
      techStack: ["React"],
      links: { github: "https://example.com/a" },
    }),
    project({
      id: "b",
      title: "Beta",
      category: "devops",
      status: "beta",
      releaseDate: "2025-01-01",
      techStack: ["Docker"],
      links: { live: "https://example.com/b" },
    }),
    project({
      id: "c",
      title: "Gamma",
      category: "ml",
      status: "dev",
      releaseDate: "2023-01-01",
      techStack: ["Python", "React"],
    }),
  ];

  test("filters by category and tech chip", () => {
    const list = filterAndSortProjects(projects, {
      ...DEFAULT_TOOLBAR_STATE,
      category: "web",
      techs: ["React"],
    });
    expect(list.map((p) => p.id)).toEqual(["a"]);
  });

  test("applies Search-token tech and year", () => {
    const list = filterAndSortProjects(projects, {
      ...DEFAULT_TOOLBAR_STATE,
      query: `tech:docker year:2025`,
    });
    expect(list.map((p) => p.id)).toEqual(["b"]);
  });

  test("sorts by title", () => {
    const list = filterAndSortProjects(projects, {
      ...DEFAULT_TOOLBAR_STATE,
      sort: "title",
    });
    expect(list.map((p) => p.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  test("filters hasGithub / hasLive", () => {
    expect(
      filterAndSortProjects(projects, { ...DEFAULT_TOOLBAR_STATE, hasGithub: true }).map(
        (p) => p.id,
      ),
    ).toEqual(["a"]);
    expect(
      filterAndSortProjects(projects, { ...DEFAULT_TOOLBAR_STATE, hasLive: true }).map((p) => p.id),
    ).toEqual(["b"]);
  });

  test("filters by toolbar dateFrom / dateTo ISO bounds", () => {
    const list = filterAndSortProjects(projects, {
      ...createDefaultToolbarState(),
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });
    expect(list.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("date helpers (toolbar / discovery seam)", () => {
  test("isoToDisplay and displayToISO round-trip", () => {
    expect(isoToDisplay("2024-06-15")).toBe("15-06-2024");
    expect(displayToISO("15-06-2024")).toBe("2024-06-15");
    expect(displayToISO("bad")).toBeNull();
  });

  test("normalizeDateInput accepts ISO and dd-mm-yyyy", () => {
    expect(normalizeDateInput("2024-01-01")).toBe("01-01-2024");
    expect(normalizeDateInput("1/2/24")).toBe("01-02-2024");
    expect(normalizeDateInput("01012024")).toBe("01-01-2024");
  });

  test("maskDisplayDate inserts dashes while typing", () => {
    expect(maskDisplayDate("0101")).toBe("01-01");
    expect(maskDisplayDate("01012024")).toBe("01-01-2024");
  });

  test("createDefaultToolbarState returns isolated mutable arrays", () => {
    const a = createDefaultToolbarState();
    const b = createDefaultToolbarState();
    a.statuses.push("prod");
    a.techs.push("React");
    expect(b.statuses).toEqual([]);
    expect(b.techs).toEqual([]);
  });
});

describe("hasActiveFilters / clearAllFilters", () => {
  test("treats query and category as active filters", () => {
    expect(hasActiveFilters(createDefaultToolbarState())).toBe(false);
    expect(hasActiveFilters({ ...createDefaultToolbarState(), query: "astro" })).toBe(true);
    expect(hasActiveFilters({ ...createDefaultToolbarState(), category: "web" })).toBe(true);
    expect(hasActiveFilters({ ...createDefaultToolbarState(), statuses: ["prod"] })).toBe(true);
  });

  test("clearAllFilters resets filter fields but keeps sort and view", () => {
    const dirty = {
      ...createDefaultToolbarState(),
      query: "x",
      category: "ml" as const,
      sort: "title" as const,
      view: "list" as const,
      statuses: ["beta" as const],
      techs: ["React"],
      hasGithub: true,
      hasLive: true,
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    };
    const cleared = clearAllFilters(dirty);
    expect(cleared.query).toBe("");
    expect(cleared.category).toBe("all");
    expect(cleared.statuses).toEqual([]);
    expect(cleared.techs).toEqual([]);
    expect(cleared.hasGithub).toBe(false);
    expect(cleared.hasLive).toBe(false);
    expect(cleared.dateFrom).toBeUndefined();
    expect(cleared.dateTo).toBeUndefined();
    expect(cleared.sort).toBe("title");
    expect(cleared.view).toBe("list");
  });
});
