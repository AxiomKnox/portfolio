import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assembleProfile } from "@/content/assemble/profile";
import { shouldShowResume } from "@/content/profile-display";
import type { GitHubClient } from "@/sync/github";
import { planProfileSync } from "@/sync/plan";

const ROOT = join(import.meta.dir, "../..");
const encoder = new TextEncoder();

const profileFm = {
  initials: "AM",
  fullName: "Arjun Malhotra",
  tagline: "Ship",
  bio: "Bio",
  bioLong: ["Long"],
  location: "Bengaluru, IN",
  yearsExperience: 6,
  education: "B.Tech",
  email: "arjun@example.dev",
  avatar: "grad-avatar",
  what: [{ label: "DevOps", icon: "server", deliverables: ["pipelines"] }],
  links: [{ label: "Email", href: "mailto:arjun@example.dev", icon: "gmail" }],
  skills: [{ category: "DevOps", items: ["Docker"] }],
  experience: [
    {
      role: "Engineer",
      company: "Co",
      location: "IN",
      start: "2020-01",
      end: "Present",
      summary: "Stuff",
    },
  ],
  certifications: [] as { name: string; issuer: string }[],
};

const profileMd = `---
initials: AM
fullName: Test
tagline: t
bio: b
bioLong: []
location: x
yearsExperience: 0
education: e
email: a@b.c
avatar: grad-avatar
what: []
links: []
skills: []
experience: []
certifications: []
---
`;

const resumePdf = encoder.encode("%PDF-1.4 resume-from-portfolio");

function clientWithFiles(files: Record<string, Uint8Array>): GitHubClient {
  return {
    async getRawContents({ path }) {
      return files[path] ?? null;
    },
    async listContents({ path }) {
      const prefix = path ? `${path}/` : "";
      const entries = Object.keys(files).flatMap((filePath) => {
        if (path) {
          if (!filePath.startsWith(prefix)) return [];
          const rest = filePath.slice(prefix.length);
          if (rest.includes("/")) return [];
          return [{ name: rest, path: filePath, type: "file" }];
        }
        if (filePath.includes("/")) return [];
        return [{ name: filePath, path: filePath, type: "file" }];
      });
      return entries.length > 0 ? entries : null;
    },
    async listAllTags() {
      return [];
    },
    async resolveTagDate() {
      return "2020-01-01T00:00:00Z";
    },
  };
}

function liveProfileRelatives(plan: { files: { relativePath: string }[] }): Set<string> {
  const out = new Set<string>();
  for (const file of plan.files) {
    const prefix = "src/content/profile/";
    if (!file.relativePath.startsWith(prefix)) continue;
    const rel = file.relativePath.slice(prefix.length);
    if (rel !== "profile.md") out.add(rel);
  }
  return out;
}

describe("resume from remote .portfolio/ appears on the site", () => {
  test("sync + assemble expose resume.pdf so About can preview the file, not a placeholder", async () => {
    const plan = await planProfileSync({
      client: clientWithFiles({
        ".portfolio/profile.md": encoder.encode(profileMd),
        ".portfolio/resume.pdf": resumePdf,
      }),
      profile: { owner: "acme", repo: "personal", path: ".portfolio" },
    });

    const plannedResume = plan.files.find(
      (f) => f.relativePath === "src/content/profile/resume.pdf",
    );
    expect(plannedResume).toBeDefined();
    expect(plannedResume?.bytes).toEqual(resumePdf);

    const profile = assembleProfile({
      frontmatter: profileFm,
      existingRelativeFiles: liveProfileRelatives(plan),
      hasProfilePhoto: false,
    });

    expect(profile.resume).toBe("resume.pdf");
    expect(shouldShowResume(profile)).toBe(true);
  });

  test("omits resume when .portfolio has profile.md but no resume.pdf", async () => {
    const plan = await planProfileSync({
      client: clientWithFiles({
        ".portfolio/profile.md": encoder.encode(profileMd),
      }),
      profile: { owner: "acme", repo: "personal", path: ".portfolio" },
    });

    expect(plan.files.some((f) => f.relativePath.endsWith("resume.pdf"))).toBe(false);
    expect(plan.deleteIfPresent).toContain("src/content/profile/resume.pdf");

    const profile = assembleProfile({
      frontmatter: profileFm,
      existingRelativeFiles: liveProfileRelatives(plan),
      hasProfilePhoto: false,
    });

    expect(profile.resume).toBeUndefined();
    expect(shouldShowResume(profile)).toBe(false);
  });

  test("About page only renders the resume preview when a PDF src exists", () => {
    const about = readFileSync(join(ROOT, "src/pages/about.astro"), "utf8");
    expect(about).toContain("shouldShowResume");
    expect(about).toContain("pdfSrc");
    expect(about).toMatch(/showResume/);
  });

  test("preview dialog embeds the PDF instead of the dashed placeholder when pdfSrc is set", () => {
    const dialog = readFileSync(join(ROOT, "src/components/AboutPreviewDialog.astro"), "utf8");
    expect(dialog).toContain("pdfSrc");
    expect(dialog).toMatch(/<iframe/);
  });
});
