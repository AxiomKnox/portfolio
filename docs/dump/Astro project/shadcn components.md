noteworthy shadcn components
- Aspect Ratio (Project Card, Resume Section)
- Badge
- Breadcrumbs (debatable?)
- Button
- Card
- Carousel
- Collapsable 
- Combobox
- Date Picker (for filters?)
- Item (for tech stacks?)
- Native Select (?for filters?)
- Pagination (for on All projects page)
- Popover (for filters?)
- Scroll Area
- Select (Alternative to Native Select)
- Separator
- Skeleton
- Typography (for formatted text in project desc)


---

- Add more properties
    - Amend the Project.md format file, i have to write for each project to have these properties field as well
- Add filters & sorting based on those properties

- Remove DP section & put resume over there with same ratio, and onclick of fullscreen icon somewhere takes u to fullscreen popup on same screen

---
---
---

- which router do i use for best fit with current project state??
    - react router dom
    - astro file-based router
- which method lets me keep the feature of astro, hydration & interactive islands 
    - maybe adding the `client: load` directive on react components can make them hydratable(?), but i think i will have to make `.astro` files for each page then. I mean it doesn't say that, but just an intuition. also sleep deprieved.
    > Integration: Import and use these .tsx components inside your .astro files. Add a client directive (e.g., client:load) to "hydrate" them and make them interactive on the client-side. 

| Feature                      | GitHub Pages Compatibility | Required Configuration                                    |
|:---------------------------- |:-------------------------- |:--------------------------------------------------------- |
| **Standard React Router**    | ✅ Yes                     | Use `HashRouter` OR implement a `404.html` redirect hack. |
| **React Router v7 (SSR)**    | ❌ No                      | Cannot run server-side code.                              |
| **React Router v7 (Static)** | ✅ Yes                     | Enable `prerender` in config; disable SSR.                |
| **Vite Build Tool**          | ✅ Yes                     | Set `base` in `vite.config.js` to your repo name.         |

---
---
---