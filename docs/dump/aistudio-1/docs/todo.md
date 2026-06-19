- have the project details section render in markdown & also switch to writing project description / details in GitHub in markdown 

#### Icon Handling
- implement multiple fallbacks for icons, in a way no icon is missed
    - is there no way for me to use any 'skill' name & have the icon be the closest match as possible to what I write, like I would write jupyter notebooks and it would appropriately match the icon for jupyter or whatever the icon name is in iconify or the multitude of icon packs or whatever??? or is there only the way of me writing compatible name by manually looking up??
    - Also, is there a wildcard for the icon pack, like first come first serve or most used pack used automatically, instead of me having use a single pack, like material design, and then manually go look up another icon pack if icon doesn't load or something breaks?? I just need the easiest, simple & convenient way for me to get correct icons & reliable get icons from my skills written in GitHub project READMEs
    - the icons i want should also have original colorway available somehow, in form of a filter / property i put or whatever 
    - the icons should have the original colorway of icon only in light mode, keep the dark mode icons as they are, if possible. Tell me if doing this is possible & ill decide the next decision
    - should i add icons in codebase as files so perf is not wasted on fetching them?? but then ill have to manually go find & put it in the codebase every *unique* entry in tech stack between all projects 
***
"Implement a robust icon resolution system that uses a priority-ordered fallback chain across multiple Iconify sets across iconify. If a specific match isn't found even after fallback icons packs across iconify, the logic should gracefully degrade to a generic 'code' or 'tech' placeholder to ensure no entry is left iconless."

"I want, In Light Mode, icons should display their 'original colorway' (multi-color brand assets). In Dark Mode, apply a CSS filter (e.g., grayscale(1) brightness(1.5) or whatever) or a specific property / way to render the icons in a the current way / style. The transition must be seamless and driven by a global theme state or something."

- You can use any icon without knowing its exact name or prefix.
- The system automatically fetches the correct icon from the largest and most reliable Iconify packs.
- If an icon isn't found in the first pack, it falls back to the next (e.g., try mdi:home, then ph:home, then tabler:home).
- Icons are themable (color changed via CSS) while preserving the ability to use original colors when needed. 
    - In dark mode: Use monotone icons (like mdi:home) recolored to fit your dark theme via CSS color. 
    - In light mode: Use multi-color icons (like brand logos, emojis) with their original, hardcoded colors intact. 

"Use Zustand wherever possible, like the theme, icons' settings, etc. Ensure the state is shared and synchronized across all pages so that user preferences are maintained during navigation. And add other possible improvements"
***

---
- Reduce the number of packages used & remove unnecessary ones
- remove unnecessary things
    - list them here
    - is gemini/genai lib really needed right now??
- convert portfolio stack to typescript, react, tailwindcss, & shadcn (with biome, iconify, suitable types, bun & vite)
- bring everything (packages) up to date, updated
- the architecture diagram doesn't work properly & doesn't go where it is supposed to, it goes to where the preview is somewhat supposed to
- Add Architecture Diagram & Details
    - Use a Mermaid Diagram Script or custom html with JS or something else that is interactable in the architecture section
        - try mermaid diagram files in project repos which are fetched with gh-actions, with interactable steps & parts that are highlighted / focused on hover and show info about that step on hover as well
        - have the mermaid diagram blend into the theme & aesthetics of the website, minimal, black, professional, use either built-in or custom theme / css
    - Add details to each steps of the architectutre
        - Have the info pop-up on hover
        - Have the info on the side of the diagram 
            - Also have it highlight or indicate on hover, the step in diagram and/or step in detail, both should be highlighted / indicated / etc on hover on either of them, e.g. 1st square hover highlights the square and the 1st step desc on the side
- Add Animations to things where they are good / supposed to be there
- add animations to more stuff & make it more consistent throughout

---
- keep the 3 best ones of projects in the about me section
- keep the 3 most recent ones of projects in the home page
    - if im adding an additiona date field, what more fields could / should i add, If any?? 
OR
- add the project category selector on the homepage with selected (latest) projects & save featured projects for about me
    - a worry that there will be a duplication of project category selector from homepage & All projects page

---
- change the color based on project category on project id, BE - Blue, DO - Purple, ML - Orange

---
- should i add a filter on the all projects section for properties of a project, aside from category like backend, which would be for like tech used, date/year, etc
- add sorting too, with default sorting based on the 001 part of project id, PROJ-BE-001-ALPHA

---
- resolve all the refresh issues
    - causes some parts to stay black on light mode & vice versa
    - causes some artifacting on navbar too, along with the icons & text



### Partially Completed
- arrange project categories in a way that shows im 1st interested in devops then backend then ML
    - Solution: just add it in the Home Page & About me, describing as such
- [x] make glass like ui + whatever this style is of new 02-05-26 stitch proto
- [x] Add these color gradient background things which are barely visible but definitely noticeable, like in the stitch proto, but in dark mode too
    - Add Starry night sky type background, pure starry things, not a photo of night, in dark mode
- [x] fix the group hovering on homepage - Confirmation Pending



### Completed
- [x] i think i should remove the version indicator from cards & only show it on project page
- [x] fix the group hovering on homepage
- [x] make a white / light mode too
- [x] I very much like the card ui look of projects of stitch proto homepage


----------------------------------------------------------------------------------------------------------------------------

## Stuff for me
- Make a docker image and autobuild it to ghcr, then pull locally to use for testing
    - Mount `projects-config.json` to container, keep a default one and have it overridable OR just don't have it as a file & make it not function without it


- figure out a way so that I don't have to write repo link & live link at the bottom of the READMEs
- remove all the UI engineering stuff

- add version in project page too
    - find a way to manage the version in codebase & fetch it in gh-pages
        - use github-releases / docker image to ghcr of repo with correct version??
- have a consistent way to get the *version* of a project, maybe have a GitHub release of a project & have the portfolio fetch that?? idk

- Make my data or "personal info & global settings", which is in src/data.ts, also be fetched from my 'special repository' that renders the contents of README in that repo on github public profile, either from the README.md itself or a separate .md file in that repo, mysteryman11 repo
- have the personal info about me, like initials, name, skills, languages, etc be in my mysteryman11 repo on GitHub, with a different README under PORTFOLIO.md or Portfolio/README.md

- do u think i need to change the project ids to a different format that indicates a date, like instead of -001- i use -240726-. Im pondering this because another prototype generated by stitch google, showed the year of making that. I dont know if i were to add date indicators, should use a the project id for it OR should i just add a property / additional field in project README for portfolio to fetch & display on the project page


----------------------------------------------------------------------------------------------------------------------------


## After All of this / Future Work
- enhance 
- simplify
- optimize