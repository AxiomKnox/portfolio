# Modification

## Something

- are there even any env vars used here that warrants the use of Beasties, t3-env/oss-core or something else for env var / secrets mangement using 3rd party packages or even astro's built-in astro:env ??? isn't this a static site which wouldn't require that ?
- Clear up the design system from AI's consideration & just make a fixed design system before giving it to AI, or have searation of concerns & just ask AI, at a time, for just design system making and nothing else
  - Use the Vercel them from tweakcn for this and keep it pre-installed / pre-configured
- Fix the Dark Mode / Light Mode Toggle, when i open the preview link, after running pnpm preview, the toggle works but when i click on any link it stops working and always turns to dark mode if the toggle was in light mode before clicking any link. The toggle starts working again only when i hit refresh, and if it was set to light mode before clicking the link it would also return to light mode automatically after that single refresh by itself
- Fonts don't work in pnpm build preview version but works in pnpm dev version

## Incorrect Architecture
- This is supposed to be a static website, which is supposed to deployed on GitHub Pages, which means no Backend & no Node or compatible server and no server components

## Performance
- Fix Lighthouse problems

## Dark Mode

## Code Reuse
- Seems like code from previous versions, which was provided to reference was copied as it is with tailwindcss classes, cuz the navbar is still displaying the slightly delayed dark mode transition whenever toggled properly

## UI Design
- The Hero section is supposed to be like the supplementary refernce photo, with center title & 3 cards with the categories & desc within them

- The Cards on the homepage are only supposed to be 3 project cards in a single row, which are the featured projects i marked in their project.md, no more.

- Im thinking 

### Layouts & Structures of the Pages of the Webapp

- tell AI, "now focus on the layout & structure of the pages & project according to the 'description file' pay no mind to the current structure, you can following the skills for best design, animations, typpograpy & whatever while also making the structure the most fit to the description file as possible"

- Figure out what to do with the Related projects & its fields in content collection & sync script, as well as what is displayed & what it links & how

- make the Fonts & theming consistent across all components & starwindui component, like the fonts between the "project description" and "Project Properties" is not the same and it looks bad

- check, clean, fix, optimize all the changes i made manually without changing the functionality or purpose they solve much or at all

- make the Cards in Project, the properties & related ones translucent like the navbar too

- rewrite roject cards & its substituent componennts using starwindui components 

- change the color and translucent background of the Image previews in the project cards

- have subtly different colors or different levels of translucency for different sections on a page

- I changed the page-container css property to have the projects page have 2 sections, for heading & for project grid, so that i can have the stair step effect between them, fix that / make it properly & fix the issues that cause with other components

- can i use the query things that come after the `?q=` question mark in the seach bars or sometimes in other websites as well, for sorting, filter, searching, grouping & view switching?? if so, i would be able to use links to directly those filters & parameters in other places on portfolio too, can that be done?? later tho, not now... in phase 2 or 3 after launch / prod 

- dark mode / light mode logic stops working cuz the JS func is looking at localstorage for color-mode and updates it for every new page, it only runs once on initial page load, but we can fix it by using a event listener for `astro:beforeload` event for every softload, which will add the color pref & classes whenever the *route* changes
- use similar methods for anything with states, using `transition:persist`, which'll take current element along with any state attached to it, and transfer it over to the next page 
- only use these methods if they are the best solution for any problem, or ask me to choose from options

- can morph transition be used in any way in this project?? reply & consult to me before making changes

- reminder the astro version has changed from 6 to 7

## Review the Ouput Summary from AI here 👈👈 in Cursor


# Addition
- Maybe add Features in addition to Tech Stack as another section below the Tech Stack section, without any icons for items. like OAuth with SSO, Passkeys, CRDTs, SSR, something special or a feature, etc

- use bcrypt, isn't  there an option that does bcrypt which is more efficient when loading sites or something?

- Add Skills for
  - pnpm
  - astro
    - env
    - fonts
    - icons
    - images, pictures
    - content collections
    - animations & transitions 
  - starwindui
  - frontend design skill
  - react & react flow diagrams
  - animations skill, with tailwindcss, starwindui, astro view transitions, astroanimmate & motion
  - csp & security
  - performance
  - optimization, lighthouse, etc


