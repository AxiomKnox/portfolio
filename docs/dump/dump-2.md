# Portfolio Thoughts

a portfolio webapp with homepage, projects (all) page, project (details) page and about me page,
- homepage has a hero section and a recent projects section, with project cards
- projects (all) page has all the projects in a grid view, with project cards, with category filter for "devops", "backend" & "machine learning" categories, sorting & filtering based on project properties
- project (details) page has preview/header section with project name, above it project id & category, project summary section, project details section with project's properties, like date, tech stack used, version, status (prod, alpha, dev, etc), etc on the side, an architecture diagram section with steps & each diagram step explanation list-wise. Use Typography shadcn component for project details only, for full markdown support.
- About me page
- Project Card component, wherever it goes, will have a 'preview' image of that project, the same one that goes on project (details) page, whether available or random design placeholder, with project id, category, then project title, then tech stack used (only top 3 visible) with an indicator of how many total tech used
- tech stacks wherever shuold look the same, meaning across pages & sections, and also have icons, monochrome & suitable for dark mode and original icon colors on light mode
- professional dark mode with beautiful subtle background gradient colors for light mode


---
---

for functionality, 
- use a sync or fetch function, outside or inside the webapp, to store in a json or similar structure data file
	- 07-06-26 05:01 Latest out of currently present, instead of having one or the other, how about both, keep the sync function, maybe modified or not, but also have a refresh function that fetches, processes & saves data on client-side, on individual project or projects page, so that it doesn't do all projects at once everytime or all data, including site data, at once, everytime?? 
- use that data when loading the pages for webapp
- decide on an icon system, astro-icon or iconify-react
- use suspense or something, on the first page load or whenever this happens, so that the page appears with intended font & icons instead of loading them on the go??

---
---


- renaming backend to webapp or application, this is because ill be able to add more projects here, like the portfolio itself as a project
- adding a misc category
	- to put some things that don't fit in these categories, is smaller, isn't devops centric (cuz I'm mainly focusing on devops), but still wanted to add to portfolio (I don't think its necessary but still
- considering combinations of categories like, devops pipeline with a backend project for example

- is there a better way to get these content?? like using github's sdk or something, or should i not touch it since its working just fine?? "don't fix what ain't broke"?
- can this script handle private github repos??	

- what about just fetching markdown files as they are into a content folder, and have astro-content pick them up automatically?? another working mechanism, which will turn this sync script into just fetch & place the project.md files as they are in a folder and let the astro-content & content collection thing manage that by themselves????
youtube.com/watch?v=T9PQ05F9GEk
youtube.com/watch?v=wgIYciR0hvk

---
---
---

# Content Handling

don't try cloudflare workers thing, cuz just switching to client-side fetching, processing & storing refresh data in localstore or something similar

---
---
---

# Misc

- use astro:env in portfolio & Astro project, use t3-oss/t3-env in other non-Astro projects
- checkout some ideas from another portfolio - youtube.com/watch?v=N2VdU_FIHq4

---
---

- Move all the folders GitHub pages portfolio tests & sub projects into branches of the GitHub repo & worktrees on local device
- Have an instruction somewhere for AI that, with every run, the AI will record the time & date, what it did in short, how much it cost (if possible) & future tips or guidance or todos (if any)
- I think I need to give the code to cursor AI, but tell it to rebuild it completely from scratch for Astro, with the following stack
	- Bun/Pnpm, Vite, Astro, TypeScript, TailwindCSS, React, ShadCN, astro-icons
	- Considerations, 
		- astro-font & @gamesome/astro-font, for fonts with Astro, similar to astro-icons, Icons for Astro
