
Modifications
- have the projects section on homepage have the projects list be horizontal instead of vertical for both project categories
- maybe get a more subtle & cohessive way to embed my resume

Additions
- use iconify for icons in the project.
- use the newly created DESIGN.md for design.
- explicitly tell me which things i need to replace & which are placeholders for me to fill with real info in a new file, this includes how i should handle envs & which envs i need to set where for github pages env to work
- add a way for me to easily add data for general things
- Add a straightforward way to import source data into the project, either from files in this repository or from other repositories in my GitHub account. The first method—using files from this repo—seems simplest, but being able to easily pull data from other repos would be more convenient. We need to figure out the best approach to make this process easy to set up, update, and maintain, so that manual data entry isn't required.
- add something subtle in the navbar that indicates this is AI generated or AI Assisted website

- Add a something to README.md of every project i want to have in this github pages portfolio's public projects group, and have AI create a Project name, Summary, Details, Architecture / Working Simple Diagram, Tech Stack used section, Link to its repo itself, Link to its public page (if available) 

<!-- Separate thing -->

- At the end of a project or even any different project that has a git repo & history, ask cursor & its AI to tell me what I've accomplished here by going to look into code, to put a 5 pointer with project name in my resume 
- if so, do i need to have 2 different repos for a project, like in many production practises, one for appli code & the other for deployment of appli code?? cuz this will be needed and allow me to keep sepparate project info, category-wise, in readmes in their repos which i can fetch from at gh-pages depploy time at once
- maybe i can have a project id LIKE, PROJ-DO-001-ALPHA, where its project, DO/BE for category, 00X for the number of tthat project & finnally the status of it ALPHA OR PROD or etc. this should only count & this process, starting from making the readme itself, be carried out for the projects i want public & on this as well, which will definitely not be all of my work or code 


<!-- ------------------------------------------------------------------------------------------ -->


Modifications
- Change the homepage Projects section to display project lists horizontally instead of vertically for both project categories.
- Find a more subtle and cohesive way to display/embed my resume.

Additions
- Integrate Iconify for all icons throughout the project.
- Reference and apply the visual and UX guidelines from the new DESIGN.md file. 
> [IMPORTANT] 
> !! HAVE CURSOR HELP ME GENERATE A `DESIGN.md` FILE !!
- Provide help in making a new DESIGN.md file that will descsribe how the portfolio should look like. Ask Several relevant questions for it.
> [NOTE] ^^ FOR AI ^^
- Provide clear documentation (in a new file) specifying exactly which values and sections are placeholders or need to be replaced with real information (e.g. personal data, links). Include details on managing required environment variables for both local development and GitHub Pages deployment.
- Implement a straightforward system to easily manage and update general purpose data (such as about info, contact, and highlights).
- Develop an easy and maintainable approach for importing and updating project/source data:
    - Primary: Use local files within this repo for adding project info.
    - Optional: Allow fetching project details from other repositories in my GitHub account, for convenience/updating.
    - Goal: Make setup, updating, and ongoing management as automated and low-maintenance as possible, minimizing manual data entry.
- Add a subtle label, badge, or marker in the navbar indicating the site was AI-generated/AI-assisted.

<!-- --- -->
- For every project included in the public 'Projects' section of this portfolio:
    - Add a section template in a new file to each project's README.md with all of the following, for me or AI to easily fill using the context of any of these projects' codebase:
      - Project Name
      - Summary
      - Details
      - Architecture or Simple Diagram
      - Tech Stack Used
      - Link to Project Repository
      - Link to Public Site (if available)
    - Ensure that this section is easy for scripts/automation to extract and display.

<!-- --- -->
- For any project in or to be included in GitHub Pages Portfolio (or any repository with a Git history), have Cursor (and its AI) automatically analyze the codebase, upon the completion of those respective projects, to help extract and suggest five concise bullet points (with the project's name) that can be included in my resume as another project. Have the name be the Project Repository's Name too.
- Consider whether it is best to use two separate repositories for a project, as is common in many professional setups — where one is for the application code and one for deployment-as-code. This separation makes it easier to keep project info organized by backend, devops or other category(ies), especially in README files of their repositories, which can then be automatically fetched and parsed for the GitHub Pages Portfolio deployment.
- Adopt a clear project ID convention, such as PROJ-DO-001-ALPHA, where "PROJ" indicates it’s a project, "DO"/"BE" indicates the category (e.g. DevOps, Backend), "00X" is a running project number, and "ALPHA"/"PROD" (or similar) indicates the project’s status. This convention should only be used for public projects to be featured on the portfolio, starting from their README creation as mentioned 1 point above. Use this process exclusively for selected, public-facing work, not for every project or code sample.


<!-- ------------------------------------------------------------------------------------------ -->


<!-- new copy paste based gen -->

Plan Overview

1. Project Summary and Goals
   - This project is a responsive personal portfolio website hosted via GitHub Pages.
   - Main goals:
     - Showcase selected projects in a categorized, easily browsable manner
     - Present clear, concise personal and professional information (About, Resume, Skills)
     - Deliver a modern, minimal, accessible, and maintainable UI/UX

2. Core Website Structure & Content
   - Homepage
     - Hero Section: Brief introduction, profile, call-to-action
     - Projects Section: 
       - Horizontally displayed lists of projects, split by categories (Backend Projects, DevOps Projects)
   - All Projects Page
     - Displays all projects in both categories
     - Each project shown as a card with a "View Details" action
   - Project Details Page
     - Project Name
     - Summary
     - Optional Project Preview
     - Architecture/Diagram
     - Detailed Description
     - Technologies Used
     - Links to public site and repository
   - About Me Page
     - Personal Summary
     - Skills List
     - Resume (integrated in a subtle, visually cohesive way, not just an in-page PDF embed)

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

6. AI and Metadata Improvements
   - Subtle badge or indicator in the navbar to show the site is AI-generated or AI-assisted
   - Addition and integration of: skills.md, agents.md, memory.md, design.md, and skills from skills.sh (as relevant)
   - Visual/UX guidelines strictly referenced from DESIGN.md for all components and layout aspects

7. Automation & Resume Integration
   - For any featured project:
     - Automate extraction of key project details from its README for portfolio display
     - AI can analyze a completed project’s codebase to generate 5 key summary bullet points for resume inclusion, using project name as in its repository
   - Adopt project ID conventions (e.g., PROJ-DO-001-ALPHA) for managing and referencing public portfolio projects; applied only to selected, public-facing work

// End of coherent plan
