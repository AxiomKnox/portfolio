import type { APIRoute } from "astro";
import { absoluteUrl } from "@/lib/site";

export const GET: APIRoute = ({ site }) => {
  const sitemap = absoluteUrl("/sitemap-index.xml", site);
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
