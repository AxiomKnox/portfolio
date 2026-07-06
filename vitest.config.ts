import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@portfolio": path.resolve(__dirname, "./lib/portfolio"),
		},
	},
	test: {
		include: ["tests/**/*.test.ts"],
	},
});
