import { SITE_DATA } from "@/src/data/data";
import { cn } from "@/src/lib/utils";

export function Footer() {

    const footItems = [
        { label: "GitHub", path: SITE_DATA.socials.github },
        { label: "LinkedIn", path: SITE_DATA.socials.linkedin },
        { label: "Email", path: SITE_DATA.email },
    ];


    return (
        <footer className="py-24 border-t border-white/5 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-[10px] uppercase tracking-widest text-white/20">
                    2026 AK — Built with Gemini & Antigravity
                </div>
                <div className="flex gap-8 text-[10px] uppercase tracking-widest text-white/40 font-bold">

                    {footItems.map((item) => (
                        <a
                            href={item.path}
                            className={cn(
                                "transition-colors hover:text-white",
                                location.pathname === item.path
                                    ? "text-white"
                                    : "text-white/40",
                            )}
                        >
                            {item.label}
                        </a>
                    ))}

                </div>
            </div>
        </footer>
    )
}