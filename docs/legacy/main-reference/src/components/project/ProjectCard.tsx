import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Project } from "../../types/project";
import { cn, getTechIcon } from "../../lib/utils";

interface ProjectCardProps {
	project: Project;
	className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className={cn("relative overflow-hidden group", className)}
		>
			<Link to={`/projects/${project.slug}`} className="block h-full">
				<div className="p-8 h-full flex flex-col justify-between">
					{/* Section for adding */}
					<div
						className="aspect-video rounded-lg mb-6 flex items-center justify-center transition-all duration-500 overflow-hidden relative"
						style={{ backgroundColor: "var(--card-bg)" }}
					>
						{/* This is the "Tint" layer */}
						<div
							className="absolute inset-0 
							transition-colors duration-30 ease-in-out
							group-hover:bg-black/10 
							dark:group-hover:bg-white/[0.08]"
						/>

						{/* Icon - Note: Added 'relative z-10' to keep it above the tint */}
						<Icon
							icon="ph:graph-light"
							className="relative z-10 text-2xl text-white/40 group-hover:scale-120 group-hover:text-white/80 transition-all duration-500"
						/>
					</div>{" "}
					{/*  */}
					<div className="flex justify-between items-start mb-2">
						{/* <div className="space-y-1">
							<p className="text-[12px] uppercase text-white/30 tracking-wide font-mono">
								{project.id}
							</p>
						</div> */}
						<div className="flex items-center gap-2">
							<p className="text-[10px] uppercase text-[#22c55e] tracking-widest font-semibold">
								{project.category}
							</p>
							<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--ph text-white/20 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M198 64v104a6 6 0 0 1-12 0V78.48L68.24 196.24a6 6 0 0 1-8.48-8.48L177.52 70H88a6 6 0 0 1 0-12h104a6 6 0 0 1 6 6"></path></svg>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-2xl font-serif text-white group-hover:text-white transition-colors">
							{project.name}
						</h3>
						<p className="text-sm text-[#a1a1aa] font-light leading-relaxed line-clamp-2">
							{project.summary}
						</p>
					</div>
					<div className="mt-8 flex flex-wrap gap-2">
						{project.techStack.slice(0, 3).map((tech) => {
							const iconName = getTechIcon(tech);
							return (
								<span
									key={tech}
									className="px-2 py-1 flex items-center text-muted-foreground gap-1.5"
								>
									{iconName && <Icon icon={iconName} className="" />}
									{/* <p className="text-xs">{tech}</p> */}
								</span>
							);
						})}
						{project.techStack.length > 3 && (
							<span className="px-2 py-1 text-[9px] uppercase tracking-widest text-white/40 flex items-center">
								+{project.techStack.length - 3}
							</span>
						)}
					</div>
				</div>
			</Link>

			{/* Decorative hover line */}
			<div className="absolute bottom-0 left-0 h-px w-0 bg-white/40 group-hover:w-full transition-all duration-500 ease-in-out" />
		</motion.div>
	);
}
