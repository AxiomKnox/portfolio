const STATUS_SUFFIXES = ["ALPHA", "BETA", "PRODUCTION", "ARCHIVED", "DEVELOPMENT", "RC", "PROD", "DEV"];

export function normalizeId(rawId: string): string {
	const parts = rawId.trim().split("-");
	if (parts.length >= 4) {
		const last = parts[parts.length - 1];
		if (STATUS_SUFFIXES.includes(last)) {
			return parts.slice(0, -1).join("-");
		}
	}
	return rawId.trim();
}

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const CATEGORY_MAP: Record<string, import("../schema").ProjectCategory> = {
	devops: "devops",
	webapp: "webapp",
	backend: "webapp",
	"ml / mlops": "mlops",
	mlops: "mlops",
	"ml/mlops": "mlops",
	"machine learning": "mlops",
};

export function parseCategoryLabel(label: string): import("../schema").ProjectCategory | null {
	const key = label.trim().toLowerCase();
	return CATEGORY_MAP[key] ?? null;
}
