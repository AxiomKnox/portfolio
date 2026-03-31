import projectsJson from "@/content/projects.json"
import type { Project, ProjectCategory } from "@/types/project"

export const projects: Project[] = projectsJson as Project[]

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  if (!slug) {
    return undefined
  }

  return projects.find((project) => project.slug === slug)
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category)
}

export function getFeaturedByCategory(
  category: ProjectCategory,
  limit: number
): Project[] {
  return getProjectsByCategory(category).slice(0, limit)
}
