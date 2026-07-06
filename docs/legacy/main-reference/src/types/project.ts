export type ProjectCategory = "backend" | "devops" | "system" | "mlops";
export type ProjectStatus =
	| "ALPHA"
	| "BETA"
	| "PROD"
	| "ARCHIVED"
	| "Operational"
	| "Work In Progress";

export interface ProjectAction {
	label: string;
	url: string;
	icon: string;
}

export interface Project {
	id: string; // e.g. PROJ-BE-001-PROD
	slug: string;
	name: string;
	category: ProjectCategory;
	status: ProjectStatus;
	summary: string;
	description: string[];
	techStack: string[];
	architecture?: {
		image?: string;
		description: string;
	};
	githubUrl?: string;
	liveUrl?: string;
	featured?: boolean;
}

