import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type ProjectCategory = "backend" | "devops" | "mlops";

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
	backend: "Backend",
	devops: "DevOps",
	mlops: "Machine Learning",
};

const CATEGORY_CLASSES: Record<ProjectCategory, string> = {
	backend: "cat-backend",
	devops: "cat-devops",
	mlops: "cat-mlops",
};

const CATEGORY_COLORS: Record<string, string> = {
  devops: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  backend: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "machine-learning": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  prod: "bg-green-500/10 text-green-600 dark:text-green-400",
  alpha: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  beta: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  dev: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export function getCategoryLabel(category: ProjectCategory): string {
	return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryClass(category: ProjectCategory): string {
	return CATEGORY_CLASSES[category] ?? "italic";
}

export function getStatusLabel(status: string): string {
	return status.toUpperCase();
}


export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "bg-muted text-muted-foreground";
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || "bg-muted text-muted-foreground";
}

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
