import { defineCollection } from "astro:content";
import { profileLoader } from "@/content/loaders/profile";
import { projectsLoader } from "@/content/loaders/projects";

const projects = defineCollection({
  loader: projectsLoader(),
});

const profile = defineCollection({
  loader: profileLoader(),
});

export const collections = { projects, profile };
