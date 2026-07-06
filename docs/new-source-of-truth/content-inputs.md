# Input Data

See also: [architecture-flow.md](./architecture-flow.md) — how sync and Astro collections implement this spec (including known divergences).

There are now **two source bundles**:

- There is no need to parse these now, just pass them to Astro's Content Collections.


## Per-project remote sources

- `repo/project/`

	- `project.md` — project-specific content
    
	- `architecture.tsx` — architecture diagram and/or explanation source
	
	- `preview.png` — project preview image source
    

### Git Derived Remote Data

- `git tags` (lightweight tags) — Version
	
- `git notes` — Status
	
- `git commit` — Release Date
	

## Global personal remote sources

- `portfolio.md` — personal content
    
- `resume.pdf` — resume document
    
---

## Local Data after running sync

- All of this will go though the Astro Content Collection
- Other inputs, like Env Vars, Fonts, Icons & Images will also be managed by Astro

### Projects Content

- `./src/content/projects/project-slug/*`

	- `project.md` — regenerated with YAML frontmatter; includes project status, version & release date from git-derived data
    
	- `architecture.json` — produced at sync from source `architecture.tsx` (AST parse, no execution)
	
	- `preview.png` 

### Personal Content

- `./src/content/personal/*`

	- `site.md` — personal content as structured frontmatter (parsed from source `portfolio.md`)
		
	- `resume.pdf` — resume document



---
---

# Project Data

## projects.md

### Project Name

The display name of the project.

**Source:** `project.md`

### Project Id

A stable unique identifier for the project.

**Example:** `PROJ-001`, `PROJ-002`

**Source:** `project.md`

### Project Summary

A concise one-sentence overview of the project.

**Source:** `project.md`

### Project Description

A fuller description of the problem, approach, key components and outcome. This can include paragraphs and bullet points.

**Source:** `project.md`

### Project Relations

Other projects that this project depends on, supports, or is used with.

Use this for cross-project relationships such as:

- a DevOps project used to deploy a web application and vice versa
    
- a backend project used by a frontend project & vice versa
    
- a shared infrastructure or MLOps project used across multiple repositories & vice versa
    

**Source:** `project.md`

### Links

Project links and references.

- Repository: URL, or `unavailable` if private & `none` if non-existent
    
- Live Page: URL, if available
    

**Source:** `project.md`

### Project Properties

#### Project Category

The high-level project category.

Current expected values:

- DevOps
    
- WebApp
    
- ML / MLOps
    

**Source:** `project.md`

---
#### Project Type

The specific project type within the category.

Examples:

- CI/CD Pipeline
    
- Full-Stack Web App
    
- Deployment System
    
- ML Workflow
    
- Model Serving Stack
    

**Source:** `project.md`

---
#### Tech Stack

The technologies used to build the project.

This should include only the stack relevant to the project itself.  
Each project should maintain separation of concerns: DevOps projects should contain DevOps-related code, web app projects should contain application code, and so on. Monorepo boundaries, where the code is super specialized, are acceptable where they are intentional and clearly separated by folders.

Examples:

- `AWS`, `Terraform`, `GitHub Actions` for DevOps
    
- `React`, `Next.js`, `Node.js` for WebApps
    

**Source:** `project.md`

---
#### Project Status

The lifecycle state of the project.

Examples:

- `dev`
    
- `alpha`
    
- `beta`
    
- `rc` 

- `prod`
    
- `archived`
    

This should be derived from git annotated tags, fetched from the latest commit on the `main` branch from the remote repository.

**Source:** git notes

---
#### Release Version

The semantic version of the project.

Examples:

- `v1.0.0`
    
- `v1.2.3`

- `v0.12.3-alpha.3`
    

Versions below `v1.0.0` indicate pre-production stages; production and archived releases use `v1.x.x` or higher.

This should be derived from git advanced annotated tags, fetched from the latest commit on the `main` branch from the remote repository.

**Source:** git tags

---
#### Release Date

The release date of the relevant project version.

Rules:

- If a production version exists, use the first `v1.x.x` release date or the latest production release date, depending on the intended display logic.
    
- If no production release exists, use the latest development release date below `v1.0.0`.
    
- This value can be derived directly from git tags without requiring GitHub Releases.
	
- This setup is used because of the filtering on portfolio having a date filter option, which i dont want changing for working prod releases, but show latest release dates for versions with dev or wip status.
    

**Source:** git commit from the latest tag on `main`

---
---

## preview.png
### Project Preview Image

A preview image used on the project card and as the hero image on the project detail page. The same source image may be resized for different contexts; the largest and clearest version should be treated as the canonical source.

**Source:** `preview.png`


---
---
## resume-points.md
### Resume Bullet Points

Resume-oriented bullet points describing impact, scale, or measurable outcomes.

Keep it separate from `Readme.md` cuz I don't want people to see those point when they visit my repo randomly.

Examples:

- Built `[X]` using `[Y]`, resulting in `[Z]%` improvement in `[metric]`.
    
- Architected `[system]` with `[tech]` to handle `[scale]`.
    
- Integrated `[service]` to automate `[process]`.
    
- Optimized `[feature]`, reducing `[cost/time]` by `[value]`.
    

This section should be omitted for the portfolio project.

**Source:** `resume-points.md`


---
---
## setup.md
### Required Inputs & Setup

Project-specific setup requirements.

Examples:

- Environment variables: `DB_URL`, `API_KEY_XY`
    
- Required files: `.env`, `service-account.json`
    
- Required models: `Gemini 1.5 Pro`
    

This section should be omitted for the portfolio project.

**Source:** `setup.md`

---
---
## architecture.*
### Project Architecture Diagram

The visual architecture representation for the project. This will be an interactive, animated, and code-generated diagram made from react flow library.

**Source:** `architecture.tsx`

### Project Architecture Steps

A structured explanation of the architecture diagram, including steps as nodes, flow, and implementation steps. is a part of the `architecture.tsx` file.

**Source:** `architecture.tsx`  

---
---

# Personal Data
## portfolio.md
### Full Name & Initials

The public name to display in the portfolio.

**Source:** `portfolio.md`

### Hero Summary

A short top-level introduction for the hero section.

**Source:** `portfolio.md`

### Hero Additional Text

Extra supporting text for the hero section.

**Source:** `portfolio.md`

### About Me Summary

A concise summary for the about section.

**Source:** `portfolio.md`

### About Me Skills, Languages & Technologies

A categorized list of skills, languages, and technologies.

This may eventually be aggregated from all project data and normalized into categories automatically. Until that system is finalized, use the content from `portfolio.md`.

**Source:** `portfolio.md`  
**Future option:** generated from aggregated project metadata

### GitHub, LinkedIn, and Social Links

Public profile links for portfolio display.

**Source:** `portfolio.md`

---

## resume.pdf
### About Me Resume

The resume document.

**Source:** `resume.pdf`