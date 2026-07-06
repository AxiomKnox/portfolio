import fs from "node:fs";
import path from "node:path";
import { syncProjectAssets } from "./assets";
import { fetchReleaseInfoFromGitHub, fetchRemoteProjectAssets, fetchText } from "./adapters/github";
import { readLocalProjectMarkdown } from "./adapters/fixture";
import { parsePersonalMarkdown } from "./parse-personal";
import { parseProjectMarkdown } from "./parse-project";
import { normalizeRelations } from "./relations";
import type { ParsedProjectSource, SyncConfig, SyncProjectConfig } from "./types";
import { slugify } from "./utils";

function writeProjectFile(
	outDir: string,
	project: ParsedProjectSource,
	relatedIds: string[],
	release: { version: string; status: string; releaseDate: string },
	previewImage?: string,
) {
	const slug = slugify(project.name);
	const projectDir = path.join(outDir, slug);
	fs.mkdirSync(projectDir, { recursive: true });

	const frontmatter = [
		"---",
		`id: ${JSON.stringify(project.id)}`,
		`slug: ${JSON.stringify(slug)}`,
		`name: ${JSON.stringify(project.name)}`,
		`category: ${JSON.stringify(project.category)}`,
		`type: ${JSON.stringify(project.type)}`,
		`summary: ${JSON.stringify(project.summary)}`,
		`techStack:`,
		...project.techStack.map((t) => `  - ${JSON.stringify(t)}`),
		relatedIds.length
			? `relatedProjects:\n${relatedIds.map((r) => `  - ${JSON.stringify(r)}`).join("\n")}`
			: `relatedProjects: []`,
		project.repoUrl ? `repoUrl: ${JSON.stringify(project.repoUrl)}` : null,
		project.liveUrl ? `liveUrl: ${JSON.stringify(project.liveUrl)}` : null,
		previewImage ? `previewImage: ${JSON.stringify(previewImage)}` : null,
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
	fs.writeFileSync(path.join(projectDir, "project.md"), `${frontmatter}\n\n${body}\n`);
	console.log(`Wrote project: ${project.name} (${release.version}, ${release.status})`);
}

function writePersonalFile(outDir: string, personal: ReturnType<typeof parsePersonalMarkdown>) {
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
		`heroAdditionalText: ${JSON.stringify(personal.heroAdditionalText)}`,
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
			c.issuer ? `    issuer: ${JSON.stringify(c.issuer)}` : '    issuer: ""',
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

function syncResumePdf(portfolioPath: string, personalOut: string) {
	const resumeSrc = path.join(path.dirname(portfolioPath), "resume.pdf");
	const resumeDest = path.join(personalOut, "resume.pdf");
	if (fs.existsSync(resumeSrc)) {
		fs.copyFileSync(resumeSrc, resumeDest);
		console.log("Wrote resume.pdf");
	} else {
		console.warn(`resume.pdf not found at ${resumeSrc} — skipping resume sync`);
	}
}

function clearProjectsOut(projectsOut: string) {
	if (!fs.existsSync(projectsOut)) return;
	for (const entry of fs.readdirSync(projectsOut, { withFileTypes: true })) {
		const full = path.join(projectsOut, entry.name);
		if (entry.isDirectory()) {
			fs.rmSync(full, { recursive: true, force: true });
		} else if (entry.name.endsWith(".md")) {
			fs.unlinkSync(full);
		}
	}
}

async function loadProjectSources(
	config: SyncProjectConfig,
	rootDir: string,
	githubToken?: string,
): Promise<ParsedProjectSource[]> {
	const sources: ParsedProjectSource[] = [];

	const localDir = path.resolve(rootDir, config.localDir);
	for (const { content, sourceDir } of readLocalProjectMarkdown(localDir)) {
		const parsed = parseProjectMarkdown(content);
		if (parsed) {
			parsed.sourceDir = sourceDir;
			console.log(`Parsed local: ${parsed.name}`);
			sources.push(parsed);
		}
	}

	for (const repo of config.remoteRepos ?? []) {
		const branch = repo.branch ?? "main";
		const filepath = repo.path ?? "project.md";
		const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${filepath}`;
		console.log(`Fetching ${url}`);
		let content: string;
		try {
			content = await fetchText(url, githubToken);
		} catch (err) {
			console.error(`Skipping ${repo.owner}/${repo.repo}:`, (err as Error).message);
			continue;
		}
		const parsed = parseProjectMarkdown(content);
		if (parsed) {
			if (!parsed.repoUrl) {
				parsed.repoUrl = `https://github.com/${repo.owner}/${repo.repo}`;
			}
			parsed.remoteBranch = branch;
			console.log(`Parsed remote: ${parsed.name}`);
			sources.push(parsed);
		}
	}

	return sources;
}

export async function syncPortfolio(config: SyncConfig): Promise<number> {
	const { rootDir, projectsOut, personalOut, portfolioPath, projectConfigPath, githubToken } =
		config;

	fs.mkdirSync(projectsOut, { recursive: true });
	fs.mkdirSync(personalOut, { recursive: true });
	clearProjectsOut(projectsOut);

	const sources: ParsedProjectSource[] = [];

	if (fs.existsSync(projectConfigPath)) {
		const projectConfig: SyncProjectConfig = JSON.parse(
			fs.readFileSync(projectConfigPath, "utf8"),
		);
		sources.push(...(await loadProjectSources(projectConfig, rootDir, githubToken)));
	}

	const relationMap = normalizeRelations(sources);

	for (const project of sources) {
		const branch = project.remoteBranch ?? "main";
		const release = await fetchReleaseInfoFromGitHub(project.repoUrl, githubToken, branch);
		const relatedIds = relationMap.get(project.id) ?? [];
		const slug = slugify(project.name);
		const projectDir = path.join(projectsOut, slug);

		let previewImage: string | undefined;
		let hasArchitecture = false;

		if (project.sourceDir) {
			({ previewImage, hasArchitecture } = await syncProjectAssets(
				project.sourceDir,
				projectDir,
			));
		} else if (project.repoUrl) {
			({ previewImage, hasArchitecture } = await fetchRemoteProjectAssets(
				project.repoUrl,
				projectDir,
				branch,
				githubToken,
			));
		}

		if (!hasArchitecture) {
			throw new Error(
				`Missing required architecture.tsx for project "${project.name}" (${slug})`,
			);
		}

		writeProjectFile(projectsOut, project, relatedIds, release, previewImage);
	}

	if (fs.existsSync(portfolioPath)) {
		const personal = parsePersonalMarkdown(fs.readFileSync(portfolioPath, "utf8"));
		writePersonalFile(personalOut, personal);
		syncResumePdf(portfolioPath, personalOut);
	}

	console.log(`Sync complete: ${sources.length} projects`);
	return sources.length;
}
