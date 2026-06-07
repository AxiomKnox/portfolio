export type ProjectCategory = "backend" | "devops"

export interface Project {
  slug: string
  name: string
  category: ProjectCategory
  summary: string
  details: string[]
  architecture: string[]
  technologies: string[]
  /** Path relative to site root, e.g. from `public/` */
  previewImage?: string
  websiteUrl?: string
  repositoryUrl: string
}
