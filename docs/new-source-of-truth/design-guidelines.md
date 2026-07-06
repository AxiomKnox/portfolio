# Webapp Pages & Sections

## Homepage

### Hero Section

* Tagline / full name
* Short personal description
* “What I do” section, showing that I do DevOps, backend/web app work, and data science / ML / MLOps

### Featured / Recent Projects Section

* A carousel or horizontal showcase of featured or recent projects, limited to 3 if needed
* Decide whether to favor recent or featured projects

### Featured / Recent Experience Section

* A horizontal timeline from left to right, ordered from older to newer
* Show 3 featured or recent experiences in the same horizontal style, using invisible card layouts

---

## Projects Page

### Header Section

* A title
* A short page description

  * Simple 12–15 words, no summary, just a title and one line

### Filter, Sorting, and Searching Section

> !! DO NOT IMPLEMENT YET, IGNORE THIS AND MAKE EVERYTHING ELSE !!

* A dedicated selector for categories: all projects, devops, web, ml

  * On its own row / horizontal space, aligned to the top left

* A filter dropdown with subsections for different properties

  * On its own row / horizontal space, with all filters below search on the left side

* A sorting option for newest / oldest, title, status, etc.

  * On its own row / horizontal space, aligned with the other filters below search
  * Which date should be used for newest / oldest sorting?

    * Date started working on it / first commit
    * Date added to portfolio
    * Date of first working version
    * Date completed v1 / production version
    * Date completed current version
  * Use the v1 / first production version date for projects that have prod status
  * Use the completed current version release date for projects that do not have prod status and are in alpha or dev status

* A view option to switch between grid view and list view

  * On its own row / horizontal space, aligned with the other filters below search
  * List view should be a full-width version of the project card, with the preview or image on the left side

* A total project count showing how many projects are currently visible after filters and category selection

* A search field

  * It should show searchable properties in a dropdown view, including project properties and content
  * It should offer suggestions for properties, such as tech stack values like next.js, astro, or similar technologies based on what is used across all projects
  * It should also suggest properties that already have filters, but selecting them should simply set the filter value, such as showing date suggestions like 2022, 2023, etc.
  * The search syntax could also support `prop:"value"` and work through selection

* New idea 28-02-26, 02:17: Use icons only on the right-hand side with tooltips, etc., for sorting, filter options, grouping, and so on

  * I do not think I should do this using client-side-only code

* Implement this like a database table or other Notion-style UI: sort, filter, search, view, etc. Not just the icons, but the functionality too

* Change the UI and feel to suit my app and the Starwind UI / Vercel theme

  * Maybe make search the main focus on the left side and give it 2/3 of the column width
  * Use this as a reference: `[["./Kole Jain - The 3 dashboard UI flaws that give away you've NEVER built one [Ksx9C2-3yMo - 1746x982 - 5m41s].png"]]`

### Projects Display Section

* Display project cards, 3 per row, in either grid view or list view
* In list view, the project card can show all tech stack items, since there is enough space for them

---

## Project Page

### Header Section

* Show a preview or image
* Project ID with category and status, though status is still undecided
* Project title
* Project summary
* GitHub link and live site link if available, and optional if the repo is private

### Project Details Section

* Project Description

  * On the left side, with greater space, such as 2/3 of the columns
  * Show the project description in markdown format with formatting
  * use the typography or prose component for this
* Project Properties

  * On the right side, with less space, such as 1/3 of the columns, and do not make it sticky
  * Show project properties inside a card
  * Order of properties is still undecided
* Project(s) Associated Section

  * On the right side, below properties, using the same 1/3 column layout and not sticky
  * Show projects that are associated with or used alongside this project, such as a web app and the related DevOps project used to deploy it, which would appear in each other’s associated sections
  * Not sure how it should look yet, maybe as a bullet list or icon list with only the title and category of each project
* The project description on the left, and project properties plus associated projects on the right, should all feel attached to the same section

### Project Architecture Section

* Project Architecture Diagram

  * On the left side, with greater space, such as 2/3 of the columns
  * An interactive diagram describing the layout, architecture, and framework of how a project works
  * Clicking a step should highlight it
  * Because of the interactivity, it will probably be built in code rather than as an image
  * When a step on the diagram is clicked, the corresponding step in the steps list should also be highlighted and expanded, with static animation and transitions
* Project Architecture Steps

  * On the right side, with less space, such as 1/3 of the columns, and do not make it sticky
  * The steps list should probably be accordion-style, where the step title is the accordion header and the details are visible when expanded
  * When a step on the list is clicked, the corresponding step on the diagram should also be highlighted, with static animations and transitions

---

## About Me Page

### Personal Description + Contacts & Links Section

* Full name
* Job title / previous role / role I am working toward
* Current location, years of experience, and highest education
* Personal description
* Links and contact options, excluding mobile number, such as GitHub, LinkedIn, other social media, email, etc.
* My photo or avatar

### Personal Skills, Languages, and Technologies Section

* Heading
* Group items by category
* Show icons beside the skills, languages, and technologies
* Definitely include skills, even though they are concepts and practice rather than tools we directly use; they should still be present, even if they use generic icons

  * Each item should have its own icon
* Put these skills into separate cards for each of the 3 categories

### Personal Experience Section

* Heading
* Job title
* Company name
* Workplace location, even if remote, but not the working address
* Short description or summary of what I accomplished there
* Duration of employment with that company

### Personal Certifications Section

* Heading
* Certification name and icons, with verification links if needed, and PDF modal preview on click

### Personal Resume Section

* Heading
* Modal view of the resume

### Work Together Section

* Heading
* Words of interest
* Get in touch email button

---

## Common Sections & Components

### Navbar

* Initials
* Full name, maybe
* Home, Projects, and About Me links
* Dark mode toggle
* AI-assisted tag

### Footer

* Words, disclaimer, copyright text, etc.
* Links such as GitHub, LinkedIn, other social media, and email

### Project Cards

* Preview section
* Preview ID, maybe
* Project category
* Project title
* Project summary
* Project tech stack icons and names, with only 3 visible while the rest are shown as `+3`, `+5`, `+N`, etc.

  * 3 tech stack items should fit on one row, and the other row should contain the `+N` indicator
* Hover animations

---

## Other Components & Functions

### ThemeSwitcher Function / Component

* Background image
* General icons and tech icons
* Glassy / acrylic-like feel

### Icon Resolver Function

* This is used to resolve and return the appropriate icon name or icon itself, using a mapping from tech names to icon names from icon packs
* The mapping should primarily use one icon pack that suits the website’s theme and has the broadest icon set
* If an icon is not found in that primary pack, then another icon pack should be added to the project and the resolution mapping should be repeated for every missing tech icon in the current icon pack selection
* The mappings are written manually
* It should serve colored icons in light mode and monochrome icons in dark mode, using CSS properties such as `grayscale`, `sepia`, `hue-rotate`, and `saturate`
* Icon packs:

  * Devicon, devicon-plain, skill icon, simpleicon, SVG logos
  * Websites: thesvg.org, devicons.io

---

## Additional Sections Discussion

---

---

# Files

## Design.md

---

## Agent.md

---

## Documentation

---

### How to set up the project.md file and how sync works

### How data / content is fetched at build time and at run time

* Store fresh data per project in a short-lived local cache that expires after a time limit or session

### What the build process is and which tools are used locally and in CI/CD

### What the tech stack is, and why these particular libraries and frameworks were selected

### What the architecture of the web app is

* The app is made with Astro, so it is mostly a static site generator without a backend, using React for interactive islands and motion for transitions and animations
* This is a good stack, and a static web app is required for GitHub Pages, which does not support a Node server or similar and only provides its own static web server, which also provides its domain and SSL
* There are other libraries and framework tools, such as astro-icons, which provide build-time icons instead of fetching third-party icons at runtime
* Astro’s Fonts API is used for the same reason, providing build-time font packaging similar to astro-icons

---

---

# Features

## Project Cards & Project Page

### Icons in light mode

* I want colored icons in light mode and monochrome icons in dark mode, with the colored icons using the original brand colors of those icons
* Look up `[ ".\\docs\\dump\\brave logs\\astro-icon usage.pdf" ]` for more details on astro-icons usage, fallbacks, multiple icon packs, and avoiding remote links by downloading packages locally before build time
* Just use the icon library that best fits my taste and use that icon pack’s prefix in the resolution script’s manifest, for example Next.js to `nextjs`
* This is needed because I cannot use the tech name directly as the icon name, since it may or may not resolve, and if I use a key-value mapping like this, I can map it over along with the tech name
* Then, when an icon error or resolution failure occurs because an icon does not exist in the primary icon pack, I can add another pack and keep repeating the process
* In this case, would I need another resolver with its own mapping of tech name to icon and pack name, and then use the dark or light icon resolver according to the current theme?
* Is that a good solution?
* Or should I just use colored icon versions and use CSS to convert them to monochrome in dark mode?

---

## Project & Personal Content

* Keep the content of this project in a data file that is generated by a function which aggregates the data from multiple sources and mutates it into a format that is easy for code to recognize and use, both for the projects’ data and the personal data
* The rest of the site should remain static, but change or morph according to the data in that file, such as adding project cards based on the number and data available, creating new pages for each project defined in the data file according to the standards that best suit Astro natively, and filling the About Me page with personal information, icons for tech stack items, and so on
* The function that does all this should gather data primarily from a `projects.md` file in every repo added to its configuration or setup with permissions, for most of the projects’ content and architecture files, which include the architecture diagram and steps with descriptions, though this is not implemented yet
* The personal content should come from a separate single repo, which will contain a file named `<undecided>.md` and will hold all personal content and About Me information
* The architecture diagram and steps part has not been fully thought through yet, but the current plan is to use React Flow and some of its companion or supplementary libraries to make a reactive and animated architecture or flow diagram that can be interacted with to show details for each node or step
* The steps would be listed on the right-hand side in the same column width as the project properties, with all the steps in an accordion list that expands when clicked while also highlighting the corresponding step or node on the diagram, and vice versa
* These are the current thoughts; the implementation still needs to be worked out
* AI can suggest changes, additions, rewrites, or different implementations for this content function, but it must go through me first

---

## Tips

### Sections

* Every section should feel like its own distinct element and should be indicated subtly through UI, background, icons, and typography
* Do not make sections feel small; they are meant to be substantial
* Avoid making sections into cards or short-height multi-column blocks unless that is explicitly stated or truly the best choice

### UI

* Do not make everything into a card unless explicitly stated or unless it is genuinely the best choice, which is not always the case
* Do not put experience, certifications, or resume inside cards; they are separate, distinct sections with large relevant content of their ownInput Data
