import { absoluteUrl } from "@/lib/site";

type ProfileLike = {
  fullName: string;
  bio: string;
  email: string;
  location: string;
  links: { href: string }[];
};

type ProjectLike = {
  id: string;
  title: string;
  summary: string;
  techStack: string[];
  links: { github?: string; live?: string };
  releaseDate: string;
};

export function personJsonLd(
  profile: ProfileLike,
  site?: URL | string | null,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    description: profile.bio,
    url: absoluteUrl("/", site),
    email: profile.email,
    jobTitle: "DevOps, Web & MLOps engineer",
    homeLocation: {
      "@type": "Place",
      name: profile.location,
    },
    sameAs: profile.links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
  };
}

export function projectJsonLd(
  project: ProjectLike,
  authorName: string,
  site?: URL | string | null,
): Record<string, unknown> {
  const pageUrl = absoluteUrl(`/projects/${project.id}`, site);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.summary,
    url: pageUrl,
    datePublished: project.releaseDate,
    programmingLanguage: project.techStack,
    codeRepository: project.links.github,
    author: {
      "@type": "Person",
      name: authorName,
      url: absoluteUrl("/", site),
    },
    ...(project.links.live ? { discussionUrl: project.links.live } : {}),
  };
}
