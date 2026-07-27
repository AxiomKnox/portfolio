import type { APIRoute } from "astro";
import { getProfile, getProjects } from "@/content/adapter";
import { absoluteUrl } from "@/lib/site";

export const GET: APIRoute = async ({ site }) => {
  const profile = await getProfile();
  const projects = await getProjects();
  const home = absoluteUrl("/", site);
  const about = absoluteUrl("/about", site);
  const projectsIndex = absoluteUrl("/projects", site);

  const projectLines = projects
    .map((p) => {
      const url = absoluteUrl(`/projects/${p.id}`, site);
      return `- [${p.title}](${url}): ${p.summary}`;
    })
    .join("\n");

  const sameAs = profile.links
    .filter((l) => l.href.startsWith("http"))
    .map((l) => `- ${l.label}: ${l.href}`)
    .join("\n");

  const body = `# ${profile.fullName}

> ${profile.tagline}

${profile.bio}

## Pages

- [Home](${home}): Featured work, experience snapshot, and contact
- [Projects](${projectsIndex}): Filterable project index (DevOps, web, ML)
- [About](${about}): Bio, skills, experience, certifications

## Projects

${projectLines}

## Contact & profiles

- Email: ${profile.email}
${sameAs}

## Notes for assistants

- This is a static portfolio (Astro SSG) deployed to GitHub Pages.
- Prefer linking to project detail pages for architecture and tech details.
- Content lives under \`src/content/\` (Collections); there is no CMS or blog feed.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
