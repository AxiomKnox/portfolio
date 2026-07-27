# Layouts

Every page is wrapped by `src/layouts/Layout.astro`, which renders
`<Navbar>`, a `<main>` region, and `<Footer>`, plus ambient background and
document metadata. Identity (name, titles, footer) comes from
`getProfile()` — not hardcoded strings. Page content is centered inside
`max-w-6xl px-6`.

## Global chrome

```text
┌──────────────────────────────────────────────────────────┐
│ Navbar (sticky, backdrop-blur)                           │
│  {initials} · {fullName}      Home  Projects  About  ☀  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                       <main>                             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Footer — {fullName} · bio blurb · © year · social icons  │
└──────────────────────────────────────────────────────────┘
```

- Navbar highlights the active route by pathname match. The
  `AI-assisted` pill is visible from `md:` up.
- Footer restates identity, the "built by hand" note, and social links
  rendered through `<BrandIcon>`.


## `/` — Home

```text
┌──────────────────────────────────────────────────────────┐
│ HERO                                                     │
│  • grid backdrop + soft radial primary gradient          │
│  • availability chip (green dot)                         │
│  • tagline (h1)                                          │
│  • bio paragraph                                         │
│  • 3 "what I do" cards (DevOps / Web / ML)               │
│  • CTAs: See the work → · About me                       │
├──────────────────────────────────────────────────────────┤
│ /featured — Recent projects                              │
│  • horizontal snap carousel on mobile                    │
│  • 3-col grid on md+                                     │
├──────────────────────────────────────────────────────────┤
│ /experience — Where I've worked                          │
│  • 3-col timeline on desktop, vertical on mobile         │
│  • current role dot is `bg-primary`                      │
└──────────────────────────────────────────────────────────┘
```

Timeline responsiveness (from an earlier fix): the timeline line is
horizontal on `md:+` (`inset-x-0 top-3 h-px`) and vertical on mobile
(`left-[11px] top-0 bottom-0 w-px`), aligned with the round dot inside
each item's `pl-8`.

## `/projects` — Index

```text
┌──────────────────────────────────────────────────────────┐
│ /projects — Everything I've shipped worth linking to.    │
│ Filter by category, tech, or status. Search supports…    │
├──────────────────────────────────────────────────────────┤
│ [ Category tabs: All · DevOps · Web · ML ]               │
│ [ 🔍 search — tech:"React", year:2024, status:prod ]    │
│                     [Filter n] [Date] [Sort] [▦ ☰] 6 …  │
│ [chip: Prod] [chip: React] [chip: Has source] …          │
├──────────────────────────────────────────────────────────┤
│  Grid (default) or List view                             │
└──────────────────────────────────────────────────────────┘
```

Empty state: dashed-border rounded box with `no matching projects`.

## `/projects/[id]` — Detail

```text
┌──────────────────────────────────────────────────────────┐
│ ← All projects                                           │
│ ┌────────────┐  Category · ● Status                      │
│ │ Preview    │  Project title (h1)                       │
│ │ (image or  │  Summary                                  │
│ │  gradient) │  [ Source ↗ ]  [ Live ↗ ]                 │
│ └────────────┘                                           │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │  Markdown prose  │  │ PROPERTIES                  │   │
│  │  (description)   │  │ Type  · Box   ─────  value  │   │
│  │                  │  │ Status· Act.  ─────  ● lab. │   │
│  │                  │  │ Ver.  · Tag   ─────  pill   │   │
│  │                  │  │ Rel.  · Cal.  ─────  Mmm d  │   │
│  │                  │  │ ─────────────────────────── │   │
│  │                  │  │ TECH STACK                  │   │
│  │                  │  │ [icon]name  [icon]name …    │   │
│  │                  │  ├─────────────────────────────┤   │
│  │                  │  │ ASSOCIATED                  │   │
│  │                  │  │ • Other project      DevOps │   │
│  └──────────────────┘  └─────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ /architecture — How it works                             │
│  ┌───────────ReactFlow─────────┐  ┌──── Steps ────┐      │
│  │ [1 step]→[2]→[3]→[4]→[5]    │  │ 01 Title  ▾   │      │
│  └─────────────────────────────┘  │ 02 Title  ▸   │      │
│                                   └───────────────┘      │
└──────────────────────────────────────────────────────────┘
```

The diagram and the accordion share `selected` state — click a node to
open the matching step, or click a step to highlight the node.

## `/about`

```text
┌──────────────────────────────────────────────────────────┐
│ /about                                                   │
│ ┌──────────┐  {fullName} (h1)                            │
│ │ photo or │  Current role · Company                     │
│ │ gradient │  📍 location · 🕒 years · 🎓 education      │
│ └──────────┘  Bio                                        │
│               [GitHub] [LinkedIn] [Email] [X]            │
├──────────────────────────────────────────────────────────┤
│ /skills — 3 category cards (DevOps · Web · ML)           │
│   each: uppercase mono heading + vertical list of items  │
│   with BrandIcon                                         │
├──────────────────────────────────────────────────────────┤
│ /experience — table-like rows, no cards                  │
│   date column (mono)  |  role · company · location · sum │
├──────────────────────────────────────────────────────────┤
│ /certifications — rows with FileText tile + Preview btn  │
│   Preview opens a Dialog with a placeholder PDF pane     │
├──────────────────────────────────────────────────────────┤
│ /resume — button opens Dialog with placeholder PDF pane  │
├──────────────────────────────────────────────────────────┤
│ /contact — centered CTA, Get in touch (mailto)           │
└──────────────────────────────────────────────────────────┘
```

## Route map

| Route file | URL | Notes |
| --- | --- | --- |
| `src/layouts/Layout.astro` | shell | Head metadata, Navbar/Footer, VT prefs |
| `src/pages/index.astro` | `/` | Home |
| `src/pages/about.astro` | `/about` | About page |
| `src/pages/projects/index.astro` | `/projects` | Index + `ProjectsPageIsland` |
| `src/pages/projects/[id].astro` | `/projects/:id` | Detail (`getStaticPaths` + adapter) |
| `src/pages/404.astro` | 404 | Not-found |
| `src/pages/llms.txt.ts` | `/llms.txt` | Assistant-oriented text |
| `src/pages/robots.txt.ts` | `/robots.txt` | Robots |
