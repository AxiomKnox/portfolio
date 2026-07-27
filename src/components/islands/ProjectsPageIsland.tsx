import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ProjectCard, ProjectRow } from "@/components/ProjectCard";
import { ProjectsToolbar } from "@/components/ProjectsToolbar";
import type { Project } from "@/content/types";
import type { OptimizedImageAttrs } from "@/lib/optimized-image";
import {
  clearAllFilters,
  createDefaultToolbarState,
  filterAndSortProjects,
  hasActiveFilters,
  readSearchState,
  syncExplorationState,
  type ToolbarState,
  writeSearchParams,
} from "@/lib/project-discovery";

const VIEW_KEY = "projects:view";

function readView(): ToolbarState["view"] {
  if (typeof window === "undefined") return "grid";
  const v = window.localStorage.getItem(VIEW_KEY);
  return v === "list" ? "list" : "grid";
}

function knownTechsFrom(projects: Project[]): string[] {
  const s = new Set<string>();
  for (const p of projects) {
    for (const t of p.techStack) s.add(t);
  }
  return [...s];
}

export default function ProjectsPageIsland({
  projects,
  previewImages = {},
  /** URL filters from Astro (dev/SSR). Static builds still re-sync in useLayoutEffect. */
  initialSearch,
}: {
  projects: Project[];
  /** Pre-optimized preview URLs from the Astro page (`getImage`). */
  previewImages?: Record<string, OptimizedImageAttrs>;
  initialSearch?: Omit<ToolbarState, "view">;
}) {
  const knownTechs = useMemo(() => knownTechsFrom(projects), [projects]);

  const [state, setStateRaw] = useState<ToolbarState>(() =>
    syncExplorationState(
      {
        ...createDefaultToolbarState(),
        ...initialSearch,
      },
      knownTechsFrom(projects),
    ),
  );

  const replaceUrlFor = useCallback((next: ToolbarState) => {
    const params = writeSearchParams(next);
    const qs = params.toString();
    const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    const cur = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== cur) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);

  // Apply address-bar filters + view before paint so static HTML (no query at
  // prerender) does not flash the full list then collapse (CLS).
  // Clears the pre-paint gate set by projects/index.astro when URL filters exist.
  useLayoutEffect(() => {
    setStateRaw((prev) => {
      const next = syncExplorationState(
        {
          ...prev,
          ...readSearchState(new URLSearchParams(window.location.search)),
          view: readView(),
        },
        knownTechs,
      );
      replaceUrlFor(next);
      return next;
    });
    document.documentElement.removeAttribute("data-projects-await-filters");
  }, [knownTechs, replaceUrlFor]);

  useEffect(() => {
    const onPop = () => {
      setStateRaw((prev) =>
        syncExplorationState(
          {
            ...prev,
            ...readSearchState(new URLSearchParams(window.location.search)),
          },
          knownTechs,
        ),
      );
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [knownTechs]);

  useEffect(() => {
    window.localStorage.setItem(VIEW_KEY, state.view);
  }, [state.view]);

  const setState = (patch: Partial<ToolbarState>) => {
    setStateRaw((prev) => {
      const next = { ...prev, ...patch };
      replaceUrlFor(next);
      return next;
    });
  };

  const filtered = useMemo(() => filterAndSortProjects(projects, state), [state, projects]);
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

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <ProjectsToolbar
          state={state}
          setState={setState}
          projects={projects}
          count={filtered.length}
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10" data-projects-results>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center">
            <p className="font-mono text-xs text-muted-foreground">no matching projects</p>
            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 font-mono text-[11px] text-foreground underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : state.view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} previewImage={previewImages[p.id]} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <ProjectRow key={p.id} project={p} previewImage={previewImages[p.id]} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
