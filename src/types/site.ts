export interface SkillGroup {
  title: string
  items: string[]
}

export interface SitePerson {
  displayName: string
  tagline: string
  roleLine: string
  summaryParagraphs: string[]
  /** File name under `public/`, e.g. `resume.pdf` */
  resumeFile: string
}

export interface SiteContact {
  githubUrl: string
}

export interface SiteHighlights {
  heroKicker: string
  heroTitle: string
  heroSubtitle: string
  projectsSectionIntro: string
}

export interface SiteFooter {
  note: string
  linkLabel: string
}

export interface SiteMeta {
  aiAssistedLabel: string
}

export interface SiteContent {
  person: SitePerson
  contact: SiteContact
  highlights: SiteHighlights
  skills: SkillGroup[]
  footer: SiteFooter
  meta: SiteMeta
}
