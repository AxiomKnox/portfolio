
todos
- [x] Collect all the fragmented data, ONLY to get the ideas from previous projects & NOT the layout or structure or any code from them

- pick some of the boilerplate or showcased examples from the site to use with the portfolio components https://starwind.dev/docs/components/

    - Aspect Ratio (for Project Cards)
    - Badge (for category & things above the project details page)
    - Breadcrumbs?
    - Button
    - Button Group?
    - Card
    - Carousel (for the projects & whatever showcase)
    - Image
    - Image?? (for the preview or background of top project page behind project name thingy /hero sectiony)
    - Input Group (for search on projects page)
    - Item (for list view for projects page, from the default grid view)
    - Pagination (on Projects Page??)
    - Progress (for loading states, but maybe not required for static webapp)
    - Prose (for Markdown on project details page)
    - RadioGroup??
    - Select?? with Multi Select & Search (Combobox)?? (for filter & sort on projects page)
    - Separator
    - Skeleton
    - Spinner
    - Table??
    - Tabs (for Categories, which will remain above the filters)
    - ThemeToggle (use from this [link](https://pro.starwind.dev/components/theme-switcher/theme-switcher-02/))
    - Tooltip (for other purpose as well, but the first thought was list of tools used on hover of AI Assisted tag)

- make the README Template better & more clear with missing points

- do it like the blog image

- add more skills

- Use this vercel theme from `tweakcn.com`, along with some modifications from AI or me. This was added because of some **Design System** talks on `bolt.new`. I can adjust it more on tweakcn site if i want to.
```shell
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/vercel.json
```
- this is also good, 'https://shadcncraft.com/'


- working on the search functionality & components

---
---
---

dump

# Design & Guideline
- Raw: 
    1. Project Summary and Goals
    - This project is a responsive personal portfolio website hosted via GitHub Pages.
    - Main goals:
        - Showcase selected projects in a categorized, easily browsable manner
        - Present clear, concise personal and professional information (About, Resume, Skills)
        - Deliver a modern, minimal, accessible, and maintainable UI/UX

    3. Design System & Technical Details
    - Use defined Color Scheme, Typography, and component standards (see DESIGN.md for specifics)
    - Technologies: Bun, Vite, React, TypeScript, TailwindCSS, shadcn, Iconify for all icons
    - Minimal, dark-themed, highly responsive and accessible; performance-oriented

    4. General & Project Data Management
    - Set up an easy and maintainable system for managing general site data (about, contact, highlights)
    - Projects data to be sourced primarily from local files in-repo; optionally, with simple automation for pulling from other GitHub repositories as needed
    - Each public project’s README.md should include extractable info blocks: Name, Summary, Details, Architecture/Diagram, Tech Stack, Repo link, Public site link

    5. Placeholder Documentation and Env Variables
    - Maintain a clear documentation file specifying all placeholders (what/where to replace with your real info: e.g., personal information, URLs, secrets)
    - Explicit documentation of required environment variables for both local dev and GitHub Pages deployment, with clear instructions
---

# Dev Setup

- Raw: change lint, format & typecheck scripts to latest version instead of eslint, prettier & tsc check
- Raw: Reduce the number of packages used & remove unnecessary ones
- Modified: Update all the packages used to latest stable version, which are compatible with each other
- Add & use typescript in Astro
```json
{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "strict": true,
    "jsx": "preserve"
  }
}   
```

- Raw: 
    - Using .astro files instead of tsx files, fully converting to a native astro app
    - Using astro's file based routing instead of React Router Dom and It's BrowserRouter & HashRouter

- Raw: 
    - Prepackage Fonts & Icons, solve for Astro & Vite standalone
        - Use woff2 in `public/fonts` with `@font-face` in the css file, Or
        - Use Astro's expreimental fonts API, in `fonts` section in `astro.config.mjs` 

- Raw:
    - Handling of `vite.config.ts` or `astro.config.mjs` 
        - Handling of Site URL & Base path for GitHub Pages

- Raw: The GH Pages Portfolio can include the portfolio projects repo itself too (Just say this page on its live project button)
---

# Pre-Build

- take a look at the sync script code
---

# Project.md template

- Misc: Add an inputs & setup section in EVERY projects' README, which should state what it requires to perform as intended, including Env Vars, Files, Models, Info, etc. Anything.

- Modified: For any project to be added to GitHub Pages Portfolio have Cursor, or other AI, automatically analyze the codebase, on the completion of those projects, meaning they reach 1st working state (before prod), to help extract and suggest five concise bullet points (with the project's name) that can be included in my resume as another project. Have the name be the Project Repository's Name as well.

- Raw: Adopt a clear project ID convention, such as PROJ-DO-001-ALPHA, where "PROJ" indicates it’s a project, "DO"/"BE" indicates the category (e.g. DevOps, Backend), "00X" is a running project number, and "ALPHA"/"PROD" (or similar) indicates the project’s status. This convention should only be used for public projects to be featured on the portfolio, starting from their README creation as mentioned 1 point above. Use this process exclusively for selected, public-facing work, not for every project or code sample.
    - Solution: PROJ-AA-000-ALPHA, Proj with shorthand for project categories, the number of the project out of all project on portfolio and status of them. But, this makes it difficult, cuz i have to manually update the status after stage promotion, so, ill probably remove that.
---

# Project webpages design & layout

- Raw: have the project details section render in markdown & also switch to writing project description / details in GitHub in markdown 

- Infered: Roll you own filtering & Sorting & searching

- Debug/Fix: Fix the Architecture diagrma to work properly, have it displaying in the correct area & have a proper logic for fetching the code / file for it, which is separate from project.md.

- Raw: change the color based on project category on project id, BE - Blue, DO - Purple, ML - Orange

- Modified: what about using local storage for refresh option on project page which fetches new data if public repo from that repo and displays it, just for you??

- light house report diagnosis & improvements
---

# Out of scope
- Misc:
    > Just an Idea
    - What if I used WASM, to make my college project, which is a python exe which uses a model using local file access, & similar exe or non-web project but which have a UI into something that can be run in the browser & i can put in as a webpage for my github portfolio
    - Problem is, this will just work for project that HAVE a UI AND are NOT web project, this will not work for backend projects which do not have a UI. Will this be worth it for, currently, only one such non-web UI project?? 
    - I will also NEED to move from local file access for model inference to serving it from somewhere managed by me OR host it in a Cloud which provides hosting for custom models with inference.
    - Ask AI
    - can i have an exe run in a browser using wasm or better tech
    - i have access to source code, but its a python app 
    - this project also uses a model to inference from locally, where the model is accessed using local file access

    > End of Idea

- Raw: Consider whether it is best to use two separate repositories for a project, as is common in many professional setups — where one is for the application code and one for deployment-as-code. This separation makes it easier to keep project info organized by backend, devops or other category(ies), especially in README files of their repositories, which can then be automatically fetched and parsed for the GitHub Pages Portfolio deployment.

