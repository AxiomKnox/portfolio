export interface ProfileWhatItem {
  label: string;
  icon: string;
  deliverables: string[];
  learning?: boolean;
}

export interface ProfileLink {
  label: string;
  href: string;
  icon: string;
}

export interface ProfileSkillGroup {
  category: string;
  items: string[];
  learning?: boolean;
}

export interface ProfileExperience {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  summary: string;
}

export interface ProfileCertification {
  name: string;
  issuer: string;
  href?: string;
  /** Profile-root-relative path, e.g. `certifications/cka.pdf`. */
  file?: string;
}

/** Domain Profile used by pages (loader-assembled). */
export interface Profile {
  initials: string;
  fullName: string;
  tagline: string;
  bio: string;
  bioLong: string[];
  location: string;
  yearsExperience: number;
  education: string;
  email: string;
  /** GradientPreview token when no photo file. */
  avatar: string;
  /** Set when `profile_photo.png` exists; UI prefers photo over `avatar`. */
  profilePhoto?: "profile_photo.png";
  what: ProfileWhatItem[];
  links: ProfileLink[];
  skills: ProfileSkillGroup[];
  experience: ProfileExperience[];
  certifications: ProfileCertification[];
}
