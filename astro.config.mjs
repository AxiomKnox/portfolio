import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";
import Icons from "unplugin-icons/vite";

// Official Astro opt-out (https://astro.build/telemetry/): set before CLI work.
// Prefer this over a tracked `.env.telemetry` so scripts need no `--env-file`.
process.env.ASTRO_TELEMETRY_DISABLED ??= "1";

const site = process.env.ASTRO_SITE ?? "http://localhost:4321";
const base = process.env.ASTRO_BASE ?? "/";

export default defineConfig({
  site,
  base,
  output: "static",
  env: {
    schema: {
      // Server/build-time only (not client). Home + about share this one flag.
      // String so `true` and `1` both work; parsed in src/content/learning-signals.ts.
      // `public` + `server` inlines at SSG build; not a client PUBLIC_ var.
      LEARNING_SIGNALS_ENABLED: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
    },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith("/404") && !page.includes("/404/"),
    }),
  ],
  vite: {
    // Prebundle calendar deps so the first Filter → calendar open does not race
    // Vite's "Outdated Optimize Dep" (504) and crash the projects island.
    optimizeDeps: {
      include: ["react-day-picker", "date-fns"],
    },
    // Local graph indexes (also in .gitignore) — churn must not trigger HMR.
    server: {
      watch: {
        ignored: ["**/.codegraph/**", "**/.gitnexus/**", "**/graphify-out/**"],
      },
    },
    plugins: [
      tailwindcss(),
      Icons({
        compiler: "jsx",
        jsx: "react",
        autoInstall: false,
      }),
    ],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: ["100 900"],
      styles: ["normal"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: ["100 900"],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});
