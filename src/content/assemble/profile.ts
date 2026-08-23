import { z } from "astro/zod";
import type { Profile } from "@/content/types/profile";

const certSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  href: z.string().optional(),
  file: z.string().optional(),
});

export const profileFrontmatterSchema = z.object({
  initials: z.string().min(1),
  fullName: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  bioLong: z.array(z.string()),
  location: z.string().min(1),
  yearsExperience: z.number(),
  education: z.string().min(1),
  email: z.string().min(1),
  avatar: z.string().min(1),
  what: z.array(
    z.object({
      label: z.string(),
      icon: z.string(),
      deliverables: z.array(z.string()),
      learning: z.boolean().optional(),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      icon: z.string(),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
      learning: z.boolean().optional(),
    }),
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      summary: z.string(),
    }),
  ),
  certifications: z.array(certSchema),
});

export type ProfileAssembleInput = {
  frontmatter: unknown;
  /** Existing files under profile root, relative paths using `/`. */
  existingRelativeFiles: ReadonlySet<string>;
  hasProfilePhoto: boolean;
};

/**
 * Assembles a validated domain profile from frontmatter and available files.
 *
 * Certification file paths are normalized and take precedence over certification links.
 * Profile photos and resumes are included when the corresponding files are available.
 *
 * @param input - Profile frontmatter and available file metadata
 * @returns The assembled domain profile
 * @throws If the frontmatter is invalid or a referenced certification file is missing
 */
export function assembleProfile(input: ProfileAssembleInput): Profile {
  const fm = profileFrontmatterSchema.parse(input.frontmatter);

  const certifications = fm.certifications.map((cert) => {
    if (cert.file) {
      const normalized = cert.file.replace(/\\/g, "/").replace(/^\.\//, "");
      if (!input.existingRelativeFiles.has(normalized)) {
        throw new Error(
          `Profile certification "${cert.name}" references missing file "${cert.file}"`,
        );
      }
      // Prefer file when both present (PROG-78) — drop href from domain shape.
      return { name: cert.name, issuer: cert.issuer, file: normalized };
    }
    return {
      name: cert.name,
      issuer: cert.issuer,
      ...(cert.href !== undefined ? { href: cert.href } : {}),
    };
  });

  return {
    initials: fm.initials,
    fullName: fm.fullName,
    tagline: fm.tagline,
    bio: fm.bio,
    bioLong: fm.bioLong,
    location: fm.location,
    yearsExperience: fm.yearsExperience,
    education: fm.education,
    email: fm.email,
    avatar: fm.avatar,
    ...(input.hasProfilePhoto ? { profilePhoto: "profile_photo.png" as const } : {}),
    ...(input.existingRelativeFiles.has("resume.pdf") ? { resume: "resume.pdf" as const } : {}),
    what: fm.what,
    links: fm.links,
    skills: fm.skills,
    experience: fm.experience,
    certifications,
  };
}
