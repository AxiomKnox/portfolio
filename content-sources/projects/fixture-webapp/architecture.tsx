export const architectureData = {
	nodes: [
		{ id: "1", position: { x: 0, y: 0 }, data: { label: "Browser" } },
		{ id: "2", position: { x: 200, y: 0 }, data: { label: "API" } },
	],
	edges: [{ id: "e1-2", source: "1", target: "2", animated: true }],
	steps: [
		{
			id: "1",
			title: "Client",
			description: "User interacts with the web application.",
		},
		{
			id: "2",
			title: "API",
			description: "Backend handles requests and returns data.",
		},
	],
};
