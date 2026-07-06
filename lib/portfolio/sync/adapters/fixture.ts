import fs from "node:fs";
import path from "node:path";
import type { GitTag } from "../git-release";
import type { ReleaseInfo } from "../types";
import { resolveReleaseInfo } from "../git-release";

export interface FixtureReleaseData {
	mainHeadSha: string;
	note: string | null;
	tags: GitTag[];
}

const fixtureReleaseData = new Map<string, FixtureReleaseData>();

export function setFixtureReleaseData(repoUrl: string, data: FixtureReleaseData): void {
	fixtureReleaseData.set(repoUrl, data);
}

export function clearFixtureReleaseData(): void {
	fixtureReleaseData.clear();
}

export function resolveFixtureReleaseInfo(repoUrl?: string): ReleaseInfo {
	const fallback: ReleaseInfo = {
		version: "0.1.0",
		status: "dev",
		releaseDate: "2025-01-01",
	};
	if (!repoUrl) return fallback;

	const data = fixtureReleaseData.get(repoUrl);
	if (!data) return fallback;

	return resolveReleaseInfo(data);
}

export function readLocalProjectMarkdown(dir: string): { content: string; sourceDir: string }[] {
	if (!fs.existsSync(dir)) return [];

	const results: { content: string; sourceDir: string }[] = [];

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			const projectMd = path.join(dir, entry.name, "project.md");
			if (fs.existsSync(projectMd)) {
				results.push({
					content: fs.readFileSync(projectMd, "utf8"),
					sourceDir: path.join(dir, entry.name),
				});
				continue;
			}
		}
		if (entry.isFile() && entry.name.endsWith(".md")) {
			results.push({
				content: fs.readFileSync(path.join(dir, entry.name), "utf8"),
				sourceDir: path.dirname(path.join(dir, entry.name)),
			});
		}
	}

	return results;
}
