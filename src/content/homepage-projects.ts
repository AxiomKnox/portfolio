import type { Project } from "@/content/types";
import { sortDate } from "@/content/types";

function byRecencyDesc(a: Project, b: Project): number {
  return sortDate(b).localeCompare(sortDate(a));
}

/**
 * Homepage featured/recent strip: prefer `featured` projects, fill up to `limit`
 * with the most recent non-featured so the section stays dense when few are starred.
 *
 * - No featured → `limit` most recent projects.
 * - Some featured → featured first (by recency), then non-featured by recency.
 * - More featured than `limit` → `limit` most recent featured only.
 */
export function selectHomepageProjects(projects: readonly Project[], limit = 3): Project[] {
  if (limit <= 0 || projects.length === 0) return [];

  const featured = projects.filter((p) => p.featured === true).sort(byRecencyDesc);
  if (featured.length === 0) {
    return [...projects].sort(byRecencyDesc).slice(0, limit);
  }

  const featuredIds = new Set(featured.map((p) => p.id));
  const fillers = projects.filter((p) => !featuredIds.has(p.id)).sort(byRecencyDesc);

  return [...featured, ...fillers].slice(0, limit);
}
