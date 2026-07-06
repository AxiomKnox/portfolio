import { describe, expect, it } from "vitest";
import { parseProjectMarkdown } from "@portfolio/sync/parse-project";

const FIXTURE_MD = `# Atlas Marketplace

## Project Id
PROJ-WA-001

## Summary
A distributed marketplace platform.

## Details
Built with microservices.

## Tech Stack
- React
- Node.js

## Properties

### Project Category
WebApp

### Project Type
Full-Stack Web App

## Project Relation
Deploy Pipeline
`;

describe("parseProjectMarkdown", () => {
	it("reads category from ## Project Category under Properties", () => {
		const result = parseProjectMarkdown(FIXTURE_MD);
		expect(result).not.toBeNull();
		expect(result!.category).toBe("webapp");
	});

	it("does not infer category from project id", () => {
		const withBeId = FIXTURE_MD.replace("PROJ-WA-001", "PROJ-BE-001");
		const result = parseProjectMarkdown(withBeId);
		expect(result!.category).toBe("webapp");
	});

	it("maps legacy Backend label to webapp", () => {
		const backend = FIXTURE_MD.replace("WebApp", "Backend");
		const result = parseProjectMarkdown(backend);
		expect(result!.category).toBe("webapp");
	});

	it("throws when category is missing", () => {
		const noCategory = FIXTURE_MD.replace(
			/### Project Category\nWebApp\n\n/,
			"",
		);
		expect(() => parseProjectMarkdown(noCategory)).toThrow(/Project Category/);
	});

	it("throws when category is invalid", () => {
		const badCategory = FIXTURE_MD.replace("WebApp", "Mobile App");
		expect(() => parseProjectMarkdown(badCategory)).toThrow(/Project Category/);
	});
});
