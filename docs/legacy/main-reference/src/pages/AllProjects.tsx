import { motion } from "motion/react";
import { PROJECTS } from "../data/data";
import { ProjectCard } from "../components/project/ProjectCard";
import { useState } from "react";
import { ProjectCategory } from "../types/project";
import { cn } from "../lib/utils";
import { delay } from "motion";

export function AllProjects() {
	const [activeTab, setActiveTab] = useState<ProjectCategory | "all">("all");

	const filteredProjects = PROJECTS.filter((p) =>
		activeTab === "all" ? true : p.category === activeTab,
	);

	const categories: { label: string; value: ProjectCategory | "all" }[] = [
		{ label: "All Work", value: "all" },
		{ label: "DevOps", value: "devops" },
		{ label: "Backend", value: "backend" },
		{ label: "Machine Learning", value: "mlops" },
	];

	return (
		<motion.div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-16"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			>
			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="space-y-4">
				<h1 className="text-6xl font-serif text-white italic">
					Archive.
				</h1>
				<p className="text-white/40 font-light tracking-wide uppercase text-xs">
					Total Projects: {PROJECTS.length}
				</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15, duration: 0.2 }}
				className="flex items-center gap-8 border-b border-white/10 pb-6">
				{categories.map((cat) => (
					<button
						key={cat.value}
						onClick={() => setActiveTab(cat.value)}
						className={cn(
							"text-[10px] uppercase tracking-[0.2em] transition-all relative pb-2",
							activeTab === cat.value
								? "text-white font-bold"
								: "text-white/30 hover:text-white/60",
						)}
					>
						{cat.label}
						{activeTab === cat.value && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
							/>
						)}
					</button>
				))}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.2 }}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{filteredProjects.map((project) => (
					<ProjectCard project={project} className="h-full" />
				))}
			</motion.div>
		</motion.div>
	);
}
