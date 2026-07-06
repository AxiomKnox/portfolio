import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { SITE_DATA } from "@/src/data/data"; 
import { cn } from "@/src/lib/utils";
import { useTheme } from "@/src/app/providers/theme-provider";

export function Navbar() {
	const location = useLocation();
	const { theme, setTheme } = useTheme();

	const navItems = [
		{ label: "Home", path: "/" },
		{ label: "Projects", path: "/projects" },
		{ label: "About", path: "/about" },
	];

	return (
		<nav
			className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md rounded-b-3xl"
			style={{ backgroundColor: "var(--nav-bg)" }}
		>
			<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-3 group">
					<div className="w-8 h-8 border border-white/20 flex items-center justify-center font-serif text-sm group-hover:bg-white/5 transition-colors">
						{SITE_DATA.shortInitials}
					</div>
					<span className="text-[11px] uppercase tracking-widest hidden sm:block">
						{SITE_DATA.firstName} {SITE_DATA.lastName}
					</span>
				</Link>

				<div className="flex items-center gap-8">
					<div className="hidden md:flex items-center gap-8">
						{navItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"text-[11px] uppercase tracking-widest transition-colors hover:text-white",
									location.pathname === item.path
										? "text-white"
										: "text-white/40",
								)}
							>
								{item.label}
							</Link>
						))}
					</div>

					<div className="h-4 w-[1px] bg-white/10 hidden md:block" />

					<div className="flex items-center gap-4">

						{/* Theme Toggle Indicator */}
						<button
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							aria-label="Toggle Theme"
							className="flex items-center justify-center p-2 border border-white/10 hover:bg-white/5 transition-colors sm:rounded-full"
						>
							<Icon
								icon={theme === "dark" ? "ph:sun-light" : "ph:moon-light"}
								className="text-lg"
							/>
						</button>
						{/* AI Assisted Indicator */}
						<div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
							<div className="relative flex h-1.5 w-1.5">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
							</div>
							<span className="text-[9px] uppercase tracking-tighter font-semibold text-cyan-500/80">
								AI ASSISTED
							</span>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
