import { describe, expect, it } from "vitest";
import { normalizeRelations } from "@portfolio/sync/relations";
import type { ParsedProjectSource } from "@portfolio/sync/types";

function makeProject(
	id: string,
	name: string,
	related: string[],
): ParsedProjectSource {
	return {
		id,
		name,
		category: "devops",
		type: "Project",
		summary: "summary",
		description: "description",
		architectureDescription: "",
		techStack: [],
		relatedProjects: related,
	};
}

describe("normalizeRelations", () => {
	it("ensures A lists B implies B lists A", () => {
		const projects = [
			makeProject("PROJ-001", "Alpha Service", ["Beta Service"]),
			makeProject("PROJ-002", "Beta Service", []),
		];

		const graph = normalizeRelations(projects);

		expect(graph.get("PROJ-001")).toEqual(["PROJ-002"]);
		expect(graph.get("PROJ-002")).toEqual(["PROJ-001"]);
	});

	it("resolves relations by project id", () => {
		const projects = [
			makeProject("PROJ-001", "Alpha", ["PROJ-002"]),
			makeProject("PROJ-002", "Beta", []),
		];

		const graph = normalizeRelations(projects);
		expect(graph.get("PROJ-001")).toContain("PROJ-002");
		expect(graph.get("PROJ-002")).toContain("PROJ-001");
	});
});
