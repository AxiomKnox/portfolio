export type Category = "devops" | "web" | "ml";
export type Status = "dev" | "alpha" | "beta" | "prod" | "archived";
export const STATUS_ORDER: Status[] = ["dev", "alpha", "beta", "prod", "archived"];

export interface ArchNode {
  id: string;
  label: string;
  x: number;
  y: number;
}
export interface ArchEdge {
  from: string;
  to: string;
}
export interface ArchStep {
  id: string;
  title: string;
  detail: string;
}

export interface ProjectArchitecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
  steps: ArchStep[];
}

/** Domain Project used by pages and islands (loader-assembled). */
export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: Category;
  type: string;
  status: Status;
  version: string;
  releaseDate: string;
  techStack: string[];
  featured?: boolean;
  links: { github?: string; live?: string };
  /**
   * When `preview.png` / `preview.webp` exists on disk → that filename.
   * Else GradientPreview token (`grad-1`…`grad-6`, default `grad-1`).
   */
  preview: string;
  associated: string[];
  architecture?: ProjectArchitecture;
}

export function sortDate(p: Project): string {
  return p.releaseDate;
}
