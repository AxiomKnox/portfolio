import type { ProjectCategory } from "../schema";
import type { ParsedProjectSource } from "./types";
import { normalizeId, parseCategoryLabel, slugify } from "./utils";

export function parseProjectMarkdown(markdown: string): ParsedProjectSource | null {
	const lines = markdown.split("\n");
	let currentSection = "";
	let currentSubsection = "";

	let id = "";
	let name = "";
	let category: ProjectCategory | null = null;
	let type = "";
	let summary = "";
	const descriptionLines: string[] = [];
	const techStack: string[] = [];
	const relatedProjects: string[] = [];
	let architectureDescription = "";
	let repoUrl = "";
	let liveUrl = "";

	for (const line of lines) {
		if (line.startsWith("# ")) {
			name = line.replace(/^# /, "").trim();
			currentSection = "";
			currentSubsection = "";
		} else if (line.startsWith("## ")) {
			currentSection = line.replace(/^## /, "").trim().toLowerCase();
			currentSubsection = "";
		} else if (line.startsWith("### ")) {
			currentSubsection = line.replace(/^### /, "").trim();
		} else if (line.trim() !== "") {
			const text = line.trim();
			if (text.startsWith("> e.g.")) continue;

			switch (currentSection) {
				case "project id":
					id = normalizeId(text);
					break;
				case "properties":
					if (currentSubsection.toLowerCase() === "project category") {
						category = parseCategoryLabel(text);
					} else if (currentSubsection.toLowerCase() === "project type") {
						type = text;
					}
					break;
				case "project type":
					type = text;
					break;
				case "summary":
					if (!text.startsWith("[")) summary += `${text} `;
					break;
				case "details":
					if (!text.startsWith("[")) descriptionLines.push(text);
					break;
				case "architecture":
					if (!text.startsWith("[")) architectureDescription += `${text} `;
					break;
				case "tech stack":
					if (text.startsWith("- ")) {
						const tech = text.replace(/^- (.*?:)?/, "").trim();
						if (!tech.startsWith("[")) techStack.push(tech);
					}
					break;
				case "links":
					if (text.toLowerCase().includes("repository:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) repoUrl = match[1];
					} else if (text.toLowerCase().includes("live page:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) liveUrl = match[1];
					}
					break;
				case "project relation":
					if (!text.startsWith("[")) relatedProjects.push(text.trim());
					break;
			}
		}
	}

	if (!name) return null;
	if (!id) id = `PROJ-UNK-${slugify(name).toUpperCase().slice(0, 3)}`;
	if (!category) {
		throw new Error(
			`Project "${name}" is missing or has an invalid ## Project Category (expected DevOps, WebApp, or ML / MLOps)`,
		);
	}

	return {
		id,
		name,
		category,
		type: type || "Project",
		summary: summary.trim() || "No summary provided.",
		description: descriptionLines.join("\n\n") || "No details provided.",
		architectureDescription: architectureDescription.trim(),
		techStack: techStack.length ? techStack : ["Not specified"],
		relatedProjects,
		repoUrl: repoUrl || undefined,
		liveUrl: liveUrl || undefined,
	};
}
