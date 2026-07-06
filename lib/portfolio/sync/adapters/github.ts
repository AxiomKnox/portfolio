import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { syncArchitectureFromTsx } from "../assets";
import type { GitTag } from "../git-release";
import type { ReleaseInfo } from "../types";
import { resolveReleaseInfo } from "../git-release";

export function parseRepoUrl(repoUrl?: string): { owner: string; repo: string } | null {
	if (!repoUrl) return null;
	const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!match) return null;
	return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

type ResponseHandler<T> = (res: import("node:http").IncomingMessage) => Promise<T>;

function fetchWithRedirects<T>(
	url: string,
	token: string | undefined,
	handleResponse: ResponseHandler<T>,
	extraHeaders?: Record<string, string>,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const headers: Record<string, string> = {
			"User-Agent": "portfolio-sync",
			...extraHeaders,
		};
		if (token) headers.Authorization = `Bearer ${token}`;

		https
			.get(url, { headers, agent: false }, (res) => {
				if (res.statusCode === 301 || res.statusCode === 302) {
					const location = res.headers.location;
					if (!location) {
						reject(new Error(`Redirect without location for ${url}`));
						return;
					}
					fetchWithRedirects(location, token, handleResponse, extraHeaders)
						.then(resolve)
						.catch(reject);
					return;
				}
				if (res.statusCode !== 200) {
					res.resume();
					reject(new Error(`HTTP ${res.statusCode} for ${url}`));
					return;
				}
				handleResponse(res).then(resolve).catch(reject);
			})
			.on("error", reject);
	});
}

function collectText(res: import("node:http").IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		res.on("data", (chunk: Buffer) => chunks.push(chunk));
		res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		res.on("error", reject);
	});
}

function collectBuffer(res: import("node:http").IncomingMessage): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		res.on("data", (chunk: Buffer) => chunks.push(chunk));
		res.on("end", () => resolve(Buffer.concat(chunks)));
		res.on("error", reject);
	});
}

export function fetchJson<T>(url: string, token?: string): Promise<T> {
	return fetchWithRedirects(
		url,
		token,
		async (res) => {
			const data = await collectText(res);
			return JSON.parse(data) as T;
		},
		{ Accept: "application/vnd.github+json" },
	);
}

export function fetchText(url: string, token?: string): Promise<string> {
	return fetchWithRedirects(url, token, collectText);
}

export function fetchBuffer(url: string, token?: string): Promise<Buffer> {
	return fetchWithRedirects(url, token, collectBuffer);
}

/** Git notes fan-out path for a commit SHA (see gitnotes(7)). */
export function noteTreePath(commitSha: string): string {
	const sha = commitSha.toLowerCase();
	return `${sha.slice(0, 2)}/${sha.slice(2)}`;
}

export function findNoteBlobInTree(
	commitSha: string,
	tree: { path: string; sha: string; type: string }[],
): string | null {
	const sha = commitSha.toLowerCase();
	const fanout = noteTreePath(sha);
	const entry = tree.find(
		(e) =>
			e.type === "blob" &&
			(e.path === sha || e.path === fanout || e.path.endsWith(`/${sha}`)),
	);
	return entry?.sha ?? null;
}

export function decodeGitBlob(content: string, encoding: string): string {
	if (encoding === "base64") {
		return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
	}
	return content;
}

async function fetchTagDate(
	owner: string,
	repo: string,
	tagName: string,
	commitSha: string,
	token?: string,
): Promise<string | undefined> {
	try {
		const tagRef = await fetchJson<{ object: { sha: string; type: string } }>(
			`https://api.github.com/repos/${owner}/${repo}/git/ref/tags/${encodeURIComponent(tagName)}`,
			token,
		);
		if (tagRef.object.type === "tag") {
			const tagObj = await fetchJson<{ tagger?: { date: string } }>(
				`https://api.github.com/repos/${owner}/${repo}/git/tags/${tagRef.object.sha}`,
				token,
			);
			return tagObj.tagger?.date;
		}
	} catch {
		// fall through to commit date
	}

	try {
		const commit = await fetchJson<{ commit: { author: { date: string } } }>(
			`https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
			token,
		);
		return commit.commit.author.date;
	} catch {
		return undefined;
	}
}

export async function fetchGitNote(
	owner: string,
	repo: string,
	commitSha: string,
	token?: string,
): Promise<string | null> {
	try {
		const notesRef = await fetchJson<{ object: { sha: string } }>(
			`https://api.github.com/repos/${owner}/${repo}/git/ref/notes/commits`,
			token,
		);
		const notesCommit = await fetchJson<{ tree: { sha: string } }>(
			`https://api.github.com/repos/${owner}/${repo}/git/commits/${notesRef.object.sha}`,
			token,
		);
		const tree = await fetchJson<{ tree: { path: string; sha: string; type: string }[] }>(
			`https://api.github.com/repos/${owner}/${repo}/git/trees/${notesCommit.tree.sha}?recursive=1`,
			token,
		);
		const blobSha = findNoteBlobInTree(commitSha, tree.tree);
		if (!blobSha) return null;

		const blob = await fetchJson<{ content: string; encoding: string }>(
			`https://api.github.com/repos/${owner}/${repo}/git/blobs/${blobSha}`,
			token,
		);
		return decodeGitBlob(blob.content, blob.encoding).trim() || null;
	} catch {
		return null;
	}
}

export async function fetchRawFile(
	owner: string,
	repo: string,
	branch: string,
	filepath: string,
	token?: string,
): Promise<Buffer | null> {
	const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
	try {
		return await fetchBuffer(url, token);
	} catch {
		return null;
	}
}

export async function fetchRemoteProjectAssets(
	repoUrl: string,
	outDir: string,
	branch = "main",
	token?: string,
): Promise<{ previewImage?: string; hasArchitecture: boolean }> {
	const parsed = parseRepoUrl(repoUrl);
	if (!parsed) return { hasArchitecture: false };

	fs.mkdirSync(outDir, { recursive: true });

	const { owner, repo } = parsed;
	let previewImage: string | undefined;
	let hasArchitecture = false;

	const preview = await fetchRawFile(owner, repo, branch, "preview.png", token);
	if (preview) {
		fs.writeFileSync(path.join(outDir, "preview.png"), preview);
		previewImage = "./preview.png";
	}

	const archTsx = await fetchRawFile(owner, repo, branch, "architecture.tsx", token);
	if (archTsx) {
		const tempTsx = path.join(outDir, ".remote-architecture.tsx");
		fs.writeFileSync(tempTsx, archTsx);
		hasArchitecture = await syncArchitectureFromTsx(tempTsx, outDir);
		if (fs.existsSync(tempTsx)) fs.unlinkSync(tempTsx);
	}

	return { previewImage, hasArchitecture };
}

export async function fetchReleaseInfoFromGitHub(
	repoUrl?: string,
	token?: string,
	branch = "main",
): Promise<ReleaseInfo> {
	const parsed = parseRepoUrl(repoUrl);
	const fallback: ReleaseInfo = {
		version: "0.1.0",
		status: "dev",
		releaseDate: "2025-01-01",
	};
	if (!parsed) return fallback;

	const { owner, repo } = parsed;

	try {
		const branchRef = await fetchJson<{ object: { sha: string } }>(
			`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
			token,
		);
		const headSha = branchRef.object.sha;
		const note = await fetchGitNote(owner, repo, headSha, token);

		const tags = await fetchJson<{ name: string; commit: { sha: string } }[]>(
			`https://api.github.com/repos/${owner}/${repo}/tags`,
			token,
		);

		const gitTags: GitTag[] = [];
		for (const tag of tags) {
			const date = await fetchTagDate(owner, repo, tag.name, tag.commit.sha, token);
			gitTags.push({ name: tag.name, commitSha: tag.commit.sha, date });
		}

		return resolveReleaseInfo({
			mainHeadSha: headSha,
			note,
			tags: gitTags,
		});
	} catch {
		return fallback;
	}
}
