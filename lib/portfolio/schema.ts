import { z } from "astro/zod";

export const projectCategorySchema = z.enum(["devops", "webapp", "mlops"]);
export type ProjectCategory = z.infer<typeof projectCategorySchema>;

export const projectStatusSchema = z.enum([
	"dev",
	"alpha",
	"beta",
	"rc",
	"prod",
	"archived",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const architectureStepSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
});

const architectureNodeSchema = z
	.object({
		id: z.string(),
		position: z.object({ x: z.number(), y: z.number() }),
		data: z.record(z.string(), z.unknown()),
	})
	.passthrough();

const architectureEdgeSchema = z
	.object({
		id: z.string(),
		source: z.string(),
		target: z.string(),
	})
	.passthrough();

export const architectureDataSchema = z.object({
	nodes: z.array(architectureNodeSchema),
	edges: z.array(architectureEdgeSchema),
	steps: z.array(architectureStepSchema),
});

export type ArchitectureStep = z.infer<typeof architectureStepSchema>;
export type ArchitectureData = z.infer<typeof architectureDataSchema>;

export const projectSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	category: projectCategorySchema,
	type: z.string().default(""),
	summary: z.string(),
	techStack: z.array(z.string()).default([]),
	relatedProjects: z.array(z.string()).default([]),
	previewImage: z.string().optional(),
	repoUrl: z.string().url().optional(),
	liveUrl: z.string().url().optional(),
	version: z.string().default("0.1.0"),
	status: projectStatusSchema.default("dev"),
	releaseDate: z.coerce.date().default(new Date("2025-01-01")),
	architectureDescription: z.string().optional(),
});

export type ProjectData = z.infer<typeof projectSchema>;

export const skillGroupSchema = z.object({
	category: z.string(),
	items: z.array(z.string()),
});

export const experienceEntrySchema = z.object({
	title: z.string(),
	company: z.string(),
	location: z.string(),
	description: z.string(),
	duration: z.string(),
});

export const certificationEntrySchema = z.object({
	name: z.string(),
	issuer: z.string().optional(),
	url: z.string().url().optional(),
});

export const personalSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	shortInitials: z.string(),
	longInitials: z.string(),
	role: z.string(),
	location: z.string(),
	email: z.string().email(),
	github: z.string().url(),
	linkedin: z.string().url(),
	resumeUrl: z.string().default("/resume.pdf"),
	heroSection: z.string(),
	heroAdditionalText: z.string().default(""),
	aboutParagraphs: z.array(z.string()).default([]),
	skills: z.array(skillGroupSchema).default([]),
	experience: z.array(experienceEntrySchema).default([]),
	certifications: z.array(certificationEntrySchema).default([]),
	yearsOfExperience: z.string().optional(),
	education: z.string().optional(),
});

export type PersonalData = z.infer<typeof personalSchema>;
