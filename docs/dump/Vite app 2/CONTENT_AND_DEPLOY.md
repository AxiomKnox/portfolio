# Content, placeholders, and deployment

This site is **fully static** (no backend or database). All copy and project data ship in the repo and are bundled at build time.

## Files to customize for your real information

### Site identity and copy — [`src/content/site.json`](src/content/site.json)

| Section | What to replace |
| --- | --- |
| `person.displayName` | Your public name |
| `person.tagline` | Short line under the name (e.g. role focus) |
| `person.roleLine` | One-line bio under the About heading |
| `person.summaryParagraphs` | About page story (array of strings) |
| `person.resumeFile` | Filename only, e.g. `resume.pdf` (file must live under [`public/`](public/)) |
| `contact.githubUrl` | Your real GitHub profile or org URL (footer link) |
| `highlights.heroKicker` | Small label above the homepage hero title |
| `highlights.heroTitle` | Hero headline |
| `highlights.heroSubtitle` | Hero supporting paragraph |
| `highlights.projectsSectionIntro` | Blurb above the two project categories on the home page |
| `skills` | Skill groups and items for the About page |
| `footer.note` | Footer line on the left |
| `footer.linkLabel` | Label for the footer GitHub link (e.g. `GitHub`) |
| `meta.aiAssistedLabel` | Short text for the navbar badge (e.g. `AI-assisted`) |

### Projects — [`src/content/projects.json`](src/content/projects.json)

Each object is one project. Replace placeholder names, summaries, URLs, and tech with your real work.

| Field | Notes |
| --- | --- |
| `slug` | URL segment: `/projects/<slug>` — keep stable if you share links |
| `name`, `summary`, `details`, `architecture`, `technologies` | Your narrative |
| `previewImage` | Optional path under `public/` (e.g. `/previews/foo.svg`) |
| `websiteUrl` | Optional live demo URL; omit the key or use `null` if none |
| `repositoryUrl` | Repo URL (required; use a real repo URL) |

Example placeholder domains in the sample data (`example.com`, `github.com/example/...`) should be replaced.

### Optional GitHub sync — [`src/content/github-sync.manifest.json`](src/content/github-sync.manifest.json)

Add entries to refresh **repository URLs**, **homepage**, and optionally **summary** from the GitHub API:

```json
{
  "entries": [
    {
      "slug": "ledger-api",
      "github": "your-username/your-repo",
      "applyDescriptionToSummary": false
    }
  ]
}
```

- Run **`bun run content:sync`** (dry run: prints what would change).
- Run **`bun run content:sync:write`** to write updates into `projects.json`.
- Set **`GITHUB_TOKEN`** (classic PAT with `public_repo` or fine-grained repo read) to avoid tight unauthenticated rate limits.

### Other assets

- **Resume PDF**: replace [`public/resume.pdf`](public/resume.pdf) (or match `person.resumeFile` in `site.json`).
- **Preview images**: add files under [`public/previews/`](public/previews/) and reference them in `projects.json`.
- **HTML title / meta**: [`index.html`](index.html) — update `<title>` and meta description for SEO.

### Navbar “AI-assisted” marker

Controlled by `meta.aiAssistedLabel` in `site.json`. Remove or set to an empty string if you hide the badge (you may also remove the `Badge` in [`src/components/layout/site-header.tsx`](src/components/layout/site-header.tsx) if you prefer no marker at all).

---

## Environment variables

### `VITE_BASE_URL`

Used by Vite as the **`base`** path for assets and by the router. It must match the path where the site is hosted.

| Context | Typical value |
| --- | --- |
| Local dev | Leave unset or `/` — site at `http://localhost:5173/` |
| GitHub **user** site (`username.github.io`) | `/` |
| GitHub **project** site (`username.github.io/repo-name/`) | `/repo-name/` (leading slash, trailing slash) |

**Local build** (PowerShell example):

```powershell
$env:VITE_BASE_URL="/your-repo-name/"
bun run build
```

**GitHub Actions** (example):

```yaml
env:
  VITE_BASE_URL: /${{ github.event.repository.name }}/
```

Then upload `dist/` to GitHub Pages.

The app uses `import.meta.env.BASE_URL` for the resume path and router `basename`, so links and PDFs resolve correctly under a subpath.

### `GITHUB_TOKEN` (optional)

Only for **`bun run content:sync`** / **`content:sync:write`**. Not used by the browser or the production bundle. In CI, use a secret; never commit tokens.

---

## Commands

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Dev server |
| `bun run build` | Typecheck + production build + copy `dist/index.html` → `dist/404.html` for SPA on GitHub Pages |
| `bun run preview` | Preview `dist/` locally |
| `bun run content:sync` | Dry-run GitHub metadata sync |
| `bun run content:sync:write` | Write sync results to `src/content/projects.json` |

---

## Deploying to GitHub Pages

1. Set `VITE_BASE_URL` for your repo **if** the site is not at domain root.
2. Run `bun run build`.
3. Publish the **`dist/`** folder (e.g. `actions/upload-pages-artifact` or branch `gh-pages`).
4. Ensure **`404.html`** exists in the published output (the build script copies it from `index.html` so client-side routes work on refresh).

No server runtime is required; only static files are served.
