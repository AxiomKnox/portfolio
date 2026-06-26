# Setup

Focus on Simplicity, then looks, then features, then optimization

## New Tech Stack
This is going to be a rewrite of my portfolio project for github pages, which will have the following stack & technologies, and follow the SSG architecture, no server-side / backend code or SSR
- Pnpm
- Astro + Vite
- TypeScript
- TailwindCSS
- Starwind UI 
    - in place of shadcn, cuz Zero React overhead, native Astro components, simpler setup & perf.
- React (Islands)
    - mainly for the architecture diagram, which will not be an image or svg, but interactive & animated thing
- Testing for Animations & Transitions
    - Version A: Tailwind + Starwind UI + Astro View Transitions only.
    - Version B: add AstroAnimate.
    - Version C: add Motion inside a React island only if needed.
- Beasties
    - for inlining critical css & lazy loading the rest
- React Flow
    - for interactive architecture diagrams
    - the code for this exists in a file called architecture.(jsx|tsx) in every project repo, alongside projects.md, which have only that project's architecture diagram

- Astro Features & Optimizations
    - `client:load`, `client:visible` & `client:idle`, etc for hydration / partial hydration with Immediate, when user scrolls into view & when main thread is free timings respectively
    - <Font /> Fonts API
    - <Image /> & <Picture /> components for Images
    - <ViewTransitions /> API for Page Transitions
    - astro:env for env vars & secrets, but since no server side, only PUBLIC_ env vars
    - Content Collections API, which provides unified, type-safe way to manage portfolio content in Markdown, MDX, YAML, TOML & JSON
    - Built-in CSP

> [!Important] Take a look at the Beasties Framework & implementation as well as current stack's thoughts of Brave AI 

[link](file://D:/1_progg/2_Projects/GitHub Pages Portfolio/astro-2/docs/dump/brave logs/beasties library with astro framework comparision.pdf)

---
---

Follow these phases: each gen or combination of gens should progress from 1 to 6 phase, with a commit between each phase

### 1. Content & Data Phase (The Foundation)
Before any visual work, you define the raw data.
*   **Action:** Create **Astro Content Collections** (Markdown/MDX files) for projects, blog posts, and personal info.
*   **Goal:** Ensure all text, images, and metadata exist in a structured format.
*   **Result:** A data-rich site that looks like plain HTML.

### 2. Layout & Structure Phase (The Skeleton)
Building the static grid and responsive containers.
*   **Action:** Create Astro Layouts (`.astro` files) for the Header, Footer, Grid Systems, and Typography hierarchy.
*   **Goal:** Establish the "wireframe" look. The site is fully navigable but strictly static (no motion yet).
*   **Result:** A functional, responsive website that loads instantly but feels "rigid."

### 3. Interaction Logic Phase (The Behavior)
Defining *how* elements respond to users before adding motion.
*   **Action:** Write JavaScript/TypeScript for state changes (e.g., mobile menu toggle, theme switcher, tab switching, form validation).
*   **Goal:** Ensure buttons click, forms submit (via static services), and links work.
*   **Result:** A functional app where elements snap instantly to new states without animation.

### 4. Asset Optimization Phase (The Performance)
Preparing heavy media for the web.
*   **Action:** Convert images to WebP/AVIF, compress videos, and set up Astro's `<Image />` component for lazy loading.
*   **Goal:** Ensure the site scores 100 on Lighthouse before adding animation overhead.
*   **Result:** A lightning-fast static site ready for motion.

### 5. Animation Phase (The "Life")
**This is where you add the "Before & After" and motion.**
Now that the structure is solid, you layer in the motion libraries (GSAP, Framer Motion, or CSS transitions).
*   **Entry Animations:** Hero text fades/slides in.
*   **Scroll Animations:** Elements trigger "Before & After" reveals or parallax as the user scrolls.
*   **Page Transitions:** Smoothing the jump between static HTML pages using View Transitions API.
*   **Micro-interactions:** Hover states, magnetic buttons, and cursor effects.
*   **Goal:** Make the static site feel organic and fluid.

### 6. Deployment Phase (The Release)
Pushing the final build to a static host.
*   **Action:** Run `astro build` and deploy to Netlify, Vercel, or Cloudflare Pages.
*   **Goal:** Serve the pre-rendered HTML/CSS/JS from a global CDN.

### Summary of the Corrected Flow

| Phase | Focus | State of Site |
| :--- | :--- | :--- |
| **Content** | Data (MDX) | Non-visual data files |
| **Structure** | HTML/CSS Grid | Rigid, responsive wireframe |
| **Logic** | JavaScript State | Functional but "snappy" |
| **Optimization** | Assets | Fast, ready for motion |
| **Animation** | **Motion (GSAP/CSS)** | **Fluid, "Before & After" reveals** |
| **Deploy** | Hosting | Live on CDN |

---
---

## Setup Steps

- Use Squash & Merge between branches

### 1. Initialize Astro Project, w/ TypeScript & Tailwind

```bash
# Creates a project with TypeScript and Tailwind CSS pre-configured
npm create astro@latest my-project -- --template with-tailwindcss --typescript strict

```
...

### 2. Setup Starwind UI
```bash
# Run the Starwind init command
pnpx starwind@latest init   
```
...

### 3. Add React
```bash
pnpm astro add react
```

Use it like this, but without SSR or anything server side
```tsx
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Counter from '../components/Counter';
---
<Layout title="Home">
  <h1 class="text-4xl font-bold">Hello Astro</h1>
  <!-- Hydrates only this component -->
  <Counter client:load />
</Layout>   
```

### 4. Astro-icons, astro fonts api, Astro View Transitions

- astro-icons: it is a 3rd party library that processes the Icon Packs' Packages which contain the datasource of all the icons in the icon packs, like `@iconify-json/tabler` package, which contains the code for svgs & icons of tabler icons pack from iconify. The Icons can be used from just these data source packages, but the astro-icon package simplifies a lot and processes them through:
    - auto svgo optimzation
    - auto sprite gen / dedup
    - has unified api for local & remote icons, `<Icon />` component
    - SSR & Bundle safety, (of which SSR does not affect GitHub Pages deployments)
    - Tree shaking to reduce unused things

AI Generated from using ^^^ this ^^^ as example 
- astro-fonts: it is a built-in API (native to Astro 6) that processes Font Providers which contain the datasource of all the fonts, like fontProviders.google() or local files, which contain the code for font files & variants. The Fonts can be used from just these providers, but the Astro Fonts API simplifies a lot and processes them through:
    - auto self-hosting & downloading (caches fonts locally during build)
    - auto optimized fallback generation (prevents layout shifts)
    - has unified api for local & remote providers, <Font /> component
    - auto preload hints & font-display: swap injection
    - privacy compliance (eliminates external calls to Google CDN) 


### 5. astro.config.mjs

- Use this example for astro config
```mjs
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  // REPLACE 'my-repo-name' with your actual GitHub repository name
  // If your repo is 'username.github.io', remove the 'base' line entirely.
  site: 'https://yourusername.github.io', 
  base: '/my-repo-name', 
  
  integrations: [
    tailwindcss(), // Note: In v4, this is often handled in vite.plugins, check Starwind config
    react(),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()], 
  }
});
```

---
---

## Features

### Projects Page (WIP)

- Searching

- Sorting

- Filter


---
---
---

# Astro Starter Kit: Basics

```sh
pnpm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
