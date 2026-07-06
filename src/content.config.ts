import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const projectCategory = z.enum(["backend", "devops", "mlops"]);
const projectStatus = z.enum(["Alpha", "Beta", "Production", "Development", "Archived"]);

const projects = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	schema: z.object({
		id: z.string(),
		slug: z.string(),
		name: z.string(),
		category: projectCategory,
		type: z.string().default(""),
		summary: z.string(),
		techStack: z.array(z.string()).default([]),
		relatedProjects: z.array(z.string()).default([]),
		previewImage: z.string().optional(),
		repoUrl: z.string().url().optional(),
		liveUrl: z.string().url().optional(),
		featured: z.boolean().default(false),
		version: z.string().default("0.1.0"),
		status: projectStatus.default("Development"),
		releaseDate: z.coerce.date().default(new Date('2025-01-01')),
		architectureDescription: z.string().optional(),
	}),
});

const skillGroup = z.object({
	category: z.string(),
	items: z.array(z.string()),
});

const experienceEntry = z.object({
	title: z.string(),
	company: z.string(),
	location: z.string(),
	description: z.string(),
	duration: z.string(),
});

const certificationEntry = z.object({
	name: z.string(),
	issuer: z.string().optional(),
	url: z.string().url().optional(),
});

const personal = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/personal" }),
	schema: z.object({
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
		aboutParagraphs: z.array(z.string()).default([]),
		skills: z.array(skillGroup).default([]),
		experience: z.array(experienceEntry).default([]),
		certifications: z.array(certificationEntry).default([]),
		yearsOfExperience: z.string().optional(),
		education: z.string().optional(),
	}),
});

export const collections = { projects, personal };
