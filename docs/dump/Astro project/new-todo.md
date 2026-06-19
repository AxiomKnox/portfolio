# General Design, Structure and Layout

## Project Configuration

- Handling of `vite.config.ts` or `astro.config.mjs` 
  - Handling of Site URL & Base path for GitHub Pages

---

## Project Content Configuration

- Use a project config, like now, for configuring which repos from which user to take for display at runtime (of the sync script)
- Use the repo's [Project.md](http://Project.md) file for text content & Architecture.png file for diagram content
- The GH Pages Portfolio can include the portfolio projects repo itself too (Just say this page on its live project button)
- How about instead of having a sync function run before every build of portfolio & having the content hardcoded, it just runs refresh set time period or have a button for refresh, which will run a client side function instead of essentially hardcoding it every build / github actions run. 
  - Although there is the question of stale content, meaning new or changed content after a build has already been deployed, can I have it just sync new content & send it back to server side to replace the stale content?? what are the security concerns I have to face if i do that?? won't anything be able to send anything back, or even discover the sync function & how it works to manipulate it to send unsafe code back to replace stale content??
  - what about using local storage instead, and having the stale content just as a fallback?? or even have it run every site load or every site load after 1 month or something?? It'll create a problem of persistence across session, but i'll have to accept the tradeoff for convinience i guess??
  - Maybe I can use Hono JS for this, this whole idea came from Hono JS itself, when i was looking it up & from the video

---

# Project Design

- Using .astro files instead of tsx files, fully converting to a native astro app
- Using astro's file based routing instead of React Router Dom and It's BrowserRouter & HashRouter
- Using astro-icon for icons from iconfiy library
- Using Motion for components AND Page animation / transition, ensuring the transition between pages remain smooth
  - Unconfirmed Tip, use motion for intro animation for pages & use astro's native transition for broader movements between pages, which do u think is better, this or something else??
- 

---

## Project Code

- Use this tech stack fully
  - Bun, Vite, Astro(?), TypeScript, TailwindCSS, React, ShadCN, Motion, astro-icon

---

## Project Display

- Use markdown render or something for the Project Details section on the Project Page

---

- what is wrong or not ideal or not perfect in my codebase, including folder structure, file naming, file structure, actual code, implementation & design for … use case??

---

---

---

# Problems

...

---

---

---

# Additions

...

---

---

---

# Modifications

...

---

---

---

# ToDos

...

---

---

---

# Ideas

- Prepackage Fonts & Icons, solve for Astro & Vite standalone
  - Use woff2 in `public/fonts` with `@font-face` in the css file, Or
  - Use Astro's expreimental fonts API, in `fonts` section in `astro.config.mjs` 

---

---

---

# Locations

- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Bun\Vite\src\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Bun\Vite\Astro\docs\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\BunCursor-Gen\vite-app-2\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Gemini AI Studio\sophisticated-dark-portfolio\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Gemini AI Studio\sophisticated-dark-portfolio-1\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Gemini AI Studio\sophisticated-dark-portfolio-2\
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\v0-gen
- D:\1_progg\2_Projects\2_Tests\GitHub Pages Potfolio\Vite+
- Signal
- Notepad
- Sticky Notes on Desktop

