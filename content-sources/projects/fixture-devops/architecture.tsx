export const architectureData = {
	nodes: [
		{ id: "1", position: { x: 0, y: 0 }, data: { label: "CI" } },
		{ id: "2", position: { x: 200, y: 0 }, data: { label: "Deploy" } },
	],
	edges: [{ id: "e1-2", source: "1", target: "2", animated: true }],
	steps: [
		{
			id: "1",
			title: "CI",
			description: "GitHub Actions builds and tests the application.",
		},
		{
			id: "2",
			title: "Deploy",
			description: "Terraform provisions infrastructure and deploys artifacts.",
		},
	],
};
