import fs from "node:fs";
import path from "node:path";
import https from "node:https";

interface ProjectConfig {
	localDir: string;
	remoteRepos: {
		owner: string;
		repo: string;
		branch?: string;
		path?: string;
	}[];
}

interface ParsedProject {
	id: string;
	slug: string;
	name: string;
	category: "backend" | "devops" | "mlops";
	status: string;
	summary: string;
	description: string[];
	techStack: string[];
	architecture?: {
		description: string;
	};
	githubUrl?: string;
	liveUrl?: string;
	featured?: boolean;
}

const parseMarkdown = (markdown: string): ParsedProject | null => {
	try {
		const lines = markdown.split("\n");
		let currentSection = "";

		let id = "";
		let name = "";
		let summary = "";
		const description: string[] = [];
		const techStack: string[] = [];
		let architectureDesc = "";
		let githubUrl = "";
		let liveUrl = "";

		for (const line of lines) {
			if (line.startsWith("# ")) {
				name = line.replace(/^# /, "").trim();

				// const match = line.match(/^# \[([\w-]+)\] (.*)$/);
				// if (match) {
				// 	id = match[1];
				// 	name = match[2];
				// } else {
				// 	name = line.replace(/^# /, "").trim();
				// 	id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
				// }
			} else if (line.startsWith("## ")) {
				currentSection = line.replace(/^## /, "").trim().toLowerCase();
			} else if (line.trim() !== "") {
				const text = line.trim();
				// Ignore generic quotes from the template
				if (text.startsWith("> e.g.")) continue;

				if (currentSection === "project id") {
					id = text;
				} else if (currentSection === "summary") {
					if (!text.startsWith("[")) summary += text + " ";
				} else if (currentSection === "details") {
					if (!text.startsWith("[")) description.push(text);
				} else if (currentSection === "architecture") {
					if (!text.startsWith("[")) architectureDesc += text + " ";
				} else if (currentSection === "tech stack") {
					if (text.startsWith("- ")) {
						const tech = text.replace(/^- (.*?:)?/, "").trim();
						if (!tech.startsWith("[")) techStack.push(tech);
					}
				} else if (currentSection === "links") {
					if (text.toLowerCase().includes("repository:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) githubUrl = match[1];
					} else if (text.toLowerCase().includes("live page:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) liveUrl = match[1];
					}
				}
			}
		}

		if (!name) return null;

		let category: "backend" | "devops" | "mlops" = "devops";
		if (id.includes("-BE-")) category = "backend";
		else if (id.includes("-DO-")) category = "devops";
		else if (id.includes("-ML-")) category = "mlops";

		let status = "BETA";
		const idParts = id.split("-");
		if (idParts.length > 0) {
			const potentialStatus = idParts[idParts.length - 1];
			if (["ALPHA", "BETA", "PROD", "ARCHIVED"].includes(potentialStatus)) {
				status = potentialStatus;
			}
		}

		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

		return {
			id,
			slug,
			name,
			category,
			status,
			summary: summary.trim() || "No summary provided.",
			description: description.length ? description : ["No details provided."],
			techStack: techStack.length ? techStack : ["Not specified"],
			architecture: architectureDesc
				? { description: architectureDesc.trim() }
				: undefined,
			githubUrl: githubUrl || undefined,
			liveUrl: liveUrl || undefined,
			featured: true,
		};
	} catch (err) {
		console.error("Error parsing markdown", err);
		return null;
	}
};

const fetchUrl = (url: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const req = https
			.get(url, { headers: { "User-Agent": "Node.js" } }, (res) => {
				if (res.statusCode === 301 || res.statusCode === 302) {
					return fetchUrl(res.headers.location!).then(resolve).catch(reject);
				}
				if (res.statusCode !== 200) {
					reject(
						new Error(`Failed to fetch ${url}, status: ${res.statusCode}`),
					);
					return;
				}
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => resolve(data));
			})
			.on("error", reject);
		req.setTimeout(5000, () => {
			req.destroy();
			reject(new Error(`Timeout fetching ${url}`));
		});
	});
};

async function main() {
	const configPath = path.resolve("src/projects-config.json");
	if (!fs.existsSync(configPath)) {
		console.log("No projects-config.json found. Skipping sync.");
		return;
	}

	const config: ProjectConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
	const projects: ParsedProject[] = [];

	// Parse Local
	const localDir = path.resolve(config.localDir);
	if (fs.existsSync(localDir)) {
		const files = fs.readdirSync(localDir);
		for (const file of files) {
			if (file.endsWith(".md")) {
				const content = fs.readFileSync(path.join(localDir, file), "utf8");
				const parsed = parseMarkdown(content);
				if (parsed) {
					console.log(`Parsed local project: ${parsed.name}`);
					projects.push(parsed);
				}
			}
		}
	}

	// Parse Remote
	if (config.remoteRepos && config.remoteRepos.length > 0) {
		for (const repo of config.remoteRepos) {
			const branch = repo.branch || "main";
			const filepath = repo.path || "README.md";
			const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${filepath}`;
			console.log(`Fetching ${url}`);
			try {
				const content = await fetchUrl(url);
				const parsed = parseMarkdown(content);
				if (parsed) {
					console.log(`Parsed remote project: ${parsed.name}`);
					projects.push(parsed);
				}
			} catch (err: any) {
				console.error(`Skipping ${repo.owner}/${repo.repo}: ${err.message}`);
			}
		}
	}

	const outDir = path.resolve("src");
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	fs.writeFileSync(
		path.join(outDir, "content/generated-projects.json"),
		JSON.stringify(projects, null, 2),
	);

	console.log(`Successfully synced ${projects.length} projects.`);
}

main().catch(console.error);
