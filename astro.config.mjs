// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || "http://localhost:4321",
	base: process.env.PUBLIC_BASE_PATH || "/",

	env: {
		schema: {
			PUBLIC_SITE_URL: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
			PUBLIC_BASE_PATH: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
		},
	},

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Inter",
			cssVariable: "--font-inter",
			weights: [300, 400, 500, 600],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Playfair Display",
			cssVariable: "--font-playfair",
			weights: [400, 500, 600],
			styles: ["normal", "italic"],
		},
	],

	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [react(), icon()],
});
