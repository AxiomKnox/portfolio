import { describe, expect, it } from "vitest";
import { architectureDataSchema } from "@portfolio/schema";

const VALID = {
	nodes: [{ id: "1", position: { x: 0, y: 0 }, data: { label: "A" } }],
	edges: [{ id: "e1", source: "1", target: "2" }],
	steps: [{ id: "1", title: "Step", description: "Desc" }],
};

describe("architectureDataSchema", () => {
	it("accepts valid architecture data", () => {
		expect(() => architectureDataSchema.parse(VALID)).not.toThrow();
	});

	it("rejects data missing steps", () => {
		const { steps: _, ...invalid } = VALID;
		expect(() => architectureDataSchema.parse(invalid)).toThrow();
	});

	it("rejects steps without required fields", () => {
		expect(() =>
			architectureDataSchema.parse({
				...VALID,
				steps: [{ id: "1", title: "Only title" }],
			}),
		).toThrow();
	});
});
