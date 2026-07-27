import { describe, expect, test } from "bun:test";
import { assembleProfile } from "@/content/assemble/profile";

const baseFm = {
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
  certifications: [{ name: "CKA", issuer: "CNCF", href: "#" }],
};

describe("assembleProfile", () => {
  test("returns domain profile from frontmatter", () => {
    const profile = assembleProfile({
      frontmatter: baseFm,
      existingRelativeFiles: new Set(),
      hasProfilePhoto: false,
    });
    expect(profile.fullName).toBe("Arjun Malhotra");
    expect(profile.certifications[0]).toEqual({
      name: "CKA",
      issuer: "CNCF",
      href: "#",
    });
  });

  test("prefers file over href and fails on dangling file", () => {
    const withFile = {
      ...baseFm,
      certifications: [
        {
          name: "CKA",
          issuer: "CNCF",
          href: "https://example.com",
          file: "certifications/cka.pdf",
        },
      ],
    };

    expect(() =>
      assembleProfile({
        frontmatter: withFile,
        existingRelativeFiles: new Set(),
        hasProfilePhoto: false,
      }),
    ).toThrow(/missing file/);

    const profile = assembleProfile({
      frontmatter: withFile,
      existingRelativeFiles: new Set(["certifications/cka.pdf"]),
      hasProfilePhoto: true,
    });
    expect(profile.certifications[0]).toEqual({
      name: "CKA",
      issuer: "CNCF",
      file: "certifications/cka.pdf",
    });
    expect(profile.avatar).toBe("grad-avatar");
    expect(profile.profilePhoto).toBe("profile_photo.png");
  });

  test("omits profilePhoto when file absent", () => {
    const profile = assembleProfile({
      frontmatter: baseFm,
      existingRelativeFiles: new Set(),
      hasProfilePhoto: false,
    });
    expect(profile.profilePhoto).toBeUndefined();
  });
});
