import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Beasties from "beasties";

const distDir = path.resolve("dist");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function inlineCriticalCss() {
	if (!fs.existsSync(distDir)) {
		console.error("dist/ not found. Run astro build first.");
		process.exit(1);
	}

	const beasties = new Beasties({
		path: distDir,
		publicPath: "/",
		logLevel: "info",
		pruneSource: false,
	});

	const htmlFiles: string[] = [];
	function walk(dir: string) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.name.endsWith(".html")) htmlFiles.push(full);
		}
	}
	walk(distDir);

	for (const file of htmlFiles) {
		const html = fs.readFileSync(file, "utf8");
		const inlined = await beasties.process(html);
		fs.writeFileSync(file, inlined);
		console.log(`Inlined critical CSS: ${path.relative(root, file)}`);
	}
}

inlineCriticalCss().catch((err) => {
	console.error(err);
	process.exit(1);
});
