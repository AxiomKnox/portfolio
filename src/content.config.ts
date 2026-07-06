import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
	architectureDataSchema,
	personalSchema,
	projectSchema,
} from "@portfolio/schema";

const projects = defineCollection({
	loader: glob({ pattern: "**/project.md", base: "./src/content/projects" }),
	schema: projectSchema,
});

const personal = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/personal" }),
	schema: personalSchema,
});

export { architectureDataSchema };
export const collections = { projects, personal };
