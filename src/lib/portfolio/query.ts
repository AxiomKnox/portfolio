import fs from "node:fs";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import type { ArchitectureData as DiagramData } from "@/components/project/ArchitectureDiagram";
import { architectureDataSchema } from "@portfolio/schema";

export type Project = CollectionEntry<"projects">;
export type Personal = CollectionEntry<"personal">;

const architectureModules = import.meta.glob(
	"../content/projects/*/architecture.json",
);

export async function queryProjects(): Promise<Project[]> {
	return getCollection("projects");
}

export async function getProjectDetail(slug: string): Promise<Project | undefined> {
	const projects = await queryProjects();
	return projects.find((p) => p.data.slug === slug);
}

export async function getHomepageProjects(): Promise<Project[]> {
	const projects = await queryProjects();
	return [...projects]
		.sort((a, b) => b.data.releaseDate.getTime() - a.data.releaseDate.getTime())
		.slice(0, 3);
}

export async function getPersonal(): Promise<Personal | undefined> {
	const entries = await getCollection("personal");
	return entries[0];
}

export async function getRelatedProjects(project: Project): Promise<Project[]> {
	const projects = await queryProjects();
	const relatedIds = new Set(project.data.relatedProjects);
	return projects.filter((p) => relatedIds.has(p.data.id));
}

export async function getArchitectureData(slug: string): Promise<DiagramData | undefined> {
	const matchKey = Object.keys(architectureModules).find((key) =>
		key.includes(`/projects/${slug}/`),
	);
	if (matchKey) {
		const mod = await architectureModules[matchKey]();
		const data = (mod as { default?: unknown }).default ?? mod;
		return architectureDataSchema.parse(data) as DiagramData;
	}

	const jsonPath = path.join(
		process.cwd(),
		"src/content/projects",
		slug,
		"architecture.json",
	);
	if (fs.existsSync(jsonPath)) {
		const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
		return architectureDataSchema.parse(raw) as DiagramData;
	}

	return undefined;
}
