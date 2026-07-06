## Content & fixtures (local dev)

- Add a sample resume.pdf instead of me having to add a real one for dev

- for now, have the same / similar 4-6 local mock content made for dev

- Ensure the inputs schema, from content-inputs.md, is followed for the new local inputs & has updated remote repos, just sample repo, which are consistent with the input files' schema

- make up preview.png for sample & local contents, have the same structure as remote repos if possible
    - use solid colors or slight gradients to solid colors for pngs like lovable previews

- keep the "available for projects" hardcoded

- phases
    v1
    - arch...tsx will be brought up to speed on repos way later, for now local, sample repo & internship repos are fine
    - hero hardcode is fine, doesn't need to be dynamic, 
    - add more "fixture" or local projects for now, for dev

- yeah the 4 legacy local project contents need to be recreated by AI itself, in similar quality to previous ones, with just as much content as a real repo would have

- change the `portfolio.md` file's location to content-sources

- change from `./src/content/personal/site.md` to `./src/content/portfolio/portfolio.md`

- isn't "Author `portfolio.md` fully" already done by you??


## Remote repos, sync & GitHub

- start by adding a example repo just for this. then add more later.
    - Do all the things in this repo like the git tags, git notes, project.md whatever do it first on this repo for testing

- i think keep json, since it still functions the same in the end & is much safer, just will have to make a new workflow for making that for every project in a controlled, consistent & convinient env

- add git tags & notes to projects slowly starting from sample repo then internship repo for now, but before all that just use local files & content for now
    - have to make an automation for that as well, which'll let me add those consistently during the development of those projects as well as when i want to get up to speed on all projects

- what is this github adapter??

- add github token logic so that i can also use / fetch my private repos in local or CI env

- is query.ts and the whole codebase as it is now, compatible with github pages??


## Architecture & codebase

- don't know how to comment on arch...json loading methods yet, seems fine as it is now tho

- "architecture deepening" just writing down for now
    - release date resolution module
    - arch loading in query
    - content sync orchestrator
    - related project graph (don't think i want another function running for this after sync, but if it works just fine & is the minimal way, its fine)

- wat this about?? skills-lock.json path drift??

- remove dead or unused code, folders & files, like `./src/app` folder, HorizontalScroller.tsx (if its not being used), etc


## UI / UX & design

- have to get to UI/UX, bugs, design system, fonts in preview vs dev, etc .....


## Repo hygiene & conventions

- commiting soon

- Do have to update the Readme extensively to get it upto date

- do not use npx for anything, always use pnpm or bun according to what is setup in the project itself

- follow "separation of concerns" and have sync related files & processes be separated from src code & content. So is the case for tests as well, separate concern from pure development & pre-builds / content fetching. Also the same case for infra

- 
