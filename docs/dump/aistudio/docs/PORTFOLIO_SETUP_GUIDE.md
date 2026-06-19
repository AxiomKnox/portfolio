# Portfolio Setup Guide

Welcome to your new portfolio builder! This document outlines everything you need to know to customize this template with your own data, fetch project content from remote repositories, and deploy to GitHub Pages.

## 1. Placeholders to Update

### Personal Information & Global Settings
All global site data is managed in `src/data.ts`. Open this file and update the following:
- `name`: Your full name (e.g., "Julian Vane").
- `role`: Your primary job title (e.g., "Senior Backend Engineer / Cloud Architect").
- `bio`: A short description of yourself.
- `links`: Update your GitHub, LinkedIn, and Email URLs.
- `resumeUrl`: Link to your resume (default is `/resume.pdf`).
- `SKILL`: Update your skills list to reflect your real expertise.

### Assets & Media
Place your media assets in the `public/` directory:
- **Resume**: Save as `public/resume.pdf` (or update the filename in `src/data.ts`).
- **Architecture Diagrams**: Save in `public/projects/project-slug.png`. By default, the markdown will look for these based on the `architecture.image` property if defined (e.g., `/projects/atlas.png`).

---

## 2. Managing Project Content

This portfolio is designed to pull your project descriptions directly from Markdown files. You can manage them locally, or sync them from READMEs in your other GitHub repositories!

The synchronization process reads Markdown files, parses them automatically into JSON based on standard headings, and writes to `src/data/generated-projects.json`.

### Understanding `projects-config.json`
To control *where* your project data comes from, edit `projects-config.json` at the root of the project:

```json
{
  "localDir": "./src/content/projects",       // Path for local markdown files
  "remoteRepos": [                            // List of remote repositories to sync
    {
      "owner": "your-github-username",
      "repo": "your-project-repo",
      "branch": "main",
      "path": "README.md"
    }
  ]
}
```

### Local Projects 
1. Create new `.md` files in `src/content/projects/`. 
2. Use the file naming convention `[ID]-[CATEGORY_ID]-[STATUS].md` or define the `ID` in your `H1` tag.
3. Category IDs supported natively:
   - `-BE-` (Backend)
   - `-DO-` (DevOps)
   - `-ML-` (MLOps)
4. Example Title: `# [PROJ-ML-001-PROD] Sentinel Vision Systems`

### Remote Projects (From other GitHub Repos)
1. Add the repository to the `remoteRepos` array in `projects-config.json`.
2. Ensure the remote `README.md` follows the expected heading structure:
   ```markdown
   # [OPTIONAL-ID] Project Name
   ## Summary
   Short one-line summary...
   ## Details
   Long form paragraphs detailing the project...
   ## Architecture
   Explanation of architecture...
   ## Tech Stack
   - React
   - Go
   ## Links
   - Repository: [https://github.com/.../...]
   - Live Page: [https://...]
   ```

### Running the Sync
Whenever you update local markdown files or want to pull fresh data from your remote repositories, run:
```bash
npm run sync
```
*Note: This command runs automatically via the `prebuild` script when you run `npm run build`.*

---

## 3. Deployment & Environment Variables

When deploying to GitHub Pages, especially if your repository is not your primary `username.github.io` repo, your site might be served from a subpath (e.g., `https://username.github.io/portfolio/`). You need to configure this via environment variables.

### Local Development
No environment variables are strictly required for local development. Simply run:
```bash
npm run dev
```

### GitHub Pages (Subpath Deployments)
If your repository is named `my-portfolio`, your site will live at `/my-portfolio/`.

1. Create a `.env` file for local testing (optional):
   ```env
   VITE_BASE_URL=/my-portfolio/
   ```
2. For your CI/CD pipeline (e.g., GitHub Actions), configure the environment variable in your workflow yaml.

Example `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
        env:
          VITE_BASE_URL: /my-portfolio/  # <--- CRITICAL FOR GITHUB PAGES
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

The application is fully configured to read `import.meta.env.VITE_BASE_URL` to adjust React Router paths, asset links, and Vite compilation dynamically.
