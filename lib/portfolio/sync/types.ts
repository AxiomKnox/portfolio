import type { ProjectCategory, ProjectStatus } from "../schema";

export interface ParsedProjectSource {
	id: string;
	name: string;
	category: ProjectCategory;
	type: string;
	summary: string;
	description: string;
	architectureDescription: string;
	techStack: string[];
	relatedProjects: string[];
	repoUrl?: string;
	liveUrl?: string;
	sourceDir?: string;
	remoteBranch?: string;
}

export interface ReleaseInfo {
	version: string;
	status: ProjectStatus;
	releaseDate: string;
}

export interface SyncProjectConfig {
	localDir: string;
	remoteRepos: {
		owner: string;
		repo: string;
		branch?: string;
		path?: string;
	}[];
}

export interface SyncConfig {
	rootDir: string;
	projectsOut: string;
	personalOut: string;
	portfolioPath: string;
	projectConfigPath: string;
	githubToken?: string;
}
