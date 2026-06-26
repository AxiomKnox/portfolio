import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { SITE_DATA, PROJECTS } from "../data/data";
import { HorizontalScroller } from "../components/project/HorizontalScroller";

export function Home() {
	const backendProjects = PROJECTS.filter((p) => p.category === "backend");
	const devopsProjects = PROJECTS.filter((p) => p.category === "devops");
	const mlProjects = PROJECTS.filter((p) => p.category === "mlops");

	return (
		<div className="pt-40 pb-32 space-y-36">
			{/* Hero Section */}
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="px-6 max-w-7xl mx-auto mt-40"
			>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end my-20 pb-40">
					<div className="lg:col-span-8 space-y-12">
						<div>
							<div className="flex items-center gap-4 mb-4">
								<span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-white/30">
									Available for projects
								</span>
								<div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
							</div>
							<h1 className="text-7xl sm:text-8xl md:text-9xl font-serif text-white leading-[0.85] tracking-tighter">
								{SITE_DATA.firstName}
								<br />
								<span className="italic font-light text-white/80">
									{SITE_DATA.lastName}.
								</span>
							</h1>
						</div>

						<div className="max-w-lg">
							<p className="text-xl text-[#a1a1aa] font-light leading-relaxed italic">
								"{SITE_DATA.heroSection}"
							</p>
						</div>
					</div>
					<div className="lg:col-span-4 flex flex-col gap-12">
						<div className="space-y-4">
							<h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
								Services
							</h3>
							<ul className="space-y-2 text-sm font-light text-white/60">
								<li className="flex items-center gap-3 italic">
									<Icon
										icon="ph:gear-light"
										className="text-lg text-white/30"
									/>
									DevOps Infrastructure
								</li>
								<li className="flex items-center gap-3 italic">
									<Icon
										icon="ph:database-light"
										className="text-lg text-white/30"
									/>
									Backend Systems
								</li>
								<li className="flex items-center gap-3 italic">
									<Icon
										icon="ph:layout-light"
										className="text-lg text-white/30"
									/>
									Machine Learning
								</li>
							</ul>
						</div>
					</div>
				</div>
			</motion.section>

			{/* Projects Sections */}
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.3 }}
				className="space-y-24 max-w-7xl mx-auto w-full"
			>
				<HorizontalScroller
					title="Backend Engineering"
					projects={backendProjects}
				/>
				<HorizontalScroller
					title="Infrastructure & DevOps"
					projects={devopsProjects}
				/>
				{mlProjects.length > 0 && (
					<HorizontalScroller title="Machine Learning" projects={mlProjects} />
				)}
			</motion.section>
		</div>
	);
}
