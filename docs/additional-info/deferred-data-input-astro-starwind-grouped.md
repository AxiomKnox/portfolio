# Grouped brief — Data / Input / Astro / Starwind deferred work

**Shared picture:** Today the site is **content-as-code** (`src/data/*.ts` → `src/content/adapter.ts` → Astro pages). The long-term input path is **sync from remote project/portfolio folders → immutable files under `src/content/**` → Astro Content Collections → same adapter**. Starwind/shadcn hybrid stays; **theme-toggle, Prose, and broader Starwind** stay deferred. ADR-0001 will need superseding when sync+collections land.

**Wave order (owner):** deferred items → Tn issues. Inventory A/B/C brief is **CLOSED**. Active next: **§1 Data / input / sync + §2 Astro / Content Collections** via one Wayfinder map (Data layout vs Input/sync are distinct layers; Collections is the app-side of Input — charted together because sync’s remote I/O, on-disk layout, Collections schema, and adapter swap are one decision surface). **Wayfinder default: plan-only** — lock the contract; implement only after the map is clear. Starwind §3 stays out.

---

## 1. Data / input / sync layer (+ Content Collections — see §2)

**Wayfinder status:** Map **complete** — [Wayfinder — Data, Input & Content Collections readiness](https://linear.app/general-stuff/issue/PROG-75/wayfinder-data-input-and-content-collections-readiness) (PROG-82 closed the checklist). **Plan-only contract ready.** `src/data/*.ts` → `src/content/**` conversion is **post-map implementation**.

**Owner decisions so far (grilling):**
- Synced / Collections content under `src/content/**` replaces `src/data/*.ts` as the live store.
- Keep today’s document data available for dev / first clone / pre-sync bootstrap; **you** remove that bootstrap when it’s no longer needed.
- Current fixture content must be **reshaped** to the Data-layer layout this map decides (transform mapping is in-scope for the plan; physical migrate waits for post-map implementation).
- **One Profile content root** at `src/content/profile/` (not `portfolio/`, not a separate `personal/` tree) for everything the public site needs about the person. This site is a **personal showcase / portfolio of work** — not a multi-consumer product; no distribution audience to design for.
- **Project preview:** optional `preview.png` / `.webp` in the project folder; if absent, frontmatter `preview?: string` is a **GradientPreview token** (`grad-1`…`grad-6`). Locked. **Merge (PROG-80 Done):** single domain `preview` string — image path/URL wins; else FM token; else fail-closed; **both** `preview.png` and `preview.webp` → fail-closed.
- **Project id:** **required** in authored `project.md` frontmatter **and** in `sync.config.ts` project entries; after fetch, config `id` must match frontmatter (fail on mismatch). Synced folder = `src/content/projects/<id>/`.
- **`associated`:** optional (`string[]` of other project ids when present). At merge, absent optional `featured?` / `links?` / `associated?` → not featured / `{}` / `[]` (PROG-80).
- **`git-meta.json` (PROG-80 Done; Q8 superseded):** exact `{ version, releaseDate }` (Zod strict; no provenance keys). Sync: max-semver tag; annotated `tagger.date` / lightweight `commit.committer.date`; zero tags → `unreleased` + ISO now. Sidecar **optional** at Collections/merge (missing does **not** fail build) — loader synthesizes `{ version: "unreleased", releaseDate: "<ISO now at load/build>" }`; fixtures **preferred-include** a committed sidecar; present-but-invalid → fail-closed. FM must not contain `version`/`releaseDate`. **Assembly seat:** projects Content Layer loader (PROG-79) — not adapter-only re-parse.
- **`presentation?`:** **Canceled** ([PROG-85](https://linear.app/general-stuff/issue/PROG-85/project-presentation-flags-published-or-learning-or-hidden)); do not implement.
- **Change-frequency note (owner reminder):** `status` and `version` change often; `featured?`, `links?`, `preview?`, `associated?` in `project.md`, and optional `architecture.json`, may be added or updated occasionally — plan sync/Collections so those fields stay easy to edit without rewriting the whole project.
- **Profile:** single `profile.md` + optional `resume.pdf` / `profile_photo.png`.
- **Drop from Data-layer schema:** `experienceMode`, `earlyCareer`, `certificationsVisibility` — use real `experience[]` entries and empty `certifications` to hide. **End-of-map cleanup (PROG-82 Done):** removed from live code (`profile.ts`, `profile-display.ts`, About/home callers).
- **Cert PDFs:** optional files under `src/content/profile/certifications/<id>.pdf`; each cert may have `file?: string` and/or `href?`.
- **Profile Content Collection (PROG-78 Done):** single-entry content collection `profile` — load only `src/content/profile/profile.md`; Collections id/slug must be `profile` (fail if not exactly one). Zod on nested frontmatter (PROG-77 fields; omit-locks excluded). Markdown body empty/ignored. Optional binaries (`resume.pdf`, `profile_photo.png`, `certifications/<id>.pdf`) co-located, **not** collection entries. FM `avatar` required gradient token; `profile_photo.png` wins when present (mirror project preview). Cert `file` paths relative to Profile root; `file?`/`href?` both optional; if `file` set but missing → fail-closed. About avatar uses `profile.avatar` (PROG-82 Done).
- **Read path / adapter (PROG-79 Done):** Keep thin exclusive `adapter.ts` (rename optional). Pages must not import `astro:content`. Content Layer **loaders** own store assembly into domain-shaped collection `data`; adapter = getters + `getFeaturedProjects` + brand-catalog assert (no display-helper barrel). Projects loader: FM + body→description + git-meta flattened onto entry (missing → synthesize per PROG-80) + architecture.json + preview image>token. Profile loader: FM + photo>avatar + cert prefer-file-when-both + convention paths. Domain types in `src/content/types/` (`project.ts`, `profile.ts`) for islands. Plain direct-Collections-on-pages rejected.
- **End-of-map UX (homepage, PROG-82 Done):** CTA / contact strip is **email-only** — social `links` loop kept on About/Footer as needed.
- **Sync failure policy:** fail-closed — one failed remote fails the whole sync/build (local + CI); clear error naming the source. No partial default.
- **Private repos + auth:** required. Single env token `GITHUB_TOKEN` — local via `.env` (document in `.env.example`); CI via **job-level** secret with the **same name**. Sync config lists remotes/paths only — **no tokens inside the config file** (one env token covers all repos; no per-repo tokens).
- **How content is pulled:** no full `git clone`. **Bun `fetch` + GitHub API** (+ `GITHUB_TOKEN`) for folder file downloads **and** for git-derived metadata (tags → `git-meta.json`). Do not require `git` or `gh` for the canonical path (optional later sugar only).
- **Sync config:** checked-in `sync.config.ts` at repo root — profile remote + projects list of `{ id, owner, repo, path, ref? }` (no secrets). **`id` required in config** (destination folder `src/content/projects/<id>/`); after fetch, assert it matches authored `project.md` frontmatter `id` (fail on mismatch / missing).
- **Collections:** Astro Content Collections are the app read path for `src/content/**` (schemas for projects + profile). Pages must not import remotes or raw sync output.
- **Adapter seam (PROG-79 Done):** Keep thin exclusive `adapter.ts` (see Read path bullet above). Loaders own merge; pages never import `astro:content`.
- **Bootstrap / git:** Commit fixtures under `src/content/placeholder/**` (preferred `git-meta.json` per project — PROG-80). Live `projects/` + `profile/` are gitignored and materialized by `sync:dev` / `sync` / `sync:dev:all`. **`src/data/*.ts` retired.**

### End-of-Wayfinder-session checklist
1. ~~Clean `experienceMode` / `earlyCareer` / `certificationsVisibility` from code.~~ **Done (PROG-82).**
2. ~~Homepage bottom CTA contact → email only.~~ **Done (PROG-82).**
3. ~~Record adapter keep-or-replace decision.~~ **Done (PROG-79).**

**Map contract ready** — PROG-75 destination met (plan-only). Post-map: implement Collections/sync; land ADR when owner asks (PROG-83 outline); PROG-84 (astro:assets) is separate.

### Layer split (working vocabulary)
| Layer | Meaning |
| --- | --- |
| **Data layer** | Structure & format of content files the app needs (projects + profile/portfolio), organized per PROG-62 / July-17 sync target. |
| **Input layer** | How that content enters the app: remote sync script, CI sync-then-build, then Astro Content Collections (+ adapter). |

### PROG-62 — Work on the data layer & input layer
- **Status:** Deferred umbrella (Todo) — entry for this Wayfinder map
- **Linear:** [PROG-62](https://linear.app/general-stuff/issue/PROG-62/work-on-the-data-layer-and-input-layer)
- **Description:** Points at project comments + deferred section; no AC of its own. Entry ticket for the sync → collections → adapter wave.
- **Comments:** None on the issue; substance lives on **project comments** (esp. 2026-07-17 sync flow).

### Canonical sync target (project comment 2026-07-17) — deferred implementation
- **Status:** Deferred implementation (folder baseline + Project in-file / `git-meta` merge **locked** via PROG-77/78/80 grilling; Profile collection shape locked PROG-78; adapter/loader seat finishing on PROG-79)
- **Citation:** Linear project comment on Personal Project Portfolio; attachment “Portfolio content sync flow”
- **Folder baseline (agreed):** live `src/content/projects/<project-id>/` + `src/content/profile/` (generated/gitignored). Committed fixtures SoT: `src/content/placeholder/` (same shapes). Profile root naming supersedes July-17 `portfolio/`.
- **Richer description:** Fetch per-project files into live `./src/content/projects/<slug>/`; fetch profile into live `./src/content/profile/*`. Local: `bun run sync:dev` materializes `placeholder/` → live roots. Then Collections + thin adapter (PROG-79).
- **Sub-deferreds called out in that comment:**
  1. **Immutable fetch** — do not rewrite fetched markdown after sync. **Locked.**
  2. **Git sidecar** — version/release-date in `git-meta.json`, not merged into `project.md`. **Locked (PROG-80).**
  3. **Status SoT** — frontmatter in `project.md`; **do not** use git notes for status. **Locked.**
  4. **CI sync-then-build** — **wired** in `.github/workflows/deploy.yml` (`bun run sync` before build; PAT via `PORTFOLIO_GITHUB_TOKEN` → env `GITHUB_TOKEN`). PR CI uses `bun run sync:dev` (fixtures). Live roots not committed.
  5. **GH Actions version/status automation across source repos** — deferred; until then sync→sidecar for version/date; status edited in frontmatter.
  6. **Auth / rate-limit** — grill + ADR (private repos local+CI; GH API limits without auth). Auth shape largely locked; backoff policy still open.
  7. **Failure policy** — fail-closed (grilling). **Locked.**
  8. **Supersede ADR-0001** when sync+collections replace TS modules as store.
  9. **Sidecar filename/schema** + merge `project.md` + `git-meta` → domain `Project`. **Locked (PROG-80)**; assembly in **projects Content Layer loader** (PROG-79), not adapter-only.
  10. **Whether profile fields fully replace `src/data/profile.ts`** (yes as live store; bootstrap TS remains until owner deletes).
- **Known gaps vs live app:** omit-field cleanup + About avatar + homepage email-only CTA → **PROG-82 Done**; adapter keep/thin → **PROG-79 Done**. Project/`git-meta` merge rules locked on PROG-80. Remaining = post-map implementation.

### Portfolio vs personal content split
- **Status:** **Decided (grilling)** — one Profile root only
- **Decision:** Use `src/content/profile/` (wording: Profile, not portfolio folder). No `personal/` tree in this map. Site is a personal work showcase, not a product for external consumers.
- **Linear activity (historical):** Project comment 2026-07-20 asked portfolio vs personal; July-17 used `portfolio.md` + `./src/content/portfolio/*` — **superseded by Profile root naming**.
- **Citation:** Project comments; [PROG-20](https://linear.app/general-stuff/issue/PROG-20/sync-script-changes-for-updated-implementation) Steps 14 / personal path (stale path names).

### PROG-20 — Sync Script Changes for updated Implementation
- **Status:** **Canceled** (PROG-81 disposition) — superseded historical pointer
- **Linear:** [PROG-20](https://linear.app/general-stuff/issue/PROG-20/sync-script-changes-for-updated-implementation)
- **Description:** Older step-by-step rewrite (mutate `project.md` with git tag/notes data; git notes for status; `architecture.ts`; personal path). **Superseded** by July-17 + PROG-75 map locks (76–80). Do **not** implement from this ticket.
- **Historical keep (now in map locks):** folder-per-project under `src/content/projects/<id>`, category in frontmatter, no JSON parse of MD; tags via GitHub API → `git-meta.json` (PROG-76/80 — not “git CLI only”).
- **Dismissed:** mutate `project.md` with git fields; status from git notes; in-memory-only merge; personal/`portfolio` path names.

### PROG-16 — Correction of Inputs & Scripts (child of PROG-9)
- **Status:** **Canceled** (PROG-81 disposition) — superseded historical pointer
- **Linear:** [PROG-16](https://linear.app/general-stuff/issue/PROG-16/correction-of-inputs-and-scripts)
- **Done before cancel:** project.md template + script discrepancy fixes.
- **Superseded open checklist:** Content Collections schema / folder-wise imports / git tags→`project.md` → PROG-75 locks. Vague Icons/Fonts residual **not** re-ticketed. Image *rendering* → post-map [PROG-84](https://linear.app/general-stuff/issue/PROG-84/wire-resolved-previewphoto-into-ui-with-astroassets) (`astro:assets`).

### PROG-9 — Make Corrections & Tweaks to the Gen
- **Status:** **Canceled** (PROG-81 disposition) — empty parent; superseded historical pointer
- **Linear:** [PROG-9](https://linear.app/general-stuff/issue/PROG-9/make-corrections-and-tweaks-to-the-gen)
- **Citation:** [PROG-81](https://linear.app/general-stuff/issue/PROG-81/decide-how-prog-9-prog-16-prog-20-relate-to-this-map) Answer — authority = PROG-75 + July-17 + Done map children.

### CI: same sync script vs “native” GH Actions aggregation
- **Status:** Decided keep (same script in CI) — from question → July-17 answer
- **Linear:** Project comment 2026-07-05 (question) → 2026-07-17 (same script local+CI)
- **Keep:** one sync script everywhere for consistency.
- **Still deferred:** separate GH Actions that *push version/status conventions into source repos*.
- **Grilling 2026-07-25:** fail-closed on any remote failure; private-repo fetch required (auth mechanism TBD).

### Project-level presentation state (`published` | `learning` | `hidden`)
- **Status:** **Canceled** (2026-07-26) — owner: not needed
- **Linear:** [PROG-85](https://linear.app/general-stuff/issue/PROG-85/project-presentation-flags-published-or-learning-or-hidden) (Canceled); [document](https://linear.app/general-stuff/document/canceled-project-level-presentation-state-8adaf9c5c74a)
- **Repo:** `docs/research/deferred-project-presentation.md`
- **Reason:** Visibility stays with the fetch/repo list; do not add an in-catalog `presentation?` enum.

### ADR-0001 content-as-code — intentional keep (interim)
- **Status:** Superseded — [ADR 0003](../../.agents/codebase/adr/0003-content-collections-and-sync.md) Accepted
- **Citation:** `.agents/codebase/adr/0001-content-as-code.md` (historical), `0003-content-collections-and-sync.md`
- **Keep:** pages via thin exclusive adapter; no CMS/DB; fetch only for locked GitHub sync.
- **Dismissed:** Headless CMS; React Query loaders for static content; long-term `src/data/*.ts` store.

### Content Collections as required end-state (not long-term `src/data/*.ts`)
- **Status:** Landed (Collections + sync + adapter; `src/data` shims removed)
- **Citation:** ADR 0003; PROG-62 implementation; project comment 2026-07-17
- **Key comment:** “Content Collections: required path (not long-term `src/data/*.ts` as the store).”

---

## 2. Astro / Content Collections

**In scope for the same Wayfinder map as §1** (Input layer’s in-app side). Not a separate wave.

### Content Collections migration (schema + adapter swap)
- **Status:** Deferred → entering Wayfinder with §1 (parked through PROG-43 and PROG-44 until now); **Collections agreed** (grilling); **Profile collection shape locked (PROG-78 Done)**; **adapter/loader seat locked (PROG-79 Done)**; **git-meta schema + Project merge locked (PROG-80 Done)**
- **Linear:** Called out on [PROG-43](https://linear.app/general-stuff/issue/PROG-43/astro-ui-modernization), [PROG-44](https://linear.app/general-stuff/issue/PROG-44/t1-port-latest-lovable-export-into-portfolio); former PROG-16 checklist superseded (PROG-81); Profile model [PROG-78](https://linear.app/general-stuff/issue/PROG-78/choose-how-profile-is-modeled-in-content-collections); preview/photo UI wiring [PROG-84](https://linear.app/general-stuff/issue/PROG-84/wire-resolved-previewphoto-into-ui-with-astroassets) (post-map)
- **Docs:** ADR-0002 Notes (PROG-44); `src/content/adapter.ts` comment (“Swap … for Content Collections”); `docs/research/t3-architecture-deepening.md` §4 non-goals; `docs/research/deferred-project-presentation.md` (later Zod schema); PROG-77 field map
- **Description:** Zod collections for projects (+ profile); pages either via adapter or direct Collections (decide in map). Reopens ADR-0001 when adopted.
- **Profile lock (PROG-78):** single-entry content collection `profile` → only `profile.md` (id `profile`, fail if not exactly one); Zod nested FM; body ignored; binaries co-located not entries; photo>avatar token; cert `file` Profile-root-relative; dangling `file` fail-closed.
- **PROG-44 comment:** “parked ADR upgrades deferred post-port” — Collections stayed parked after Done.

### PROG-34 — Try Astro Content Collections management apps & workflows
- **Status:** Deferred exploration (Todo)
- **Linear:** [PROG-34](https://linear.app/general-stuff/issue/PROG-34/try-astro-content-collections-management-apps-and-workflows-for-astro)
- **Description:** Try [astro-editor](https://github.com/dannysmith/astro-editor) (Zod→forms); try MDX content files; add to My Setups if they fit. No comments.

### Adapter as collections-ready seam — decide in this map
- **Status:** **Decided (PROG-79 Done)** — keep thin exclusive adapter; loaders own store assembly; plain direct-Collections-on-pages rejected
- **Linear:** [PROG-79](https://linear.app/general-stuff/issue/PROG-79/decide-whether-the-content-adapter-stays) Answer
- **Citation:** ADR-0001/0002; `module-seams.md` content seam; T3 deepen P2
- **Lock:** Pages → adapter getters only (no `astro:content`). Loaders assemble domain-shaped collection `data` (projects: FM/body/git-meta flatten/architecture/preview win; profile: FM/photo win/cert prefer-file/paths). Adapter keeps `getFeaturedProjects` + brand-catalog assert; drop mandatory `profile-display` / learning barrel. Domain types: `src/content/types/{project,profile}.ts` for islands. Rename `adapter.ts` optional. Implement post-map.

### PROG-45 — Living docs refresh (includes Collections vs adapter baseline)
- **Status:** Deferred/backlog (blocked by T6 historically; docs-only when unblocked)
- **Linear:** [PROG-45](https://linear.app/general-stuff/issue/PROG-45/t7-refresh-living-docs-after-modernization-and-lovable-port)
- **Relevance:** Must re-baseline “adapter vs Content Collections, Starwind inventory, … theme/prose”; update `docs/data-model.md` (still mentions react-markdown / `src/routes` — drift).
- **Project comment:** Docs/ADR drift update when sync+collections land.

### Human `docs/data-model.md` — stale vs Astro reality
- **Status:** Deferred fix under PROG-45 (not a separate ticket)
- **Citation:** `docs/data-model.md` (react-markdown, `src/routes/*`); agent docs say marked SSG + adapter.

### Optional-content / learning — mostly Done; not Collections
- **Status:** Done for About/home resilience (PROG-58); project `presentation` still deferred (above)
- **Related research:** `docs/research/optional-content-seams.md` (PROG-66)
- **Note:** Do not conflate with Collections migration.

---

## 3. Starwind / UI hybrid

### ADR-0002 hybrid — intentional keep
- **Status:** Keep
- **Citation:** `.agents/codebase/adr/0002-astro-starwind-shadcn-hybrid.md`, `architecture.md`
- **Keep:** Astro SSG; Starwind/static shell; shadcn Base UI React islands for toolbar/calendar/diagram/accordion; About dialogs = Starwind (PROG-43); Iconify + Astro Fonts; custom theme key + motion/ambient persistence.
- **T3:** “Starwind vs shadcn hybrid — Policy is ADR-0002; no deepen without a new ADR” (`docs/research/t3-architecture-deepening.md`).

### Starwind `theme-toggle` — deferred (keep custom ThemeToggle)
- **Status:** Deferred / intentional keep of custom
- **Linear:** PROG-43 deferral → PROG-44 parked; still deferred after PROG-44 Done
- **Docs:** ADR-0002 §3 + Notes; migration plans
- **Why:** Custom `theme` localStorage + default dark + FOUC script; Starwind toggle not equivalent out of the box.

### Starwind Prose — deferred (keep `@tailwindcss/typography` + `marked` SSG)
- **Status:** Deferred / intentional keep of marked
- **Linear:** PROG-43/44 parked
- **Docs:** ADR-0002 §4; `route-trace.md` (not Starwind Prose)
- **Follow-up:** `react-markdown` drift audit → living docs / PROG-45 (not a port blocker).

### Broader Starwind expansion / visual restyle — deferred
- **Status:** Deferred
- **Linear:** PROG-43 AC deferred list; PROG-43 completion comment; PROG-44 known deferrals
- **Shipped already (keep):** About Starwind dialogs; Starwind Button on 404/Navbar/Footer; mild drift only — not page-wide restyle.

### Pixel-perfect Radix about-dialog islands — dismissed
- **Status:** Dismissed / superseded
- **Citation:** ADR-0002 Notes (PROG-43); older finish-line plan wanted Radix back — **overridden**; Starwind dialogs retained through Lovable port (PROG-44 comments: “keep Starwind about dialogs”).

### Full Starwind (zero React) — rejected
- **Status:** Rejected in favor of hybrid
- **Citation:** `.cursor/plans/astro_starwind_migration*.plan.md` — calendar/ReactFlow/controlled accordion require islands.

### T4 Starwind-adjacent keeps / deferred
- **Keep:** `tailwind-variants` for Starwind button/dialog
- **Deferred (out of T4):** rewriting Starwind
- **Done since T4 notes:** collapsing Lucide into one unplugin pipeline (`UiIcon` / `~icons/lucide/*`; no `lucide-react`)
- **Citation:** `docs/research/t3-architecture-deepening.md` §2

### Astryx / Stylex design-system experiment
- **Status:** Research complete (structure guide only — **do not** adopt Astryx or Stylex libraries)
- **Owner intent (project comment 2026-07-20):** use Astryx/Stylex as guides for design-system **structure** (tokens, themes/accents, components); not implement those libraries
- **Research asset:** `docs/research/design-system-structure-astryx-stylex-guide.md`
- **Note:** Adjacent to Starwind/hybrid; not ADR-0002 work; not in the catch-up spine until owner guides next

---

## Cross-links & superseded decisions (quick map)

| Topic | Current authoritative stance | Supersedes |
| --- | --- | --- |
| Status source | Frontmatter in `project.md` | PROG-20 git-notes status (ticket canceled) |
| Git metadata | `git-meta.json` exact `{ version, releaseDate }` (PROG-80); optional at read (missing → synthesize `unreleased`+now); loader merge | Mutating `project.md` / in-memory-only merge |
| PROG-9 / 16 / 20 | Historical pointers only (Canceled; PROG-81) | Implementing sync/Collections from those tickets |
| Preview/photo UI | Post-map [PROG-84](https://linear.app/general-stuff/issue/PROG-84/wire-resolved-previewphoto-into-ui-with-astroassets) (`astro:assets`) | PROG-16 vague “Images” residual |
| Content store (future) | Collections under `src/content/**` via sync | Long-term `src/data/*.ts` as store |
| Content store (today) | ADR-0001 TS modules + adapter | — |
| Theme | Custom toggle | Starwind `theme-toggle` |
| Markdown | `marked` + typography | Starwind Prose; react-markdown island |
| About dialogs | Starwind static | Radix dialog island |
| CI aggregation | Same sync script in Actions | Separate “native-only” aggregation path |

---

## Ticket index (this bucket)

| ID | Role in this group | Linear status |
| --- | --- | --- |
| PROG-62 | Umbrella data/input | Todo |
| PROG-9 / 16 / 20 | Gen corrections + sync rewrite | **Canceled** (PROG-81; historical pointers) |
| PROG-81 | Disposition of 9/16/20 vs map | Done |
| PROG-84 | Wire preview/photo UI via `astro:assets` | Backlog (post-map; blocked by PROG-75) |
| PROG-34 | Collections tooling (astro-editor/MDX) | Todo |
| PROG-43 | Shipped hybrid; deferred theme/prose/Starwind+/Collections | Done |
| PROG-44 | Port Done; parked ADR upgrades stayed deferred | Done |
| PROG-45 | Docs re-baseline incl. Collections/Starwind/theme/prose | Backlog |
| PROG-85 | Project `presentation` flags | **Canceled** |
