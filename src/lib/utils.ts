import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type { ProjectCategory } from "@portfolio/schema";
export {
	getCategoryClass,
	getCategoryColor,
	getCategoryLabel,
	getStatusColor,
	getStatusLabel,
} from "@/lib/portfolio/display";

export function getTechIcon(tech: string): string | null {
	const t = tech.toLowerCase();
	const mapping: Record<string, string> = {
		go: "simple-icons:go",
		rust: "simple-icons:rust",
		"node.js": "simple-icons:nodedotjs",
		react: "simple-icons:react",
		"tailwind css": "simple-icons:tailwindcss",
		"next.js": "simple-icons:nextdotjs",
		redis: "simple-icons:redis",
		postgresql: "simple-icons:postgresql",
		websockets: "simple-icons:socketdotio",
		graphql: "simple-icons:graphql",
		"nats.io": "simple-icons:natsdotio",
		docker: "simple-icons:docker",
		kubernetes: "simple-icons:kubernetes",
		terraform: "simple-icons:terraform",
		"github actions": "simple-icons:githubactions",
		aws: "simple-icons:amazonaws",
		python: "simple-icons:python",
		pytorch: "simple-icons:pytorch",
		tensorflow: "simple-icons:tensorflow",
		opencv: "simple-icons:opencv",
		typescript: "simple-icons:typescript",
		
		"framer motion": "simple-icons:framer",
		figma: "simple-icons:figma",

		betterauth: "simple-icons:betterauth",
		bun: "simple-icons:bun",
		clerk: "simple-icons:clerk",

		deno: "simple-icons:deno",
		drizzle: "simple-icons:drizzle",

		express: "simple-icons:express",
		fastapi: "simple-icons:fastapi",
		fastify: "simple-icons:fastify",

		hono: "simple-icons:hono",
		jwt: "simple-icons:jsonwebtokens",

		mongodb: "simple-icons:mongodb",
		mongoose: "simple-icons:mongoose",
		mysql: "simple-icons:mysql",
		neon: "simple-icons:neon",
		nginx: "simple-icons:nginx",

		"openid connect": "simple-icons:openid",

		pnpm: "simple-icons:pnpm",

		prisma: "simple-icons:prisma",

		sqlite: "simple-icons:sqlite",

		trpc: "simple-icons:trpc",

		alloy: "simple-icons:alloy",
		ansible: "simple-icons:ansible",

		"argo cd": "simple-icons:argocd",

		"flux cd": "simple-icons:fluxcd",
		github: "simple-icons:github",
		gitlab: "simple-icons:gitlab",
		"gitlab cicd": "simple-icons:gitlab",
		grafana: "simple-icons:grafana",

		"hashicorp vault": "simple-icons:vault",
		helm: "simple-icons:helm",

		k3d: "simple-icons:k3d",

		loki: "simple-icons:loki",

		prometheus: "simple-icons:pprometheus",

		spacelift: "simple-icons:spacelift",

		vercel: "simple-icons:vercel",


		numpy: "simple-icons:numpy",
		pandas: "simple-icons:pandas",
		seaborn: "devicon-plain:seaborn",
		jupyter: "simple-icons:jupyter",
		matplotlib: "devicon-plain:matplotlib",
		"scikit-learn": "simple-icons:scikitlearn",


		"apache airflow": "simple-icons:apacheairflow",
		bentoml: "simple-icons:bentoml",
		"dvc": "simple-icons:dvc",

		"google colab": "simple-icons:googlecolab",

		"gradio": "simple-icons:gradio",

		"hugging face transformers": "simple-icons:huggingface",

		keras: "simple-icons:keras",
		kubeflow: "devicon-plain:kubeflow",

		langchain: "simple-icons:langchain",

		mlflow: "simple-icons:mlflow",

		"onnx": "simple-icons:onnx",
		ollama: "simple-icons:ollama",

		streamlit: "simple-icons:streamlit",

		"tensorflow extended": "simple-icons:tensorflow",

		vllm: "simple-icons:vllm",

		"weights & biases": "simple-icons:weightsandbiases"

	};
	return mapping[t] ?? null;
}
