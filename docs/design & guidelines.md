
# Webapp Pages & Sections

## Homepage

### Hero Section

- Tag line / Full Name
- Personal Short Description
- What i do section, like something showing i do devops, backend/webapp now & Data Science / ML / MLOps

### Featured / Recent Projects Display Section

- A Carousel or Horizontal showcase of featured or most recent project, maybe limit it to 3
- favor recent or featured???

### Fetured / Recent Homepage Experience Section

- Make a horizontal rough timeline, left to right, old to new
- have 3 featured / recent experiences displayed in the same horizontal fashion, in invisible cards layout

---

## Projects Page

### Header Section

- a title
- description of the page
    - simple 12-15 word, no summary, just title & one line 

### Filter, Sorting, Searching Section
> !! DO NOT IMPLEMENT YET, IGNORE THIS AND MAKE EVERYTHING ELSE !!

- a dedicated selector for categories: all projects, devops, web, ml. 
    - On its own level / horizontal space, at the top, left aligned
- a filter dropdown, with subsection for properties. 
    - On its own level / horizontal space, all the filters & stuff, below search, on left side.
- a sorting option, for newest/oldest, title, status, etc. 
    - In line with its own level / horizontal space, all the filters & stuff, below search
    - which date to use for sorting newest & oldest tho?? 
      Option:
        - date started working on it, first commit
        - date added to portfolio
        - date of first working version
        - date completed v1 / prod version
        - date completed current version
    - use v1 / 1st prod version if release's date for projects that have prod status
    - use completed current version of release's date for projects that don't have prod status & are in alpha or dev status
- a view option, to change view from grid to list view
    - In line with its own level / horizontal space, all the filters & stuff, below search
    - the list view is just full page width version of project card, with preview or image appearing on the left side of full width list item
- a total projects count, which are visible currently, that fit the filters & category selected

- a search field 
    - it should have the searchable properties (project properties + content) visible in a dropdown view, with suggestions for project properties, like tech stack should have next.js, astro or similar tech based on whats used in all the projects.
    - There could also be suggestions for properties which already have their filters, but selecting them will just set the filter to that value, like showing date property with suggestions for 2022, 2023, etc, and selecting a suggestion in search dropdown would just set the date filter to it.
    - the syntax could also be used like prop:"value" and it would work or selecting

- new idea 28-02-26, 02:17, Use just icons at right hand side with tooltips & etc, for sorting, filter options, grouping?? (i dont think i should do this on client-side only code), views, no. of projects on screen, etc
- implement this like how Database Table or others in notion, have sort, filter, search, view, etc. NOT just the icons, but the functionalilty too. Change the UI & Feel tho, to suite my app & starwindui, vercel theme
    - maybe have search as the main focus tho, in the left side and dominant or 2/3rd of column size
    - Use this as a reference [["./Kole Jain - The 3 dashboard UI flaws that give away you've NEVER built one [Ksx9C2-3yMo - 1746x982 - 5m41s].png"]] 

### Projects Display Section

- display project cards, in count of 3s per row, with grid view or list view
- maybe have the list item of a project card show all the tech stack items, as there is space for that in that format

---

## Project Page

### Header Section

- show a preview of something or an image
- project id with category, status 🤷 undecided
- project title
- project summary
- github link & live site link (optional, if available, can be not available due to private repo)

### Project Details Section

- Project Description
    - on the left dominant side, meaning it has the greater space, like 2/3 columns or something
    - has the project desc displayed in markdown format / with formatting
- Project Properties 
    - on the right inferior side, meaning it has the lesser space, like 1/3 column or something, don't make it sticky
    - has the project properties listed in a Card
    - order of properties ... ?
- Project(s) Associated Sections
    - on the right inferior side, meaning it has the lesser space, like 1/3 column or something, don't make it sticky
    - it will have the project which are associated or uses this project in conjunction with each other, like for example a webapp and related devops project, which was used to deploy it, will have each other in their respective associated section
    - don't know about how it should look tho, maybe a bullet or icon with only the title & category of a project
- The project descriptions on the left & project properties on the right, with project associated still on the right & below properties same column & layout. Both properties & associated projects will be like attached to or on the same section as project description.

### Project Architecture Section

- Project Architecture Diagram
    - on the left dominant side, meaning it has the greater space, like 2/3 columns or something
    - An interactive diagram which will describe the layout, architecture & framework of how a project functions, it'll highlight the step on the you click. cuz of this interactivity it'll probably be made from code & not an img.
    - when you click the step on the diagram, the corrresponding stop on the steps list will also be highlighted & expanded, with static animation & transitions too

- Project Architecture Steps
    - on the right inferior side, meaning it has the lesser space, like 1/3 column or something, don't make it sticky
    - im thinking of making the steps list accordion style, like have the headline be the title of the step on accordion and the further details of that step will be visible when expanded. 
    - when you click a step on the steps list, the corresponding step on the diagram will also be highlighted with the step list item, with static animations & transitions too

---

## About Me Page

### Personal Description + Contacts & Links Section 

- Full Name
- Job Title / Previous or Working towards
- Current Location, Years of Experience, Highest Education
- Personal Description
- Links & Conteact me (no mobile number), like github, linkedin, other social media, email, etc
- My Photo or Avatar

### Personal Skills, Languages & Technologies Section 

- Heading
- Categorize / Group by category,
- Have icons besides the skills, languages & technologies
- definitely add skills, even though they are concepts & practice and not something we USE, they should definitely be here, even though with some generic icons (for each individual entity/item there should be an icon)
    - have these skiils, grouped by category, in a cards of their own for each category (3 categories)

### Personal Experience Section 

- Heading
- Job Title
- Company Name
- location of that workplace, even if remote, and not my working address
- small desciption / summary of what i accompplished there
- duration of work with that company

### Personal Certifications Section 

- Heading
- Certification Name & Icons, with links (🤷maybe) for verification, and pdf modal preview onclick

### Personal Resume Section 

- Heading
- Modal view of the resume

### Work Together Section

- Heading
- Words of Interest
- Get in Touch Email button

---

## Common Sections & Components

### Navbar

- Initials
- Full Name ??
- Home, Projects, About Me Page Links
- Dark Mode toggle
- AI Assisted tag

### Footer
- Words, Disclaimer, Copyright something, etc
- Links, like github, linkedin, other social media, email, etc

### Project Cards

- preview section
- preview id ??
- project category
- project title
- project summary
- project tech stack icons & names, only 3 while rest are in +3, +5, +N, format. 
    - 3 tech stack items should fit in one row, the other row should have the +N bit
- Animations to show hover state

---

## Other Components & Functions

### ThemeSwitcher Function / Component

- Background Image
- General Icons & Tech Icons
- Glassy / Acrylic like feel 

#### Icon Resolver Function

- This servers the use for resolving & returning the appropriate icon name or icon itself, using the mapping of tech names to icon name with icon packs.
- The mapping has primarily one icon pack which suites the website theming & has the broadest icon set. If an icon of a tech is not found in that pack, only then is another icon pack also added to the project & resolution mapping and repeat for every missing tech's icon in current selections of icon packs.
- The mapping are written manually tho
- It serves coloured icons for light mode & monochrome icons for dark mode, using css properties like `grayscale`, `sepia`, `hue-rotate`, `saturate`, etc
- Icon Packs
    - Devicon, devicon-plain, skill icon, simpleicon, svg logos
    - websites: thesvg.org, devicons.io

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

### How to setup project.md file & how sync works

### How to data / content is fetched at build-time & at run-time

- Store fresh data, per project, in short-lived local cache, which expires on a time limit or session

### What is the build process & tools, locally & in cicd 

### What is the tech stack & what is the purpose & reason for selecting these particular libs & frameworks

### What is the architecture of the webapp

- The app is made using astro, so it is mostly a Static Site Generator, without any backend & only functions as a static site web server, with React of interactive islands & motion for transitions & animations. This is good stack and static webapp is a requirement for github pages, which doesn't support Node Server or others & only has their proprietary static site web server, which does provide their domain & ssl.
- There are other libs & framework tools, such as astro-icons which processes & provides build-time icons, instead of run-time 3rd party icon fetch. Astro's Fonts API is used for the same build-time font packaging, similar to astro-icons

---
---

# Features

## Project Cards & Project Page

### Icons on light mode

- I want coloured icons on light mode & monochrome icons on dark mode, with the coloured icons being the original colours of those icons, according to their brandings
- Look up [".\docs\dump\brave logs\astro-icon usage.pdf"] for more regarding the usage of astro-icons & fallbacks & multiple icon packs as well as no remote link & only packages downloaded locally before build-time
--

- just use the most icons's library that has suitable taste to me and just use that icon packs prefix in the resolution script's manifest, example Next.js to nextjs. This is needed cuz i can't use the tech's name as icon name which may or may not resolve & if i use key map pair like this, i can map it over, along with the tech's name.
- then when encountering a icon error or non-resolution because that icon doesn't exist in the primary icon pack, i just add another and keep repeating
- in this case, will i have to make another resolver with its own mapping of tech name to icon & pack name and then use dark or light icon resolver according to the theme it is currently set as?? is this a good solution??
--

- or just use coloured icon versions and use css to convert them to monochrome for dark mode

---


## Project & Personal Content 

- Have the contents of this project be managed in a data file, which is generated using a function which aggregated this data from multiple sources & mutates it according to a format easily recognized & usable by code, for both the projects' data as well as personal data.
- The rest of the site remains static, but changes / morphs according to the data present in the data file, like adding project cards according to number & data, adding new pages for each project defined in the data file according to the standards that best suit astro, in native way, & this scenario as well, adding icons to tech stack items & filling the about me page with personal info, etc
- the function which does all this gathers all this data primarily from a projects.md file in every repo on github added to its config / setup to be added with permissions, for majority of the projects' content & architecture files, which has architecture diagram & its step with description (Not implemented). The personal content is fetched from a separate single repo, which will have a file named <undecided>.md, which will have all the contents for personal content && about me, etc
- the architecture diagram & steps bit has not been thought through fully yet, but the current plan is to use React Flow library & some of its companion or supplementary libs for making a reactive & animated architecture diagram / flow diagram which you can interact with to show details about that node / step. The steps will all be listed on the right hand side in the same column, column width & sizing as the project properties & it'll have all the steps in an accordion list which will expand on clicking it while also lighting / higlighting the corresponding step / node on the diagram and vise versa. These are the current thoughts, have to think through the implementation tho.
- AI can suggest changes, additions or even rewrites or different implementations for this content function, but it must go through me

---
---

# Tips

## Sections

- Every section needs to be a things of its own & it should be indicated in subtle ways in ui, background, icons & typography. Don't make these section a small thing, they are not meant to be small, like making section as cards or one of 2 or one of three columns with loew height are not good and should be avoided

## UI

- Don't make everything into a card, unless explicitly stated or if it is a best or good choice, which is not always a good choice
- Don't have experience, certifications & resume in a card they are separate disstinct section with large relevant contents of their own