import fs from "node:fs";
import https from "node:https";
import path from "node:path";

interface ProjectConfig {
	localDir: string;
	remoteRepos: {
		owner: string;
		repo: string;
		branch?: string;
		path?: string;
	}[];
}

type ProjectCategory = "backend" | "devops" | "mlops";
type ProjectStatus = "Alpha" | "Beta" | "Production" | "Development" | "Archived";

interface ParsedProjectSource {
	id: string;
	name: string;
	type: string;
	summary: string;
	description: string;
	architectureDescription: string;
	techStack: string[];
	relatedProjects: string[];
	repoUrl?: string;
	liveUrl?: string;
}

interface ReleaseInfo {
	version: string;
	status: ProjectStatus;
	releaseDate: string;
}

const STATUS_SUFFIXES = ["ALPHA", "BETA", "PRODUCTION", "ARCHIVED", "DEVELOPMENT"];

function normalizeId(rawId: string): string {
	const parts = rawId.trim().split("-");
	if (parts.length >= 4) {
		const last = parts[parts.length - 1];
		if (STATUS_SUFFIXES.includes(last)) {
			return parts.slice(0, -1).join("-");
		}
	}
	return rawId.trim();
}

function categoryFromId(id: string): ProjectCategory {
	if (id.includes("-BE-")) return "backend";
	if (id.includes("-ML-")) return "mlops";
	return "devops";
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function parseMarkdown(markdown: string): ParsedProjectSource | null {
	const lines = markdown.split("\n");
	let currentSection = "";
	let currentSubsection = "";

	let id = "";
	let name = "";
	let type = "";
	let summary = "";
	const descriptionLines: string[] = [];
	const techStack: string[] = [];
	const relatedProjects: string[] = [];
	let architectureDescription = "";
	let repoUrl = "";
	let liveUrl = "";

	for (const line of lines) {
		if (line.startsWith("# ")) {
			name = line.replace(/^# /, "").trim();
			currentSection = "";
			currentSubsection = "";
		} else if (line.startsWith("## ")) {
			currentSection = line.replace(/^## /, "").trim().toLowerCase();
			currentSubsection = "";
		} else if (line.startsWith("### ")) {
			currentSubsection = line.replace(/^### /, "").trim();
		} else if (line.trim() !== "") {
			const text = line.trim();
			if (text.startsWith("> e.g.")) continue;

			switch (currentSection) {
				case "project id":
					id = normalizeId(text);
					break;
				case "project type":
					type = text;
					break;
				case "summary":
					if (!text.startsWith("[")) summary += `${text} `;
					break;
				case "details":
					if (!text.startsWith("[")) descriptionLines.push(text);
					break;
				case "architecture":
					if (!text.startsWith("[")) architectureDescription += `${text} `;
					break;
				case "tech stack":
					if (text.startsWith("- ")) {
						const tech = text.replace(/^- (.*?:)?/, "").trim();
						if (!tech.startsWith("[")) techStack.push(tech);
					}
					break;
				case "links":
					if (text.toLowerCase().includes("repository:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) repoUrl = match[1];
					} else if (text.toLowerCase().includes("live page:")) {
						const match = text.match(/\[(.*?)\]/);
						if (match && !match[1].includes("URL")) liveUrl = match[1];
					}
					break;
				case "project relation":
					if (!text.startsWith("[")) relatedProjects.push(text.trim());
					break;
			}
		}
	}

	if (!name) return null;
	if (!id) id = `PROJ-UNK-${slugify(name).toUpperCase().slice(0, 3)}`;

	return {
		id,
		name,
		type: type || "Project",
		summary: summary.trim() || "No summary provided.",
		description: descriptionLines.join("\n\n") || "No details provided.",
		architectureDescription: architectureDescription.trim(),
		techStack: techStack.length ? techStack : ["Not specified"],
		relatedProjects,
		repoUrl: repoUrl || undefined,
		liveUrl: liveUrl || undefined,
	};
}

function parseSemverTag(tag: string): { version: string; prerelease: string | null } {
	const cleaned = tag.replace(/^v/, "");
	const [version, prerelease] = cleaned.split("-");
	return { version: version || "0.0.0", prerelease: prerelease?.split("+")[0] ?? null };
}

function compareSemver(a: string, b: string): number {
	const pa = a.replace(/^v/, "").split(/[.+]/)[0].split(".").map(Number);
	const pb = b.replace(/^v/, "").split(/[.+]/)[0].split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

function statusFromPrerelease(prerelease: string | null): ProjectStatus {
	if (!prerelease) return "Production";
	const label = prerelease.split(".")[0].toLowerCase();
	if (label === "alpha") return "Alpha";
	if (label === "beta" || label === "rc") return "Beta";
	if (label === "dev") return "Development";
	if (label === "archived") return "Archived";
	return "Development";
}

function fetchJson<T>(url: string, token?: string): Promise<T> {
	return new Promise((resolve, reject) => {
		const headers: Record<string, string> = {
			"User-Agent": "portfolio-sync",
			Accept: "application/vnd.github+json",
		};
		if (token) headers.Authorization = `Bearer ${token}`;

		https
			.get(url, { headers }, (res) => {
				if (res.statusCode === 301 || res.statusCode === 302) {
					const location = res.headers.location;
					if (!location) {
						reject(new Error(`Redirect without location for ${url}`));
						return;
					}
					fetchJson<T>(location, token).then(resolve).catch(reject);
					return;
				}
				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode} for ${url}`));
					return;
				}
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					try {
						resolve(JSON.parse(data) as T);
					} catch (err) {
						reject(err);
					}
				});
			})
			.on("error", reject);
	});
}

function fetchText(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https
			.get(url, { headers: { "User-Agent": "portfolio-sync" } }, (res) => {
				if (res.statusCode === 301 || res.statusCode === 302) {
					const location = res.headers.location;
					if (!location) {
						reject(new Error(`Redirect without location for ${url}`));
						return;
					}
					fetchText(location).then(resolve).catch(reject);
					return;
				}
				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode} for ${url}`));
					return;
				}
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => resolve(data));
			})
			.on("error", reject);
	});
}

function parseRepoUrl(repoUrl?: string): { owner: string; repo: string } | null {
	if (!repoUrl) return null;
	const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!match) return null;
	return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchReleaseInfo(repoUrl?: string): Promise<ReleaseInfo> {
	const fallback: ReleaseInfo = {
		version: "0.1.0",
		status: "Development",
		releaseDate: "2025-01-01T01:01:01+05:30",
	};

	const parsed = parseRepoUrl(repoUrl);
	if (!parsed) return fallback;

	const token = process.env.GITHUB_TOKEN;
	const tagsUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/tags`;

	try {
		const tags = await fetchJson<{ name: string; commit: { sha: string } }[]>(
			tagsUrl,
			token,
		);
		if (!tags.length) return fallback;

		const semverTags = tags
			.filter((t) => /^v?\d+\.\d+\.\d+/.test(t.name))
			.sort((a, b) => compareSemver(b.name, a.name));

		const latest = semverTags[0];
		if (!latest) return fallback;

		const { version, prerelease } = parseSemverTag(latest.name);
		let releaseDate = "";

		try {
			const tagRef = await fetchJson<{ object: { sha: string; type: string } }>(
				`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/ref/tags/${latest.name}`,
				token,
			);
			if (tagRef.object.type === "tag") {
				const tagObj = await fetchJson<{ tagger?: { date: string } }>(
					`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/tags/${tagRef.object.sha}`,
					token,
				);
				releaseDate = tagObj.tagger?.date?.split("T")[0] ?? "";
			}
		} catch {
			try {
				const commit = await fetchJson<{ commit: { author: { date: string } } }>(
					`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits/${latest.commit.sha}`,
					token,
				);
				releaseDate = commit.commit.author.date.split("T")[0];
			} catch {
				// keep empty
			}
		}

		return {
			version,
			status: statusFromPrerelease(prerelease),
			releaseDate,
		};
	} catch {
		return fallback;
	}
}

function yamlString(value: string): string {
	if (value.includes("\n") || value.includes(":") || value.includes("#")) {
		return `|\n  ${value.split("\n").join("\n  ")}`;
	}
	return JSON.stringify(value);
}

function writeProjectFile(
	outDir: string,
	project: ParsedProjectSource,
	release: ReleaseInfo,
) {
	const slug = slugify(project.name);
	const category = categoryFromId(project.id);
	const frontmatter = [
		"---",
		`id: ${JSON.stringify(project.id)}`,
		`slug: ${JSON.stringify(slug)}`,
		`name: ${JSON.stringify(project.name)}`,
		`category: ${JSON.stringify(category)}`,
		`type: ${JSON.stringify(project.type)}`,
		`summary: ${JSON.stringify(project.summary)}`,
		`techStack:`,
		...project.techStack.map((t) => `  - ${JSON.stringify(t)}`),
		project.relatedProjects.length
			? `relatedProjects:\n${project.relatedProjects.map((r) => `  - ${JSON.stringify(r)}`).join("\n")}`
			: `relatedProjects: []`,
		project.repoUrl ? `repoUrl: ${JSON.stringify(project.repoUrl)}` : null,
		project.liveUrl ? `liveUrl: ${JSON.stringify(project.liveUrl)}` : null,
		`featured: true`,
		`version: ${JSON.stringify(release.version)}`,
		`status: ${JSON.stringify(release.status)}`,
		`releaseDate: ${JSON.stringify(release.releaseDate)}`,
		project.architectureDescription
			? `architectureDescription: ${JSON.stringify(project.architectureDescription)}`
			: null,
		"---",
	]
		.filter(Boolean)
		.join("\n");

	const body = project.description;
	fs.writeFileSync(path.join(outDir, `${slug}.md`), `${frontmatter}\n\n${body}\n`);
	console.log(`Wrote project: ${project.name} (${release.version}, ${release.status})`);
}

interface ParsedPersonal {
	firstName: string;
	lastName: string;
	shortInitials: string;
	longInitials: string;
	role: string;
	location: string;
	email: string;
	github: string;
	linkedin: string;
	resumeUrl: string;
	heroSection: string;
	aboutParagraphs: string[];
	skills: { category: string; items: string[] }[];
	experience: {
		title: string;
		company: string;
		location: string;
		duration: string;
		description: string;
	}[];
	certifications: { name: string; issuer?: string; url?: string }[];
	yearsOfExperience?: string;
	education?: string;
}

function parsePersonal(markdown: string): ParsedPersonal {
	const lines = markdown.split("\n");
	let section = "";
	let subsection = "";
	const aboutParagraphs: string[] = [];
	const skills: { category: string; items: string[] }[] = [];
	const experience: ParsedPersonal["experience"] = [];
	const certifications: ParsedPersonal["certifications"] = [];

	const data: Partial<ParsedPersonal> = {
		resumeUrl: "/resume.pdf",
		aboutParagraphs,
		skills,
		experience,
		certifications,
	};

	let currentExp: Partial<ParsedPersonal["experience"][0]> | null = null;
	let currentCert: Partial<ParsedPersonal["certifications"][0]> | null = null;
	let currentSkill: { category: string; items: string[] } | null = null;

	for (const line of lines) {
		if (line.startsWith("## ")) {
			if (currentExp?.title) {
				experience.push(currentExp as ParsedPersonal["experience"][0]);
				currentExp = null;
			}
			if (currentCert?.name) {
				certifications.push(currentCert as ParsedPersonal["certifications"][0]);
				currentCert = null;
			}
			section = line.replace(/^## /, "").trim().toLowerCase();
			subsection = "";
		} else if (line.startsWith("### ")) {
			if (currentExp?.title) {
				experience.push(currentExp as ParsedPersonal["experience"][0]);
			}
			if (currentCert?.name) {
				certifications.push(currentCert as ParsedPersonal["certifications"][0]);
			}
			subsection = line.replace(/^### /, "").trim();
			if (section === "skills") {
				if (currentSkill) skills.push(currentSkill);
				currentSkill = { category: subsection, items: [] };
			} else if (section === "experience") {
				currentExp = { title: subsection, company: "", location: "", duration: "", description: "" };
			} else if (section === "certifications") {
				currentCert = { name: subsection };
			}
		} else if (line.trim()) {
			const text = line.trim();
			switch (section) {
				case "full name": {
					const parts = text.split(/\s+/);
					data.firstName = parts[0] ?? "Abj";
					data.lastName = parts.slice(1).join(" ") || "Ksh";
					data.shortInitials = `${data.firstName[0]}${data.lastName[0] ?? ""}`;
					data.longInitials = `${data.firstName} ${data.lastName[0] ?? ""}`;
					break;
				}
				case "hero summary":
					data.heroSection = text;
					break;
				case "role":
					data.role = text;
					break;
				case "location":
					data.location = text;
					break;
				case "email":
					data.email = text;
					break;
				case "github":
					data.github = text;
					break;
				case "linkedin":
					data.linkedin = text;
					break;
				case "resume":
					data.resumeUrl = text;
					break;
				case "about me":
					aboutParagraphs.push(text);
					break;
				case "years of experience":
					data.yearsOfExperience = text;
					break;
				case "education":
					data.education = text;
					break;
				case "skills":
					if (currentSkill && text.includes(",")) {
						currentSkill.items.push(
							...text.split(",").map((s) => s.trim()).filter(Boolean),
						);
					}
					break;
				case "experience":
					if (currentExp) {
						if (text.startsWith("Company:")) currentExp.company = text.replace("Company:", "").trim();
						else if (text.startsWith("Location:")) currentExp.location = text.replace("Location:", "").trim();
						else if (text.startsWith("Duration:")) currentExp.duration = text.replace("Duration:", "").trim();
						else if (text.startsWith("Description:")) currentExp.description = text.replace("Description:", "").trim();
					}
					break;
				case "certifications":
					if (currentCert && text.startsWith("Issuer:")) {
						currentCert.issuer = text.replace("Issuer:", "").trim();
					}
					break;
			}
		}
	}

	if (currentSkill) skills.push(currentSkill);
	if (currentExp?.title) experience.push(currentExp as ParsedPersonal["experience"][0]);
	if (currentCert?.name) certifications.push(currentCert as ParsedPersonal["certifications"][0]);

	return {
		firstName: data.firstName ?? "Abj",
		lastName: data.lastName ?? "Ksh",
		shortInitials: data.shortInitials ?? "AK",
		longInitials: data.longInitials ?? "Ab Ks",
		role: data.role ?? "DevOps Engineer",
		location: data.location ?? "",
		email: data.email ?? "hello@example.com",
		github: data.github ?? "https://github.com",
		linkedin: data.linkedin ?? "https://linkedin.com",
		resumeUrl: data.resumeUrl ?? "/resume.pdf",
		heroSection: data.heroSection ?? "",
		aboutParagraphs,
		skills,
		experience,
		certifications,
		yearsOfExperience: data.yearsOfExperience,
		education: data.education,
	};
}

function writePersonalFile(outDir: string, personal: ParsedPersonal) {
	const fm = [
		"---",
		`firstName: ${JSON.stringify(personal.firstName)}`,
		`lastName: ${JSON.stringify(personal.lastName)}`,
		`shortInitials: ${JSON.stringify(personal.shortInitials)}`,
		`longInitials: ${JSON.stringify(personal.longInitials)}`,
		`role: ${JSON.stringify(personal.role)}`,
		`location: ${JSON.stringify(personal.location)}`,
		`email: ${JSON.stringify(personal.email)}`,
		`github: ${JSON.stringify(personal.github)}`,
		`linkedin: ${JSON.stringify(personal.linkedin)}`,
		`resumeUrl: ${JSON.stringify(personal.resumeUrl)}`,
		`heroSection: ${JSON.stringify(personal.heroSection)}`,
		`aboutParagraphs:`,
		...personal.aboutParagraphs.map((p) => `  - ${JSON.stringify(p)}`),
		`skills:`,
		...personal.skills.flatMap((g) => [
			`  - category: ${JSON.stringify(g.category)}`,
			`    items:`,
			...g.items.map((i) => `      - ${JSON.stringify(i)}`),
		]),
		`experience:`,
		...personal.experience.flatMap((e) => [
			`  - title: ${JSON.stringify(e.title)}`,
			`    company: ${JSON.stringify(e.company)}`,
			`    location: ${JSON.stringify(e.location)}`,
			`    duration: ${JSON.stringify(e.duration)}`,
			`    description: ${JSON.stringify(e.description)}`,
		]),
		`certifications:`,
		...personal.certifications.flatMap((c) => [
			`  - name: ${JSON.stringify(c.name)}`,
			c.issuer ? `    issuer: ${JSON.stringify(c.issuer)}` : "    issuer: \"\"",
		]),
		personal.yearsOfExperience
			? `yearsOfExperience: ${JSON.stringify(personal.yearsOfExperience)}`
			: null,
		personal.education ? `education: ${JSON.stringify(personal.education)}` : null,
		"---",
	]
		.filter(Boolean)
		.join("\n");

	fs.writeFileSync(path.join(outDir, "site.md"), `${fm}\n\n# Personal Site Data\n`);
	console.log("Wrote personal site data");
}

async function main() {
	const root = process.cwd();
	const configPath = path.join(root, "projects-config.json");
	const projectsOut = path.join(root, "src/content/projects");
	const personalOut = path.join(root, "src/content/personal");

	fs.mkdirSync(projectsOut, { recursive: true });
	fs.mkdirSync(personalOut, { recursive: true });

	// Clear old generated project files
	for (const file of fs.readdirSync(projectsOut)) {
		if (file.endsWith(".md")) fs.unlinkSync(path.join(projectsOut, file));
	}

	const sources: ParsedProjectSource[] = [];

	if (fs.existsSync(configPath)) {
		const config: ProjectConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

		const localDir = path.resolve(root, config.localDir);
		if (fs.existsSync(localDir)) {
			for (const file of fs.readdirSync(localDir)) {
				if (!file.endsWith(".md")) continue;
				const content = fs.readFileSync(path.join(localDir, file), "utf8");
				const parsed = parseMarkdown(content);
				if (parsed) {
					console.log(`Parsed local: ${parsed.name}`);
					sources.push(parsed);
				}
			}
		}

		for (const repo of config.remoteRepos ?? []) {
			const branch = repo.branch ?? "main";
			const filepath = repo.path ?? "project.md";
			const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${filepath}`;
			console.log(`Fetching ${url}`);
			try {
				const content = await fetchText(url);
				const parsed = parseMarkdown(content);
				if (parsed) {
					if (!parsed.repoUrl) {
						parsed.repoUrl = `https://github.com/${repo.owner}/${repo.repo}`;
					}
					console.log(`Parsed remote: ${parsed.name}`);
					sources.push(parsed);
				}
			} catch (err) {
				console.error(`Skipping ${repo.owner}/${repo.repo}:`, (err as Error).message);
			}
		}
	}

	for (const project of sources) {
		const release = await fetchReleaseInfo(project.repoUrl);
		writeProjectFile(projectsOut, project, release);
	}

	const portfolioPath = path.join(root, "portfolio.md");
	if (fs.existsSync(portfolioPath)) {
		const personal = parsePersonal(fs.readFileSync(portfolioPath, "utf8"));
		writePersonalFile(personalOut, personal);
	}

	console.log(`Sync complete: ${sources.length} projects`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
