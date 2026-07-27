import { parse as parseYaml } from "yaml";

export function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const text = raw.replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) {
    throw new Error("Markdown file is missing YAML frontmatter delimiters");
  }
  return {
    data: parseYaml(match[1] ?? ""),
    body: match[2] ?? "",
  };
}
