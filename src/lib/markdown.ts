import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

/** Build-time markdown → HTML for project descriptions. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
