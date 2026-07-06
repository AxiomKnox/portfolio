import type { ProjectCategory, ProjectStatus } from "@portfolio/schema";

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
	devops: "DevOps",
	webapp: "WebApp",
	mlops: "ML / MLOps",
};

const CATEGORY_CLASSES: Record<ProjectCategory, string> = {
	devops: "cat-devops",
	webapp: "cat-webapp",
	mlops: "cat-mlops",
};

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
	devops: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
	webapp: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
	mlops: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
	dev: "Dev",
	alpha: "Alpha",
	beta: "Beta",
	rc: "RC",
	prod: "Production",
	archived: "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
	prod: "bg-green-500/10 text-green-600 dark:text-green-400",
	alpha: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
	beta: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	rc: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	dev: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export function getCategoryLabel(category: ProjectCategory): string {
	return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryClass(category: ProjectCategory): string {
	return CATEGORY_CLASSES[category] ?? "italic";
}

export function getCategoryColor(category: ProjectCategory): string {
	return CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground";
}

export function getStatusLabel(status: ProjectStatus | string): string {
	if (status in STATUS_LABELS) {
		return STATUS_LABELS[status as ProjectStatus];
	}
	return status;
}

export function getStatusColor(status: ProjectStatus | string): string {
	if (status in STATUS_COLORS) {
		return STATUS_COLORS[status as ProjectStatus];
	}
	return "bg-muted text-muted-foreground";
}
