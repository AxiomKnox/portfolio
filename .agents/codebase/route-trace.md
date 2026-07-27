# Route trace — `/projects/[id]`

Agent reference for project detail static generation.

## Entry point

**File:** `src/pages/projects/[id].astro`

```ts
export async function getStaticPaths() {
  const projects = await getProjects();
  return projects.map((p) => ({ params: { id: p.id } }));
}

const project = await getProjectById(Astro.params.id!);
const descriptionHtml = renderMarkdown(project.description);
```

## Flow

```
URL /projects/atlas-deploy
  │
  ├─ getStaticPaths() → one path per project id
  │
  ├─ getProjectById(id) via src/content/adapter.ts
  │    └─ getEntry("projects", id) → loader-assembled Project
  │         (project.md FM + body + git-meta + architecture.json)
  │
  ├─ unknown id at build → throw (missing path)
  │
  └─ Project detail page
       ├─ Header (GradientPreview, links, summary)
       ├─ article.prose set:html={descriptionHtml}   ← build-time marked GFM
       ├─ Properties sidebar + BrandIcon stack
       ├─ Associated projects (withBase links)
       └─ ProjectArchitectureIsland client:load
            ├─ shared selectedId state
            ├─ ArchitectureDiagram(architecture, selectedId, onSelect)
            └─ StepsAccordion(steps, selectedId, onSelect)
```

## Selection sync contract

Both `ArchitectureDiagram` and `StepsAccordion` live in **one React island** (`ProjectArchitectureIsland`) and share:

- `selectedId: string | null`
- `onSelect: (id: string) => void`

**Do not split** diagram and accordion into separate islands — island isolation would break sync.

When `architecture` is omitted, the island renders a lightweight fallback (no diagram).

`ArchStep.id` must equal the corresponding `ArchNode.id`.

## Markdown

- Rendered at build with `src/lib/markdown.ts` (`marked`, GFM)
- Wrapped in existing typography classes — not Starwind Prose, not a react-markdown island

## Meta / JSON-LD

- Layout receives title/description/og + `projectJsonLd` from `src/lib/jsonld.ts`
- Canonical / absolute URLs via `src/lib/site.ts` + `withBase()`
