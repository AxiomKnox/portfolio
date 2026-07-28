# Data model

Everything shown on the site is derived from **Astro Content Collections**
over the **live** trees `src/content/projects/` and `src/content/profile/`
(generated, gitignored), assembled by loaders into domain-shaped entries.
Committed fixtures live under `src/content/placeholder/` and are copied in by
`bun run sync:dev`. Pages and shell read only through `src/content/adapter.ts`
(`getProfile`, `getProjects`, `getProjectById`, `getFeaturedProjects`).

| Store | Committed SoT | Live (generated) | Collection |
| --- | --- | --- | --- |
| Profile | `src/content/placeholder/profile/` | `src/content/profile/` | `profile` (id `profile`) |
| Projects | `src/content/placeholder/projects/<id>/` | `src/content/projects/<id>/` | `projects` |

Sync: `bun run sync` (prod remotes), `bun run sync:dev` (fixtures only),
`bun run sync:dev:all` (fixtures then remotes from `sync.config.ts` — projects +
profile when set; remote wins on id/path overlap).
Domain types live in `src/content/types/`. See
[ADR 0003](../.agents/codebase/adr/0003-content-collections-and-sync.md).

## Project folder layout

```text
src/content/placeholder/projects/<id>/   # committed fixtures
src/content/projects/<id>/               # live (after sync / sync:dev)
  project.md            # frontmatter + markdown body (description)
  git-meta.json         # optional { version, releaseDate }; missing → placeholders
  architecture.json     # optional { nodes, edges, steps }
  preview.png|webp      # optional; both present → fail-closed
```

Frontmatter must **not** include `version` or `releaseDate` (those come from
`git-meta.json` or synthesized placeholders). Folder name must match FM `id`.

## `Project`

Domain shape after loader assemble (`src/content/types/project.ts`):

```ts
type Category = "devops" | "web" | "ml";
type Status   = "dev" | "alpha" | "beta" | "prod" | "archived";

interface Project {
  id: string;              // slug used in the URL (= folder name)
  title: string;
  summary: string;         // 1–2 lines, shown on cards + detail header
  description: string;     // markdown body; rendered with marked (GFM) at build

  category: Category;      // shown near the title; filterable on /projects
  type: string;            // free-form label, e.g. "Deployment platform"
  status: Status;          // from project.md frontmatter
  version: string;         // from git-meta (or "unreleased")
  releaseDate: string;     // ISO yyyy-mm-dd from git-meta (or load/build now)

  techStack: string[];     // matched against the tech-icon MAP
  featured?: boolean;      // shown on the home page carousel
  links: { github?: string; live?: string };
  preview: string;         // "preview.png" | "preview.webp" | GradientPreview token
  associated: string[];    // other project ids

  architecture?: {
    nodes: ArchNode[];     // { id, label, x, y }
    edges: ArchEdge[];     // { from, to } — both are node ids
    steps: ArchStep[];     // { id, title, detail } — id matches ArchNode.id
  };
}
```

Notes:

- `category` is intentionally separate from the sidebar `Properties`
  block on the detail page — it lives next to the title instead.
- `releaseDate` is the single sort key (see `sortDate` below).
- `STATUS_ORDER` (exported from `@/content/types`) freezes the progression as
  `dev → alpha → beta → prod → archived` for filter chips. Status **sort**
  uses a separate prod-first order in `project-discovery.ts`.
- Preview images are optimized through `astro:assets` (`src/lib/content-images.ts`).
  If no preview file exists, UI falls back to `GradientPreview` using the
  token in `preview` (default `grad-1`).

## Architecture graphs

Author `{ nodes, edges, steps }` in `architecture.json` (optional). Keep
`steps[i].id === nodes[i].id` so the diagram and accordion stay in sync.
There is no `arch()` helper — write the object literally (or generate it
offline). Omit the sidecar when a project has no graph.

## `sortDate(project)`

```ts
sortDate(p) => p.releaseDate
```

Tiny helper so the sort call sites read consistently. Used by:

- Home featured section (`getFeaturedProjects` / adapter).
- Projects index island (newest/oldest sort).

## `getProjectById(id)`

Adapter getter over the `projects` collection; used by the detail page
(`getStaticPaths` + page load).

## `Profile`

Domain shape after loader assemble (`src/content/types/profile.ts`):

```ts
interface Profile {
  initials: string;         // navbar/avatar tile
  fullName: string;         // chrome, titles, hero — never hardcode in pages
  tagline: string;          // hero h1 support
  bio: string;              // hero paragraph + about hero
  bioLong: string[];        // longer about copy
  location: string;
  yearsExperience: number;
  education: string;
  email: string;
  avatar: string;           // GradientPreview token when no photo
  profilePhoto?: "profile_photo.png"; // set when file exists on disk

  what: {
    label: string;
    icon: string;
    deliverables: string[];
    learning?: boolean;
  }[];
  links: { label: string; href: string; icon: string }[];
  skills: { category: string; items: string[]; learning?: boolean }[];
  experience: {
    role: string; company: string; location: string;
    start: string; end: string;      // ISO or "Present"
    summary: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    href?: string;
    file?: string;          // profile-root-relative; preferred over href when set
  }[];
}
```

Field-to-render map:

| Field | Where it shows |
| --- | --- |
| `initials`, `fullName` | Navbar tile + text; document titles via Layout / pages |
| `tagline`, `bio` | Home hero |
| `what` | Home hero “what I do” row |
| `experience` | Home timeline + `/about` table (via profile-display helpers) |
| `skills` | `/about` skills grid (each item runs through `BrandIcon`) |
| `certifications` | `/about` certifications list (gated by profile-display) |
| `links` | Footer + `/about` link row |
| `email` | `/about` contact mailto CTA |
| `avatar` / `profilePhoto` | `/about` — photo via `content-images` when present, else GradientPreview |
