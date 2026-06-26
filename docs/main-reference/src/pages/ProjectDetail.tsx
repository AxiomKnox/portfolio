import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { useParams, Navigate, Link } from "react-router-dom";
import { PROJECTS } from "../data/data";
import { getTechIcon } from "../lib/utils";

export function ProjectDetail() {
	const { slug } = useParams();
	const project = PROJECTS.find((p) => p.slug === slug);

	if (!project) {
		return <Navigate to="/projects" replace />;
	}

	return (
		<div className="pt-32 pb-24 px-6 max-w-5xl mx-auto space-y-24">
			{/* Back Link */}
			<Link
				to="/projects"
				className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
			>
				<Icon
					icon="ph:arrow-left-light"
					className="group-hover:-translate-x-1 transition-transform"
				/>
				Back to Archive
			</Link>

			{/* Hero */}
			<section className="space-y-12">
				<div className="space-y-4">
					<div className="flex items-center gap-4">
						<span className="text-[12px] font-mono tracking-tighter text-white/30 uppercase">
							{project.id}
						</span>
						<div className="h-px w-8 bg-white/10" />
						<span className="text-[10px] uppercase tracking-[0.3em] text-[#22c55e] font-bold">
							{project.status}
						</span>
					</div>
					<h1 className="text-6xl sm:text-7xl font-serif text-white leading-tight">
						{project.name}
					</h1>
					<p className="text-xl text-white/60 font-light italic max-w-2xl leading-relaxed">
						{project.summary}
					</p>
				</div>


				<div className="flex flex-wrap gap-4 pt-4">
					{project.githubUrl && (
						<a
							href={project.githubUrl}
							target="_blank"
							className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
						>
							<Icon icon="ph:github-logo-fill" className="text-lg" />
							Repository
						</a>
					)}
					{project.liveUrl && (
						<a
							href={project.liveUrl}
							target="_blank"
							className="flex items-center gap-2 px-6 py-3 border border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
						>
							<Icon icon="ph:broadcast-light" className="text-lg" />
							Live Site
						</a>
					)}
				</div>
			<hr className="border-gray-500/60" />	
			</section>
			{/* Main Content */}
			<section className="grid grid-cols-1 md:grid-cols-12 gap-16">
				<div className="md:col-span-8 space-y-16">
					<div className="space-y-8">
						<h3 className="text-xs uppercase tracking-[0.4em] font-bold text-white/40">
							Project Description
						</h3>
						<div className="space-y-6 text-white/70 font-light leading-relaxed">
							{project.description.map((line, i) => (
								<p key={i}>{line}</p>
							))}
						</div>
					</div>

					{project.architecture && (
						<div className="p-8 border border-white/10 bg-white/5 space-y-8">
							<h3 className="text-xs uppercase tracking-[0.4em] font-bold text-white/40">
								System Architecture
							</h3>
							<div className="space-y-4">
								<p className="text-sm font-light text-white/60 italic">
									{project.architecture.description}
								</p>
								{/* Architecture Placeholder */}
								<div className="aspect-video border border-white/10 flex items-center justify-center font-mono text-[10px] text-white/20 uppercase tracking-[0.5em] bg-black/40">
									
									{project.architecture?.image && (
										<div className="pt-8 w-full border border-white/10">
											<img
												src={`${import.meta.env.BASE_URL}${project.architecture.image.replace(/^\//, "")}`}
												alt="Architecture Diagram"
												className="w-full h-auto object-cover opacity-80 mix-blend-screen"
											/>
										</div>
									)} <br />
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="md:col-span-4 space-y-12">
					<div className="space-y-6">
						<h3 className="text-xs uppercase tracking-[0.4em] font-bold text-white/40">
							Tech Stack
						</h3>
						<div className="flex flex-wrap gap-2">
							{project.techStack.map((tech) => {
								const iconName = getTechIcon(tech);
								return (
									<span
										key={tech}
										className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors hover:bg-white/10 hover:border-white/20"
									>
										{iconName && (
											<Icon icon={iconName} className="text-sm opacity-70" />
										)}
										{tech}
									</span>
								);
							})}
						</div>
					</div>

					<div className="space-y-6">
						<h3 className="text-xs uppercase tracking-[0.4em] font-bold text-white/40">
							Category
						</h3>
						<p className="text-sm font-bold text-white/80 uppercase">
							{project.category}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
