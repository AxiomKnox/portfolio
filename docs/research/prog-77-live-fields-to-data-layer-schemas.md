# PROG-77 — Live Project / Profile fields → Data-layer file schemas

**Issue:** [PROG-77](https://linear.app/general-stuff/issue/PROG-77/research-live-projectprofile-fields-into-data-layer-file-schemas)  
**Parent map:** [PROG-75](https://linear.app/general-stuff/issue/PROG-75/wayfinder-data-input-and-content-collections-readiness)  
**Date:** 2026-07-25  
**Scope:** Plan-only field → on-disk schema mapping. Does **not** implement sync, Content Collections, Starwind, or ADR landing. Does **not** reopen owner locks without flagging.

---

## 1. Question

Map every live `Project` / `Profile` field (plus cert PDFs, preview images, `git-meta`) onto the agreed folder + in-file schemas from PROG-75 Notes, and call out residual gaps vs `src/data/*.ts` and pages — one implementer-facing schema table.

---

## 2. Sources (primary)

| Source | Role |
| --- | --- |
| `src/data/projects.ts` | Live `Project` interface + fixtures |
| `src/data/profile.ts` | Live `profile` fixture + `Profile` type intersect |
| `src/content/adapter.ts` | Page-facing content seam |
| `src/content/profile-display.ts` | Display helpers / omitted-from-schema fields |
| Pages/components via CodeGraph | Field consumers (`about`, `index`, `projects/[id]`, cards, Navbar, Footer, JSON-LD) |
| PROG-75 Notes (Linear) | Owner locks for trees + frontmatter/sidecar split |
| `docs/additional-info/deferred-data-input-astro-starwind-grouped.md` §1 | Grouped brief + grilling decisions |
| `docs/data-model.md` | Human schema doc (stale in places — gaps called out below) |

---

## 3. Locked folder trees (do not re-litigate)

From PROG-75 Notes + deferred brief §1:

```text
src/content/projects/<id>/
  project.md                 # required
  architecture.json          # optional
  preview.png | preview.webp # optional; wins over frontmatter token
  git-meta.json              # sync-written sidecar (bootstrap rules → PROG-80)

src/content/profile/
  profile.md                 # required
  resume.pdf                 # optional
  profile_photo.png          # present in tree lock (optional in deferred brief — see flags)
  certifications/<id>.pdf    # optional per-cert files
```

**Out of schema (locked omit):** `experienceMode`, `earlyCareer`, `certificationsVisibility`.  
**Out of this map:** `presentation?` (later **Canceled** — [PROG-85](https://linear.app/general-stuff/issue/PROG-85/project-presentation-flags-published-or-learning-or-hidden)), Starwind, sync/Collections implementation, ADR text.

---

## 4. Domain → file placement (implementer schema table)

### 4.1 Project

| Live field (`Project`) | Required live? | Data-layer home | In-file shape / notes | Page / consumer facts |
| --- | --- | --- | --- | --- |
| `id` | yes | `project.md` frontmatter | **required** string; must match folder `<id>` and `sync.config.ts` entry | URL slug; `getStaticPaths`; JSON-LD |
| `title` | yes | `project.md` FM | **required** string | Cards, detail, JSON-LD |
| `summary` | yes | `project.md` FM | **required** string | Cards, meta description, JSON-LD |
| `description` | yes | `project.md` **body** | markdown body (not FM) | `renderMarkdown` on detail |
| `category` | yes | `project.md` FM | **required** `"devops" \| "web" \| "ml"` | Labels, toolbar filters |
| `type` | yes | `project.md` FM | **required** free-form string | Detail header |
| `status` | yes | `project.md` FM | **required** `"dev" \| "alpha" \| "beta" \| "prod" \| "archived"`; SoT = FM (not git) | Toolbar, cards, detail |
| `techStack` | yes | `project.md` FM | **required** `string[]` | Cards, filters, brand-catalog assert, JSON-LD |
| `featured` | no (`?`) | `project.md` FM | **optional** boolean; omit = not featured | `getFeaturedProjects` |
| `links` | yes (object; keys optional) | `project.md` FM | **optional** `{ github?: string; live?: string }` in map lock (live type always has object) | Detail CTAs; JSON-LD |
| `preview` | yes (string token today) | FM **and/or** image file | FM `preview?: string` = GradientPreview token (`grad-1`…`grad-6`); optional `preview.png\|webp` **wins over** token | `ProjectCard` / `ProjectRow` / detail use `GradientPreview` with token today — **no image path yet** |
| `associated` | yes (`string[]`, may be empty) | `project.md` FM | **optional** `string[]` of other project ids | Detail “associated” list |
| `version` | yes | `git-meta.json` | Sidecar field (map lock); **not** in `project.md` | Detail sidebar |
| `releaseDate` | yes | `git-meta.json` | Sidecar ISO date; feeds `sortDate` / JSON-LD `datePublished` | Sort, detail “Released” |
| `architecture` | no (`?`) | `architecture.json` | Optional JSON = `{ nodes, edges, steps }` matching live `ProjectArchitecture` | `ProjectArchitectureIsland`; omit → lightweight fallback |
| _(n/a)_ | — | `git-meta.json` extras | Beyond `version` / `releaseDate` → **PROG-80** | Merge into domain `Project` at read time |

**Enums / helpers that stay code-side (not content files):** `STATUS_ORDER`, `sortDate`, `Category` / `Status` TypeScript unions (Collections Zod mirrors them later).

### 4.2 Profile

| Live field | Required live? | Data-layer home | In-file shape / notes | Page / consumer facts |
| --- | --- | --- | --- | --- |
| `initials` | yes | `profile.md` nested YAML | string | Navbar tile; About overlay on avatar |
| `fullName` | yes | `profile.md` | string | Navbar, titles, Footer, JSON-LD |
| `tagline` | yes | `profile.md` | string | Home hero |
| `bio` | yes | `profile.md` | string | Home hero + page descriptions; JSON-LD |
| `bioLong` | yes (fixture) | `profile.md` | `string[]` | About intro; falls back to `[bio]` |
| `location` | yes | `profile.md` | string | About meta row; JSON-LD |
| `yearsExperience` | yes | `profile.md` | number | About + home stats |
| `education` | yes | `profile.md` | string | About meta row |
| `email` | yes | `profile.md` | string | About CTA; home mailto; JSON-LD |
| `avatar` | yes (token) | `profile.md` **and/or** `profile_photo.png` | Keep grad token in YAML for bootstrap; photo file is tree lock. **Resolution rule not fully analogous-locked** (see flags) | About currently **hardcodes** `grad-avatar` — does **not** read `profile.avatar` |
| `what` | yes | `profile.md` | `{ label, icon, deliverables: string[], learning?: boolean }[]` | Home “what I do” cards + learning overlay |
| `links` | yes | `profile.md` | `{ label, href, icon }[]` | About, Footer, Navbar-adjacent; home bottom still loops links (end-of-map: email-only) |
| `skills` | yes | `profile.md` | `{ category, items: string[], learning?: boolean }[]` | About skills grid + learning overlay; brand-catalog assert |
| `experience` | yes | `profile.md` | `{ role, company, location, start, end, summary }[]` | Home timeline + About; empty array = hide/empty career (no `experienceMode`) |
| `certifications` | yes | `profile.md` (+ optional PDFs) | `{ name, issuer, href?: string, file?: string }[]` — map lock: **`file?` and/or `href?`**; empty array hides section | About list; home cert stat via `shouldShowCertifications` |
| `experienceMode` | type-only `?` | **OMIT from schema** | Locked drop | Still consumed by About/home helpers today → end-of-map cleanup |
| `earlyCareer` | type-only `?` | **OMIT from schema** | Locked drop | Same |
| `certificationsVisibility` | type-only `?` | **OMIT from schema** | Locked drop; hide via empty `certifications` | Same |
| _(no live field)_ | — | `resume.pdf` | Optional binary; About `AboutPreviewDialog` is a **placeholder** (no path wiring) | Additive asset for later UI bind |
| _(no live field)_ | — | `certifications/<id>.pdf` | Optional; referenced by cert `file?` | Additive vs today’s `href: "#"` fixtures |

### 4.3 Nested object shapes (copy into Collections Zod later)

```yaml
# profile.md frontmatter (illustrative — not a Collections implementation)
initials: AM
fullName: …
tagline: …
bio: …
bioLong: […, …]
location: …
yearsExperience: 6
education: …
email: …
avatar: grad-avatar   # token; photo file may supersede at resolve time
what:
  - label: DevOps
    icon: server
    deliverables: [pipelines, IaC, observability]
  - label: ML / MLOps
    icon: sparkles
    deliverables: [training harnesses, serving, evals]
    learning: true
links:
  - { label: GitHub, href: https://…, icon: github }
skills:
  - category: ML & Data
    learning: true
    items: [PyTorch, …]
experience:
  - { role, company, location, start, end, summary }
certifications:
  - name: CKA — …
    issuer: CNCF
    href: https://…      # optional if file set
    file: certifications/cka.pdf  # optional if href set
```

```yaml
# project.md frontmatter + body
id: atlas-deploy
title: Atlas Deploy
summary: …
category: devops
type: Deployment platform
status: prod
techStack: [Go, Docker, …]
featured: true          # optional
links: { github: …, live: … }  # optional object
preview: grad-1         # optional token when no image
associated: [ember-portfolio]  # optional
---
Markdown description…
```

```json
/* architecture.json — optional; same as live ProjectArchitecture */
{
  "nodes": [{ "id": "s1", "label": "…", "x": 40, "y": 120 }],
  "edges": [{ "from": "s1", "to": "s2" }],
  "steps": [{ "id": "s1", "title": "…", "detail": "…" }]
}
```

```json
/* git-meta.json — locked minimum; further keys → PROG-80 */
{
  "version": "v1.4.0",
  "releaseDate": "2025-11-02"
}
```

---

## 5. Facts established

1. **Live store today** is still ADR-0001 TS modules (`src/data/*.ts`) behind `src/content/adapter.ts`. Collections layout is the agreed end-state; conversion is post-map.
2. **Every live Project scalar/array field has a home** under the locked tree: FM, body, `architecture.json`, preview image, or `git-meta.json` (`version` / `releaseDate`).
3. **Every live Profile content field (excluding the three omit-locks) fits nested YAML in `profile.md`**, including `bioLong`, `what[].learning`, and `skills[].learning`.
4. **Cert PDF + resume PDF are additive assets** not represented as typed fields on today’s `Profile` object; UI for resume is a dashed placeholder (`AboutPreviewDialog`).
5. **Preview image > token** is locked for projects; pages still only pass tokens into `GradientPreview`.
6. **Optional vs required drift:** map makes `featured` / `links` / `preview` / `associated` optional; live `Project` still requires `links`, `preview`, and `associated` (arrays/objects always present in fixtures). Domain merge after Collections should treat omit as today’s empty defaults.
7. **`docs/data-model.md` is stale** vs live code: wrong `what` shape (`detail` vs `icon`/`deliverables`); missing `bioLong` / `learning`; `architecture` documented as required while code has `architecture?`; still mentions react-markdown / `src/routes` (PROG-45 territory).

---

## 6. Residual gaps / flags (for grilling, not reopened here)

| ID | Gap | Suggested owner |
| --- | --- | --- |
| G1 | Exact `git-meta.json` keys beyond `version`/`releaseDate`, and bootstrap-without-sidecar merge | **PROG-80** (+ PROG-76 API facts) |
| G2 | How Profile is expressed as a Content Collection (single entry vs data collection vs assets) | **PROG-78** |
| G3 | Whether adapter stays to merge FM + git-meta + preview/photo resolution | **PROG-79** |
| G4 | `profile.avatar` unused on About (hardcoded `grad-avatar`); photo-vs-token win rule not stated as explicitly as project preview | Flag for PROG-78 / end-of-map UX |
| G5 | `profile_photo.png` optional in deferred brief vs listed without “optional” in PROG-75 Notes bullet | Tiny consistency flag — treat as **optional** unless owner says required |
| G6 | Omit-locks still present in `Profile` type + `profile-display` consumers | End-of-map checklist / **PROG-82** |
| G7 | Home bottom CTA still maps full `profile.links` | End-of-map checklist (email-only) |
| G8 | Cert `file` path convention relative to `profile.md` vs absolute under `certifications/` | PROG-78 Zod / asset glob |
| G9 | Human `docs/data-model.md` drift | PROG-45 (not blocking schema lock) |

No owner lock from PROG-75 Notes was reopened.

---

## 7. Coverage verdict

| Surface | Coverage |
| --- | --- |
| Live `Project` fields → locked files | **Complete** for placement; merge rules for sidecar → **PROG-80** |
| Live `Profile` content fields → `profile.md` | **Complete** (nested YAML) |
| Omit-locks (`experienceMode` / `earlyCareer` / `certificationsVisibility`) | **Excluded by design**; code cleanup deferred to map end |
| Cert PDF / resume / preview image / photo | **Homed** in tree; resolve/bind details left to PROG-78/79/80 + later UI |
| vs `src/data/*.ts` + pages | Gaps G4–G7 are consumer/cleanup, not missing schema homes |

**Implementer takeaway:** reshape fixtures into the trees above; put `version`/`releaseDate` only in `git-meta.json`; put architecture only in `architecture.json`; put Profile nested data only in `profile.md`; do not author the three omit fields.

---

## 8. Unblock note (downstream)

- **PROG-78 / PROG-79:** unblocked from this research’s perspective (field homes + omit list are fixed inputs to grilling).
- **PROG-80:** unblocked **for the Project field split** (`version`/`releaseDate` minimum in sidecar); still blocked by **PROG-76** for API/tag → sidecar shape details.
