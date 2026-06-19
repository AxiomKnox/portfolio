Portfolio

# Project Properties
- Project Id: for sorting
- Project Title: can be used for sorting
- Project Categories: like DevOps, Web Application, Machine Learning, Full Stack, Data Engineering.
- Project Type: like "Mobile App," "Web Site," "Branding," "Case Study," "Research" ?? Automation, API, Dashboard, Model Training, CI/CD Pipeline, Microservice, ETL Pipeline ?? idk ai said one

- Project Status: like dev, alpha, prod, archived, etc // Production, Staging, Prototype, Proof of Concept (PoC), Deprecated 
- Latest Release Version
- Date of Release of the Latest Version (Approx, MM-YY or DD-MM-YY for specific version?)
- Timeline / Duration: like how long it took for dev, alpha or prod?? 3 Months, 2 Weeks, etc
- Tech Stack


??? Role: Architect, Developer, Data Scientist, DevOps Engineer, Lead.

///////////////////

{
  "id": "proj_001",
  "title": "Auto-Scaling ML Pipeline",
  "category": "Machine Learning",
  "type": "ETL Pipeline",
  "status": "Production",
  "version": "v2.1.0",
  "date_completed": "2026-05-15",
  "duration_days": 45,
  "tech_stack": ["Python", "Kubernetes", "TensorFlow", "AWS", "Airflow"]
}


///////////////////

0. Project Id 
Can also be used for sorting

Definition: The id of the project
Examples: PROJ-DO-001-ALPHA, PROJ-001-ALPHA, PROJ-001
Why: Just for my convenience, and it also looks nice if there is some kind of id on project cards & page or something


1. Project Categories (Broad Domain)
Use this for the primary filter (e.g., tabs or main dropdown).

Definition: The high-level discipline or industry focus.
Examples: DevOps & Infrastructure, Web Development, Machine Learning & AI, Data Engineering, Cloud Architecture. 
Why: Allows a recruiter to instantly ignore irrelevant domains (e.g., a Web Dev manager skipping ML projects).


2. Project Type (Specific Function)
Use this for secondary filtering within a category.

Definition: The specific kind of solution or deliverable built. 
Examples:
DevOps: CI/CD Pipeline, Monitoring Dashboard, Migration, Automation Script.
Web: SaaS Platform, E-commerce Site, REST API, Progressive Web App.
ML: Predictive Model, Computer Vision System, NLP Chatbot, Recommendation Engine.
Why: Distinguishes between a "website" and an "API," or a "pipeline" and a "dashboard."


3. Project Status (State)
Use this as a toggle or small badge.

Definition: The current lifecycle stage of the project. 
Examples: Production (Live), Active Development, Prototype / PoC, Maintenance, Archived / Deprecated.
Why: Recruiters prioritize Production work over Prototypes.


4. Version (Release)
Use this as text metadata (usually not a filter).

Definition: The specific release number or iteration shown.
Examples: v2.4.0, v1.0 (Beta), Model v3 (Retrained).
Why: Shows that the project is maintained and evolving. Critical for libraries or APIs.


5. Date (Completion/Launch)
Use this for default sorting (Newest First).

Definition: The specific date the version was released or the project was completed. 
Format: YYYY-MM-DD or Month YYYY (e.g., June 2026).
Why: Proves your skills are current. Old projects (pre-2023) might imply outdated tech stacks.


6. Timeline / Duration (Effort)
Use this as a range filter or badge.

Definition: How long the project took to build or how long you worked on it.
Examples: 2 Weeks, 3 Months, 6+ Months, Ongoing (1 Year).
Why: Differentiates a quick "weekend hack" from a complex, long-term enterprise commitment.


7. Tech Stack (Tools)
Use this for multi-select tagging (the most used filter).

Definition: The specific languages, frameworks, and tools used.
Examples: Python, React, Kubernetes, TensorFlow, AWS, Docker, PostgreSQL.
Why: This is the #1 way recruiters search. They need to know if you know their specific tools.

//

Recommended UI Layout for This Order
Filter Bar	Sort By
Category: [All v] Type: [All v] Stack: [Select Tags...] Status: [All v]	Date: Newest ↘ Duration: Longest ↘

//////////////////////

1. Project Category (Domain) - Static, Project.md
Definition: The primary field of engineering.
Values: DevOps, Web App, Machine Learning, Data Engineering, Full Stack. 
Filter Use: Primary tab or dropdown.

2. Project Type (Specific Build) - Static, Project.md
Definition: The specific artifact you created. 
Values:
    DevOps: CI/CD Pipeline, IaC Template, Monitoring Stack, K8s Cluster.
    Web: SaaS Clone, API Service, Dashboard, Static Site.
    ML: Predictive Model, Computer Vision, NLP Tool, Data Pipeline.
Filter Use: Secondary filter to narrow down within a category. 

3. Project Status (Maturity) - Static, Project.md
Definition: Current state of the code.
Values: Active, Completed, Archived, Experimental (great for showing you try new things).
Filter Use: Toggle to hide "Experimental" if looking for production-ready code. 

4. Version (Iteration) - Dynamic, Release
Definition: Current release tag.
Values: v1.0, v2.4-beta, Latest.
Why: Shows you understand semantic versioning and maintenance.

5. Date (Last Updated) - Dynamic, Release
Definition: Date of the last commit or deployment.
Format: YYYY-MM.
Sort Use: Crucial. Sort by "Recently Updated" to prove your skills are current (e.g., using 2026 libraries). 

6. Timeline / Duration (Effort) - Static, Project.md
Definition: Time spent building, till prod.
Values: Weekend Hack, 2 Weeks, 1 Month, Ongoing.
Why: Distinguishes a quick proof-of-concept from a deep-dive architecture project.

7. Tech Stack (Tools) - Static, Project.md
Definition: Core technologies used. 
Values: Python, React, Terraform, PyTorch, AWS, Docker.
Filter Use: Multi-select tags (most important filter). 


🚀 The 3 Missing "Personal Project" Properties
Add these to replace the missing "Business Metrics" you removed. They prove engineering depth. 

8. Complexity Level (Difficulty) - Static, Project.md
Why: Since there are no business metrics, you must self-assess the technical difficulty.
Values: Beginner (Tutorial-based), Intermediate (Modified/Solved specific bug), Advanced (Custom Architecture/From Scratch).
Filter Use: Recruiters often filter for "Advanced" to see your best work first.

9. Key Learning / Challenge Solved - Static, Project.md
Why: Personal projects are about growth. What specific hard problem did you solve?
Values: Scalability, Real-time Data, Cost Optimization, Model Accuracy, Security, Legacy Migration.
Filter Use: Allows a recruiter to find projects where you solved a problem they currently have (e.g., "Show me projects where he solved Scalability"). 

---
---
---

# Icons 1
"Implement a robust icon resolution system that uses a priority-ordered fallback chain across multiple Iconify sets across iconify. If a specific match isn't found even after fallback icons packs across iconify, the logic should gracefully degrade to a generic 'code' or 'tech' placeholder to ensure no entry is left iconless."

"I want, In Light Mode, icons should display their 'original colorway' (multi-color brand assets). In Dark Mode, apply a CSS filter (e.g., grayscale(1) brightness(1.5) or whatever) or a specific property / way to render the icons in a the current way / style. The transition must be seamless and driven by a global theme state or something."

- You can use any icon without knowing its exact name or prefix.
- The system automatically fetches the correct icon from the largest and most reliable Iconify packs.
- If an icon isn't found in the first pack, it falls back to the next (e.g., try mdi:home, then ph:home, then tabler:home).
- Icons are themable (color changed via CSS) while preserving the ability to use original colors when needed. 
	- In dark mode: Use monotone icons (like mdi:home) recolored to fit your dark theme via CSS color. 
	- In light mode: Use multi-color icons (like brand logos, emojis) with their original, hardcoded colors intact. 

"Use Zustand wherever possible, like the theme, icons' settings, etc. Ensure the state is shared and synchronized across all pages so that user preferences are maintained during navigation. And add other possible improvements"

won't fallback also handled a missing icon from an icon pack, even if the icon name is correct

---

logos (add -icon at the end to get just the icon)
mdi
simple-icons
devicon
devicon-plan
material-icon-theme
skill-icons

---
---
---

# 
