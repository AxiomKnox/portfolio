// Considering Splitting this into 2 projects.ts & sitedata.ts

import { Project} from "../types/project";
import { SiteData } from "../types/personal";
import generatedProjects from "./../content/generated-projects.json";

export const SITE_DATA: SiteData = {
	firstName: "A",
	lastName: "K",
	shortInitials: "AK",
	longInitials: "A K",
	role: "Backend Developer & DevOps Engineer",
	location: "Pune, IN",
	email: "hello@gmail.com",
	socials: {
		github: "https://github.com/yourusername",
		linkedin: "https://linkedin.com/in/yourusername",
	},
	resumeUrl: "/resume.pdf", // Place your resume.pdf in the public folder
	heroSection:
		"I'm a software engineer specializing in DevOps, backend systems, and machine learning infrastructure. I build tools that help teams ship faster and more reliably.",
	aboutMe: {
		1: "I am a fresher focused on the intersection of reliable infrastructure and robust backend architecture. I'm enthusiastic about building scalable and reliable systems.",
		2: "My philosophy is rooted in technical honesty - there's no substitute for clean code, optimized performance, and thoughtful developer experience.",
	}
};

export const PROJECTS: Project[] = generatedProjects as Project[];

export const SKILLS = [
	{
		category: "Languages",
		items: ["TypeScript", "Python"],
	},
	{
		category: "Backend",
		items: ["PostgreSQL", "Redis", "GraphQL", "tRPC"],
	},
	{
		category: "DevOps",
		items: ["AWS", "Terraform", "Kubernetes", "Docker", "GitHub Actions"],
	},
	{
		category: "Machine Learning",
		items: ["NumPy", "Pandas", "Seaborn", "Jupyter" ],
	},
];
