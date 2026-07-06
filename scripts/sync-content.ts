import path from "node:path";
import { syncPortfolio } from "../lib/portfolio/sync/index.js";

const root = process.cwd();

await syncPortfolio({
	rootDir: root,
	projectsOut: path.join(root, "src/content/projects"),
	personalOut: path.join(root, "src/content/personal"),
	portfolioPath: path.join(root, "portfolio.md"),
	projectConfigPath: path.join(root, "projects-config.json"),
	githubToken: process.env.GITHUB_TOKEN,
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
