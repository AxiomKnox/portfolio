import { motion } from "motion/react";
import { Project } from "../../types/project";
import { ProjectCard } from "./ProjectCard";
import { cn } from "../../lib/utils";

interface HorizontalScrollerProps {
	title: string;
	projects: Project[];
	className?: string;
}

export function HorizontalScroller({
	title,
	projects,
	className,
}: HorizontalScrollerProps) {
	return (
		<div className={cn("space-y-8", className)}>
			<div className="flex items-center justify-between px-6">
				<h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">
					{title}
				</h2>
				<div className="h-px bg-white/10 flex-1 ml-8" />
			</div>

			<div className="relative overflow-hidden">
				<div
					className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-6 no-scrollbar"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{projects.map((project) => (
						<div
							key={project.id}
							className="snap-start shrink-0 w-[320px] sm:w-[400px]"
						>
							<ProjectCard project={project} />
						</div>
					))}
					{/* Spacer for end of scroll */}
					<div className="shrink-0 w-6" />
				</div>

				{/* Shadow Indicators */}
				<div className="absolute right-0 top-0 bottom-8 w-24 pointer-events-none" />
				<div className="absolute left-0 top-0 bottom-8 w-24 pointer-events-none" />
			</div>
		</div>
	);
}
