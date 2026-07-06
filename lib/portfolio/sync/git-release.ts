import type { ProjectStatus } from "../schema";
import type { ReleaseInfo } from "./types";

export interface GitTag {
	name: string;
	commitSha: string;
	date?: string;
}

export interface GitReleaseInput {
	mainHeadSha: string;
	note: string | null;
	tags: GitTag[];
}

const VALID_STATUSES = new Set<ProjectStatus>([
	"dev",
	"alpha",
	"beta",
	"rc",
	"prod",
	"archived",
]);

export function parseSemverTag(tag: string): { major: number; minor: number; patch: number; raw: string } {
	const cleaned = tag.replace(/^v/, "").split("-")[0].split("+")[0];
	const [major, minor, patch] = cleaned.split(".").map((n) => Number(n) || 0);
	return { major, minor, patch, raw: cleaned };
}

export function compareSemver(a: string, b: string): number {
	const pa = parseSemverTag(a);
	const pb = parseSemverTag(b);
	for (const key of ["major", "minor", "patch"] as const) {
		const diff = pa[key] - pb[key];
		if (diff !== 0) return diff;
	}
	return 0;
}

export function isProductionVersion(tag: string): boolean {
	const { major } = parseSemverTag(tag);
	return major >= 1;
}

export function statusFromNote(note: string | null): ProjectStatus {
	if (!note) return "dev";
	const normalized = note.trim().toLowerCase();
	if (VALID_STATUSES.has(normalized as ProjectStatus)) {
		return normalized as ProjectStatus;
	}
	return "dev";
}

export function resolveReleaseInfo(input: GitReleaseInput): ReleaseInfo {
	const fallback: ReleaseInfo = {
		version: "0.1.0",
		status: statusFromNote(input.note),
		releaseDate: "2025-01-01",
	};

	const semverTags = input.tags
		.filter((t) => /^v?\d+\.\d+\.\d+/.test(t.name))
		.sort((a, b) => compareSemver(b.name, a.name));

	if (!semverTags.length) return fallback;

	const latest = semverTags[0];
	const { raw } = parseSemverTag(latest.name);
	const status = statusFromNote(input.note);

	const prodTags = semverTags
		.filter((t) => isProductionVersion(t.name))
		.sort((a, b) => compareSemver(a.name, b.name));

	const preProdTags = semverTags
		.filter((t) => !isProductionVersion(t.name))
		.sort((a, b) => compareSemver(b.name, a.name));

	let releaseDate = latest.date?.split("T")[0] ?? "";

	if (status === "prod" || status === "archived") {
		const firstProd = prodTags[0];
		if (firstProd?.date) releaseDate = firstProd.date.split("T")[0];
	} else if (preProdTags[0]?.date) {
		releaseDate = preProdTags[0].date.split("T")[0];
	}

	return {
		version: raw,
		status,
		releaseDate: releaseDate || fallback.releaseDate,
	};
}
