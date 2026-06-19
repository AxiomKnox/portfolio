# Portfolio Setup Guide

Welcome to your portfolio! Customize site data, sync project markdown into JSON, and deploy to GitHub Pages with Astro.

## 1. Placeholders to Update

### Personal Information & Global Settings

All global site data is in [`src/data/data.ts`](../src/data/data.ts):

- `firstName`, `lastName`, `shortInitials`, `longInitials`
- `role`, `location`, `email`, `socials`
- `resumeUrl` (default `/resume.pdf`)
- `heroSection`, `aboutMe`
- `SKILLS` in the same file

### Assets & Media

Place assets in `public/`:

- **Resume**: `public/resume.pdf`
- **Background** (optional): `public/darkModeBg.svg`
- **Architecture diagrams**: `public/projects/<slug>.png` (reference via markdown / project data)

---

## 2. Managing Project Content

Markdown is parsed into [`src/content/generated-projects.json`](../src/content/generated-projects.json) by the sync script.

### `projects-config.json` (repo root)

```json
{
  "localDir": "./src/content/projects",
  "remoteRepos": [
    {
      "owner": "your-github-username",
      "repo": "your-project-repo",
      "branch": "main",
      "path": "README.md"
    }
  ]
}
```

### Local projects

1. Add `.md` files under `src/content/projects/`.
2. Use H1 with ID: `# [PROJ-BE-001-PROD] Project Name`
3. Category from ID segment: `-BE-`, `-DO-`, `-ML-`

### Remote projects

Add repos to `remoteRepos` and follow the heading structure in [README_TEMPLATE.md](./README_TEMPLATE.md).

### Running sync

```bash
bun run sync
```

Runs automatically before `bun run build` via `prebuild`.

---

## 3. Development & deployment

### Local dev

```bash
bun install
bun run dev
```

Site base path is `/portfolio/` (see `base` in `astro.config.mjs`). Open:

`http://localhost:4321/portfolio/`

### GitHub Pages (subpath)

This repo is configured for `https://<user>.github.io/portfolio/`:

- `base: '/portfolio/'` in `astro.config.mjs`
- React Router uses `import.meta.env.BASE_URL`
- `postbuild` copies `dist/index.html` → `dist/404.html` for client-side routes

Deploy workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) (GitHub Pages artifact + `deploy-pages`).

Enable **Pages → GitHub Actions** as the source in repository settings.

### Icons

React UI icons use **`@iconify/react`** via [`src/components/Icon.tsx`](../src/components/Icon.tsx). Astro-only pages could use `astro-icon` later if needed.

### Theme (no flash on refresh)

A blocking script in [`src/pages/index.astro`](../src/pages/index.astro) applies `light`/`dark` from `localStorage` before paint. React [`ThemeProvider`](../src/app/providers/theme-provider.tsx) reads the same class on mount.
