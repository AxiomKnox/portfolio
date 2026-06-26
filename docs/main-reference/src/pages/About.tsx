import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { SITE_DATA, SKILLS } from "@/src/data/data";
import { delay } from "motion";

export function About() {
	return (
		<div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-24">
			{/* Bio Section */}
			<section className="grid grid-cols-1 md:grid-cols-12 gap-12">
				<div className="md:col-span-8 space-y-8">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-5xl font-serif text-white italic"
					>
						Engineering with <br />
						<span className="not-italic text-white/40">
							Technical Perfection.
						</span>
					</motion.h1>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="space-y-6 text-lg font-light text-[#a1a1aa] leading-relaxed">
						<p>{SITE_DATA.aboutMe[1]}</p>
						<p>{SITE_DATA.aboutMe[2]}</p>
					</motion.div>
				</div>
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="md:col-span-4 space-y-8">
					<div className="aspect-square border border-white/10 p-4 bg-white/5 relative overflow-hidden group">
						{/* Placeholder for Profile Pic or Abstract Art */}
						<div className="w-full h-full border border-white/5 flex items-center justify-center text-white/10 font-serif text-6xl">
							AK
						</div>
						<div className="absolute inset-0" />
					</div>
					<div class="grid grid-cols-2">

						<div className="space-y-2">
							<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
								Contact
							</p>
							<p className="text-sm font-light text-white/80">
								{SITE_DATA.email}
							</p>
						</div>
						{/* <div className="space-y-2">
							<p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
								Location
							</p>
							<p className="text-sm font-light text-white/80">
								{SITE_DATA.location}
							</p>
						</div> */}
					</div>
				</motion.div>
			</section>

			{/* Skills Grid */}
			<motion.section 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.225 }}
				className="space-y-12">
				<div className="h-px bg-white/10 w-full" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
					{SKILLS.map((item) => (
						<div key={item.category} className="space-y-6">
							<h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
								{item.category}
							</h3>
							<ul className="space-y-3">
								{item.items.map((skill) => (
									<li
									key={skill}
									className="text-sm font-light text-white/70 flex items-center gap-2"
									>
										<div className="w-1 h-1 bg-white/20 rounded-full" />
										{skill}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</motion.section>

			{/* Subtle Resume Section */}
			<motion.section 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.325 }}
				className="space-y-12 pt-12">
				<div className="border border-white/10 p-1 bg-white/5">
					<div className="border border-white/10 p-12 text-center space-y-6 relative overflow-hidden">
						<div className="absolute top-0 right-0 p-4">
							<Icon
								icon="ph:file-pdf-light"
								className="text-4xl text-white/5 rotate-12 transition-transform group-hover:rotate-0"
							/>
						</div>

						<h3 className="text-2xl font-serif text-white italic">
							Resume
						</h3>
						<p className="text-sm text-white/40 font-light max-w-md mx-auto">
							An overview of my professional experience, education, and
							technical contributions over the years.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<a
								href={`${import.meta.env.BASE_URL}${SITE_DATA.resumeUrl.replace(/^\//, "")}`}
								target="_blank"
								rel="noopener noreferrer"
								className="px-8 py-3 border border-white/20 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
							>
								Download PDF
							</a>
							{/* <button
								className="px-8 py-3 border border-white/5 text-xs uppercase tracking-widest font-light text-white/40 hover:text-white transition-colors"
								onClick={() => alert("Resume preview feature coming soon.")}
							>
								In-browser Preview
							</button> */}
						</div>
					</div>
				</div>
			</motion.section>
		</div>
	);
}
