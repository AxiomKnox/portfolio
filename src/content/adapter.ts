/**
 * Content seam — Astro pages import from here only.
 * Collections loaders assemble domain-shaped data; this module is the exclusive read API.
 * React islands import domain types from `@/content/types` (client-safe; no astro:content).
 */

import type { CollectionEntry } from "astro:content";
import { getCollection, getEntry } from "astro:content";
import { selectHomepageProjects } from "@/content/homepage-projects";
import type { Profile, Project } from "@/content/types";
import { assertBrandCatalogCoverage } from "@/lib/icon-catalog";

export {
  LEARNING_SIGNALS_ENABLED,
  showLearningSignal,
} from "@/content/learning-signals";
export { selectHomepageProjects } from "@/content/homepage-projects";
export {
  experienceHeadline,
  experienceTimelineEntries,
  shouldShowCertifications,
} from "@/content/profile-display";
export type {
  ArchEdge,
  ArchNode,
  ArchStep,
  Category,
  Profile,
  Project,
  ProjectArchitecture,
  Status,
} from "@/content/types";
export { STATUS_ORDER, sortDate } from "@/content/types";

let catalogAsserted = false;

function assertBrandCatalog(profile: Profile, projects: Project[]) {
  if (catalogAsserted) return;
  const names = new Set<string>();
  for (const project of projects) {
    for (const tech of project.techStack) names.add(tech);
  }
  for (const group of profile.skills) {
    for (const item of group.items) names.add(item);
  }
  for (const link of profile.links) names.add(link.icon);
  assertBrandCatalogCoverage(names);
  catalogAsserted = true;
}

export async function getProfile(): Promise<Profile> {
  const entry = await getEntry("profile", "profile");
  if (!entry) {
    throw new Error('Profile collection must contain exactly one entry with id "profile"');
  }
  // Cross-load projects only until the brand catalog has been asserted once.
  if (!catalogAsserted) {
    const projects = await getCollection("projects");
    assertBrandCatalog(
      entry.data,
      projects.map((p: CollectionEntry<"projects">) => p.data),
    );
  }
  return entry.data;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  const list = projects.map((p: CollectionEntry<"projects">) => p.data);
  // Cross-load profile only until the brand catalog has been asserted once.
  if (!catalogAsserted) {
    const profileEntry = await getEntry("profile", "profile");
    if (!profileEntry) {
      throw new Error('Profile collection must contain exactly one entry with id "profile"');
    }
    assertBrandCatalog(profileEntry.data, list);
  }
  return list;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const entry = await getEntry("projects", id);
  return entry?.data;
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects();
  return selectHomepageProjects(projects, limit);
}
