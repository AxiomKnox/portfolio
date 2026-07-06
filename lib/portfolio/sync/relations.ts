import type { ParsedProjectSource } from "./types";
import { slugify } from "./utils";

export interface ProjectIndexEntry {
	id: string;
	slug: string;
	name: string;
}

export function buildProjectIndex(projects: ParsedProjectSource[]): ProjectIndexEntry[] {
	return projects.map((p) => ({
		id: p.id,
		slug: slugify(p.name),
		name: p.name,
	}));
}

function resolveRelatedId(
	reference: string,
	index: ProjectIndexEntry[],
): string | null {
	const trimmed = reference.trim();
	const byId = index.find((p) => p.id === trimmed);
	if (byId) return byId.id;

	const lower = trimmed.toLowerCase();
	const byName = index.find((p) => p.name.toLowerCase() === lower);
	if (byName) return byName.id;

	const bySlug = index.find((p) => p.slug === slugify(trimmed));
	if (bySlug) return bySlug.id;

	return null;
}

export function normalizeRelations(
	projects: ParsedProjectSource[],
): Map<string, string[]> {
	const index = buildProjectIndex(projects);
	const graph = new Map<string, Set<string>>();

	for (const project of projects) {
		if (!graph.has(project.id)) graph.set(project.id, new Set());
		for (const ref of project.relatedProjects) {
			const targetId = resolveRelatedId(ref, index);
			if (!targetId || targetId === project.id) continue;

			graph.get(project.id)!.add(targetId);
			if (!graph.has(targetId)) graph.set(targetId, new Set());
			graph.get(targetId)!.add(project.id);
		}
	}

	const result = new Map<string, string[]>();
	for (const [id, related] of graph) {
		result.set(id, [...related].sort());
	}
	return result;
}
