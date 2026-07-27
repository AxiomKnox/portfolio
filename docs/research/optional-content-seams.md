# Optional content seams — research

**Scope:** establish current implementation facts for the optional-content decisions in PROG-58. This report does not select product policy or implement changes.

## Current data source

- `src/content/adapter.ts` is the public content seam used by pages. It re-exports the `Project` type and returns the static `projects` and `profile` objects.
- Project records are defined in `src/data/projects.ts`. Every `Project` currently requires a populated `architecture` object with `nodes`, `edges`, and `steps`; there is no optional architecture field or availability state.
- Personal/portfolio information is defined in `src/data/profile.ts`. `experience` and `certifications` are currently required, populated arrays with no display-policy metadata.

## Rendering paths and current absence behaviour

| Concern | Current renderer | Current behavior if absent/empty | Closest seam |
| --- | --- | --- | --- |
| MLOps work | Project data feeds the homepage, project list, and project detail routes through `getProjects()` / `getProjectById()` | There is no unreleased/learning state beyond existing project status values. The fixture currently includes a featured `harbor-mlops` project with production-style claims. | `Project` schema and `projects` data in `src/data/projects.ts`; consumed through `src/content/adapter.ts` |
| Experience | `src/pages/about.astro` renders `profile.experience` as a timeline and dereferences `profile.experience[0]` in the intro | An empty array would yield an empty timeline but the intro would attempt to access an undefined first record. The section has no conditional display branch. | `profile` schema/data in `src/data/profile.ts` and the About-page intro plus Experience section |
| Certifications | `src/pages/about.astro` always renders the Certifications section and maps `profile.certifications` | An empty array leaves a visible, empty section; the homepage also counts the array for its stats. There is no conditional hide branch. | `profile` schema/data in `src/data/profile.ts`, About Certifications section, and homepage certification-count stat |
| Architecture diagram | `src/pages/projects/[id].astro` passes `project.architecture` to `ProjectArchitectureIsland`, which renders `ArchitectureDiagram` and `StepsAccordion` | `ProjectArchitectureIsland` dereferences `architecture.steps[0]`; `ArchitectureDiagram` maps `architecture.nodes` and `.edges`. A missing architecture object would fail before a fallback can render. Empty arrays do not fail, but produce an empty diagram/accordion. | Make `Project["architecture"]` optional or model availability at the data level; add the fallback boundary in `ProjectArchitectureIsland` before it dereferences the value |

## Architecture implementation facts

- The existing implementation is already an interactive React Flow diagram, not an image: `ArchitectureDiagram.tsx` imports and renders `ReactFlow`.
- Its input is a typed graph (`nodes`, `edges`, `steps`) from project data.
- The appropriate resilience boundary is `ProjectArchitectureIsland`, because it owns both the diagram and synchronized step accordion. A fallback there avoids supplying invalid graph data to either child.

## Data accuracy concern

The current static fixtures describe six years of professional experience, completed certifications, and shipped MLOps work. They conflict with the newly selected portfolio policies (early-career Experience state, hidden empty Certifications, and learning-in-progress MLOps). Implementing PROG-58 therefore needs a content-data replacement or migration in addition to conditional rendering; the current fixture data should not be treated as truthful portfolio content.

## Implementation-ready implications

1. Add explicit content/display state instead of inferring it only from empty arrays where the UI needs a distinct early-career or learning state.
2. Make the About-page intro safe when Experience has no conventional work records.
3. Gate the Certifications section and homepage certification stat consistently.
4. Add an architecture availability/fallback boundary above both React Flow and the step accordion.
