The Aggregated data should follow this schema or equivalent json schema

This is the data schema that is contains the data from all files that go on dist & deployed
This is not the schema or layout of any file on github repo or any data source,
This is the final data that exists after all aggregation, they just describe themselves & their sources

Projects.md / Project.json

# Project Name
[Name of Project]
*Project.md*
...

# Project Id
[PROJ ID] 
> e.g. PROJ-BE-001-ALPHA (Backend) or PROJ-DO-001-ALPHA (DevOps)
*Project.md*
...

# Summary
[Brief 1-sentence summary of the project]
*Project.md*
...

# Description
[Paragraph & Points describing the challenge and your solution]
*Project.md*
...

# Project Architecture Diagram
[Architecture Diagram with interactive features, animations, etc]
*<undecided>.extension*
...

# Project Architecture Description / Steps
[Architecture Diagram Steps that describe each node / step of the architecture diagram ]
*<undecided>.extension*
...

# Project Relation (used in / used with)
[Project Names & Ids of any projects that uses the current project for it or in conjunction]
> e.g. DevOps Project 1 for a Backend or Webapp Project, which was used to deploy that webapp project & vice versa for that DevOps Project
*Project.md*
...

# Project Preview Image
[An Image that'll go on the project card as preview image & on the project page hero as the preview image, same image different sizes. Maybe have astro APIs figure this out for me, do use the biggest && clearest as raw image tho]
*<undecided>.extension*
...

# Properties

## Category
[Category of the project, which can lie, currently, in Devops, Webapp & ML/MLOps]
*Project.md*
...

## Type
[Type of the project, which describes generally what type of project this is, like a CI/CD Pipeline for DevOps category or Full Stack Webapp for Webapp category, etc]
*Project.md*
...

## Status
[The status of the project like in production (prod) or still in development (dev, alpha, beta) or archived ]
*git annotated tags*, which are fetched using git commands from the latest commit on main branch from the git remote / GitHub
...

## Version
[The version of the project like v1.x.x or greater for production or archived and less than v1.x.x still for in development (dev, alpha, beta)]
*git advanced annotated tags*, which are fetched using git commands from the latest commit on main branch from the git remote / GitHub
...

## Release Date
- can be used without github release
```bash
git tag -l --format='%(refname:short) %(creatordate:iso)' v1.0.0
# Or specifically for the tagger date:
git for-each-ref --format='%(taggerdate:iso)' refs/tags/v1.0.0   
```
[The release date of the first prod version (v1) or the latest dev version ( < v1.x.x), if no prod version yet, of the project]
there will always be a main branch, latest versions of that project will always be in main branch, even if the status of the project is in development
*within git*, fetched using git commands from the latest commit on main branch from the git remote / GitHub
...

## Tech Stack
[the stack of technonlogies used to create this project and are a part of this project in some way]
[every project will follow the pprinciple of separation of concerns, so a DevOps or Webapp project will only have their respective codes & will not be mixed]
[But to an extent, Frontend, Backend & Database code will still be kept in one repo / monorepo, albeit with separations of folder there as well, even if its not strictly deployment (like some backends && db code can have some level of infra specification in them)]
> e.g. AWS/Terraform/GHA for devops & React/Next/Node for Webapp
*Project.md*
...

# Links
- Repository: [URL (none, if private reop)]
- Live Page: [URL (if any)]
*Project.md*
...

# Roadmap Bullet Points (for Resume)
- Built [X] using [Y] which resulted in [Z]% improvement in [Metric].
- Architected [System] with [Tech] to handle [Scale].
- Integrated [Service] to automate [Process].
- Optimized [Feature] reducing [Cost/Time] by [Value].
- Implemented [Methodology] for [Target].
[Ignore for Portfolio project]
*Project.md*
...

# Required Inputs & Setup
- **Env Vars**: `DB_URL`, `API_KEY_XY`
- **Files**: `.env`, `service-account.json`
- **Models**: `Gemini 1.5 Pro` (if AI integrated)
[Ignore for Portfolio project]
*Project.md*
...


<!-- Main Places of these, but NOT the ONLY
 places they can be -->

---
---
---

Personal.md / Personal.json

# Personal Info

## Full Name & Initials
portfolio.md
...

## Hero Summary
portfolio.md
...

## Hero Additional 
portfolio.md
...

## About Me Summary 
portfolio.md
...

## About Me Skills, Languages & Technologies
can this be aggregated from all the projects & categorized properly and used here? until then use below
portfolio.md
...

## About Me Resume
resume.pdf
...

## GitHub, LinkedIn, Socials Links
portfolio.md
...

---
---
---

