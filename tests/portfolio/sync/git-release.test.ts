import { describe, expect, it } from "vitest";
import {
	decodeGitBlob,
	findNoteBlobInTree,
	noteTreePath,
} from "@portfolio/sync/adapters/github";
import { parseArchitectureDataFromTsx } from "@portfolio/sync/assets";
import { resolveReleaseInfo } from "@portfolio/sync/git-release";

describe("resolveReleaseInfo", () => {
	it("derives status from git note, not tag prerelease", () => {
		const result = resolveReleaseInfo({
			mainHeadSha: "abc123",
			note: "beta",
			tags: [
				{
					name: "v1.2.0",
					commitSha: "tag1",
					date: "2025-06-01T00:00:00Z",
				},
			],
		});
		expect(result.status).toBe("beta");
		expect(result.version).toBe("1.2.0");
	});

	it("falls back to dev when no git note exists", () => {
		const result = resolveReleaseInfo({
			mainHeadSha: "abc123",
			note: null,
			tags: [{ name: "v0.3.0", commitSha: "tag1", date: "2025-03-01T00:00:00Z" }],
		});
		expect(result.status).toBe("dev");
	});

	it("uses first v1.x.x date for prod status", () => {
		const result = resolveReleaseInfo({
			mainHeadSha: "abc123",
			note: "prod",
			tags: [
				{ name: "v1.2.0", commitSha: "t2", date: "2025-06-15T00:00:00Z" },
				{ name: "v1.0.0", commitSha: "t1", date: "2025-01-10T00:00:00Z" },
				{ name: "v0.9.0", commitSha: "t0", date: "2024-12-01T00:00:00Z" },
			],
		});
		expect(result.releaseDate).toBe("2025-01-10");
	});

	it("uses latest pre-v1 tag date for pre-prod status", () => {
		const result = resolveReleaseInfo({
			mainHeadSha: "abc123",
			note: "alpha",
			tags: [
				{ name: "v0.9.0", commitSha: "t2", date: "2025-05-01T00:00:00Z" },
				{ name: "v0.5.0", commitSha: "t1", date: "2025-02-01T00:00:00Z" },
			],
		});
		expect(result.releaseDate).toBe("2025-05-01");
	});
});

describe("git notes helpers", () => {
	const commitSha = "abcdef1234567890abcdef1234567890abcdef12";

	it("builds fan-out tree path", () => {
		expect(noteTreePath(commitSha)).toBe("ab/cdef1234567890abcdef1234567890abcdef12");
	});

	it("finds note blob by full SHA path", () => {
		const blobSha = findNoteBlobInTree(commitSha, [
			{ path: commitSha, sha: "blob1", type: "blob" },
		]);
		expect(blobSha).toBe("blob1");
	});

	it("finds note blob by fan-out path", () => {
		const blobSha = findNoteBlobInTree(commitSha, [
			{ path: noteTreePath(commitSha), sha: "blob2", type: "blob" },
		]);
		expect(blobSha).toBe("blob2");
	});

	it("decodes base64 git blobs", () => {
		const encoded = Buffer.from("beta").toString("base64");
		expect(decodeGitBlob(encoded, "base64")).toBe("beta");
	});
});

describe("parseArchitectureDataFromTsx", () => {
	const FIXTURE = `export const architectureData = {
	nodes: [{ id: "1", position: { x: 0, y: 0 }, data: { label: "A" } }],
	edges: [{ id: "e1", source: "1", target: "2" }],
	steps: [{ id: "1", title: "Step", description: "Desc" }],
};`;

	it("extracts architectureData without executing the module", () => {
		const data = parseArchitectureDataFromTsx(FIXTURE) as {
			nodes: unknown[];
			edges: unknown[];
			steps: unknown[];
		};
		expect(data.nodes).toHaveLength(1);
		expect(data.edges).toHaveLength(1);
		expect(data.steps).toHaveLength(1);
	});

	it("throws when export is missing", () => {
		expect(() => parseArchitectureDataFromTsx("// empty")).toThrow(
			/architectureData/,
		);
	});
});
