# Guide: set up the **profile** remote for this portfolio

The site has a **single** Profile entry (not a “portfolio” folder name, not a
multi-profile collection). Sync pulls one remote folder into
`src/content/profile/`. Collection id is always `profile`.

Canonical fixture: `src/content/placeholder/profile/profile.md`
(materialize with `bun run sync:dev`; live root is `src/content/profile/`).

---

## 1. Remote layout

`sync.config.ts` `profile.path` is the folder that **contains** `profile.md`
(use `""` for repo root, or `"profile"` if the file lives under `/profile`).

```text
<remote path>/                      # e.g. "profile" or ""
  profile.md                        # required
  resume.pdf                        # optional
  profile_photo.png                 # optional
  certifications/                   # optional directory
    cka.pdf                         # optional; any *.pdf files
    aws-sap.pdf
```

After sync, the portfolio has the same files under `src/content/profile/`
(plus any PDFs found under `certifications/`). Missing optional `resume.pdf` /
`profile_photo.png` are deleted locally on sync if they were present before.

**Note:** Sync copies every `*.pdf` listed under remote `certifications/`.
Cert entries in frontmatter that use `file:` must point at paths that exist
under the profile root after sync (e.g. `certifications/cka.pdf`). A missing
`file` target fails assemble (fail-closed).

---

## 2. `profile.md` frontmatter

All profile fields live in **YAML frontmatter**. The Markdown body is empty /
ignored by the loader. Nested objects and arrays use normal YAML.

| Field | Required | Type | Example / notes |
| --- | --- | --- | --- |
| `initials` | yes | string | `"AK"` |
| `fullName` | yes | string | `"Ab Ks"` |
| `tagline` | yes | string | Hero line |
| `bio` | yes | string | Short bio |
| `bioLong` | yes | `string[]` | Longer About paragraphs |
| `location` | yes | string | `"Pune, IN"` |
| `yearsExperience` | yes | number | e.g. `0` or `5` |
| `education` | yes | string | Degree / school line |
| `email` | yes | string | Contact |
| `avatar` | yes | string | Gradient token (e.g. `grad-avatar`) |
| `what` | yes | array | `{ label, icon, deliverables: string[], learning?: boolean }` |
| `links` | yes | array | `{ label, href, icon }` |
| `skills` | yes | array | `{ category, items: string[], learning?: boolean }` |
| `experience` | yes | array | `{ role, company, location, start, end, summary }` — use `[]` to hide career |
| `certifications` | yes | array | `{ name, issuer, href?: string, file?: string }` — use `[]` to hide section |

### Certifications

- `href` — external link (optional).
- `file` — path relative to the profile root, e.g. `certifications/cka.pdf`
  (optional). If set, the file must exist on disk after sync.
- If both `file` and `href` are set, assemble **prefers `file`** and drops
  `href` from the domain object.

### Photo vs avatar token

- Keep required FM `avatar` (gradient token) for bootstrap / current UI.
- Optional `profile_photo.png` is synced when present. Using the photo in the
  UI instead of (or over) the token is **PROG-84** — later / optional until
  that wire lands. Sync and loaders already record photo presence.

### Not in schema

Do not invent `experienceMode`, `earlyCareer`, or `certificationsVisibility`.
Hide experience or certs with empty arrays.

---

## 3. Minimal frontmatter skeleton

```yaml
---
initials: AK
fullName: Your Name
tagline: One short positioning line.
bio: One-sentence bio for the home hero.
bioLong:
  - First longer paragraph for About.
  - Second paragraph.
location: City, CC
yearsExperience: 3
education: B.E., Computer Engineering — Example University
email: you@example.com
avatar: grad-avatar
what:
  - label: DevOps
    icon: server
    deliverables:
      - pipelines
      - IaC
links:
  - label: GitHub
    href: https://github.com/you
    icon: github
skills:
  - category: Backend & Web
    items:
      - TypeScript
      - Astro
experience:
  - role: Engineer
    company: Example Co
    location: Remote
    start: 2022-01
    end: Present
    summary: What you owned and shipped.
certifications:
  - name: CKA — Certified Kubernetes Administrator
    issuer: CNCF
    file: certifications/cka.pdf
---
```

Copy structure from `src/content/placeholder/profile/profile.md` for a full fixture.

---

## 4. Register in `sync.config.ts`

Single profile remote (not an array):

```ts
profile: {
  owner: "your-github-user",
  repo: "portfolio-profile",   // dedicated repo, or any repo that holds the folder
  path: "profile",             // folder containing profile.md; "" = repo root
  // ref: "main",              // optional
},
```

`owner` / `repo` must be real (not `TODO…`). Config holds no secrets — auth is
only via `GITHUB_TOKEN`.

You may keep profile content in its own small private repo, or in a folder of
another repo; the portfolio only cares about `owner` / `repo` / `path` / `ref?`.

---

## 5. Run sync and verify

```bash
# portfolio repo .env
GITHUB_TOKEN=ghp_…

bun run sync
```

Verify:

1. `src/content/profile/profile.md` updated from the remote.
2. Optional `resume.pdf` / `profile_photo.png` present only if remote has them.
   About `/resume` previews and downloads `resume.pdf` when it is present, and hides that block when it is not.
3. PDFs under `src/content/profile/certifications/` match remote listing.
4. Every cert with `file:` resolves; dangling paths fail at content load.
5. Dev/build loads a single profile entry (`id` = `profile`).

---

## 6. Common pitfalls

| Pitfall | What happens |
| --- | --- |
| Naming the folder `portfolio/` in config while files live elsewhere | Required `profile.md` missing → fail-closed |
| `TODO` owner/repo | Config parse rejects |
| Missing `GITHUB_TOKEN` or insufficient scope | Fail-closed |
| Cert `file: certifications/x.pdf` but PDF not on remote | Assemble throws missing file |
| Expecting Markdown body to render as bio | Body ignored; put prose in `bio` / `bioLong` |
| Putting multiple people / multiple profile.md files | Contract is **one** Profile root; loader is single-entry |
| Relying on photo in UI today | Photo sync works; presentation wire is PROG-84 |

---

## Background reading

- Field map: [`docs/research/prog-77-live-fields-to-data-layer-schemas.md`](../research/prog-77-live-fields-to-data-layer-schemas.md) §4.2
- Deferred brief (Profile root naming, cert rules): [`docs/additional-info/deferred-data-input-astro-starwind-grouped.md`](../additional-info/deferred-data-input-astro-starwind-grouped.md)
- ADR outline: [`docs/research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md`](../research/prog-83-adr-outline-collections-sync-supersedes-content-as-code.md)
- Project remotes: [new project](./new-project-remote.md) · [existing project](./existing-project-remote.md)
