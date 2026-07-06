export interface ParsedPersonal {
	firstName: string;
	lastName: string;
	shortInitials: string;
	longInitials: string;
	role: string;
	location: string;
	email: string;
	github: string;
	linkedin: string;
	resumeUrl: string;
	heroSection: string;
	heroAdditionalText: string;
	aboutParagraphs: string[];
	skills: { category: string; items: string[] }[];
	experience: {
		title: string;
		company: string;
		location: string;
		duration: string;
		description: string;
	}[];
	certifications: { name: string; issuer?: string; url?: string }[];
	yearsOfExperience?: string;
	education?: string;
}

export function parsePersonalMarkdown(markdown: string): ParsedPersonal {
	const lines = markdown.split("\n");
	let section = "";
	let subsection = "";
	const aboutParagraphs: string[] = [];
	const skills: { category: string; items: string[] }[] = [];
	const experience: ParsedPersonal["experience"] = [];
	const certifications: ParsedPersonal["certifications"] = [];

	const data: Partial<ParsedPersonal> = {
		resumeUrl: "/resume.pdf",
		aboutParagraphs,
		skills,
		experience,
		certifications,
	};

	let currentExp: Partial<ParsedPersonal["experience"][0]> | null = null;
	let currentCert: Partial<ParsedPersonal["certifications"][0]> | null = null;
	let currentSkill: { category: string; items: string[] } | null = null;

	for (const line of lines) {
		if (line.startsWith("## ")) {
			if (currentExp?.title) {
				experience.push(currentExp as ParsedPersonal["experience"][0]);
				currentExp = null;
			}
			if (currentCert?.name) {
				certifications.push(currentCert as ParsedPersonal["certifications"][0]);
				currentCert = null;
			}
			section = line.replace(/^## /, "").trim().toLowerCase();
			subsection = "";
		} else if (line.startsWith("### ")) {
			if (currentExp?.title) {
				experience.push(currentExp as ParsedPersonal["experience"][0]);
			}
			if (currentCert?.name) {
				certifications.push(currentCert as ParsedPersonal["certifications"][0]);
			}
			subsection = line.replace(/^### /, "").trim();
			if (section === "skills") {
				if (currentSkill) skills.push(currentSkill);
				currentSkill = { category: subsection, items: [] };
			} else if (section === "experience") {
				currentExp = { title: subsection, company: "", location: "", duration: "", description: "" };
			} else if (section === "certifications") {
				currentCert = { name: subsection };
			}
		} else if (line.trim()) {
			const text = line.trim();
			switch (section) {
				case "full name": {
					const parts = text.split(/\s+/);
					data.firstName = parts[0] ?? "Abj";
					data.lastName = parts.slice(1).join(" ") || "Ksh";
					data.shortInitials = `${data.firstName[0]}${data.lastName[0] ?? ""}`;
					data.longInitials = `${data.firstName} ${data.lastName[0] ?? ""}`;
					break;
				}
				case "hero summary":
					data.heroSection = text;
					break;
				case "hero additional text":
					data.heroAdditionalText = text;
					break;
				case "role":
					data.role = text;
					break;
				case "location":
					data.location = text;
					break;
				case "email":
					data.email = text;
					break;
				case "github":
					data.github = text;
					break;
				case "linkedin":
					data.linkedin = text;
					break;
				case "resume":
					data.resumeUrl = text;
					break;
				case "about me":
					aboutParagraphs.push(text);
					break;
				case "years of experience":
					data.yearsOfExperience = text;
					break;
				case "education":
					data.education = text;
					break;
				case "skills":
					if (currentSkill && text.includes(",")) {
						currentSkill.items.push(
							...text.split(",").map((s) => s.trim()).filter(Boolean),
						);
					}
					break;
				case "experience":
					if (currentExp) {
						if (text.startsWith("Company:")) currentExp.company = text.replace("Company:", "").trim();
						else if (text.startsWith("Location:")) currentExp.location = text.replace("Location:", "").trim();
						else if (text.startsWith("Duration:")) currentExp.duration = text.replace("Duration:", "").trim();
						else if (text.startsWith("Description:")) currentExp.description = text.replace("Description:", "").trim();
					}
					break;
				case "certifications":
					if (currentCert && text.startsWith("Issuer:")) {
						currentCert.issuer = text.replace("Issuer:", "").trim();
					}
					break;
			}
		}
	}

	if (currentSkill) skills.push(currentSkill);
	if (currentExp?.title) experience.push(currentExp as ParsedPersonal["experience"][0]);
	if (currentCert?.name) certifications.push(currentCert as ParsedPersonal["certifications"][0]);

	return {
		firstName: data.firstName ?? "Abj",
		lastName: data.lastName ?? "Ksh",
		shortInitials: data.shortInitials ?? "AK",
		longInitials: data.longInitials ?? "Ab Ks",
		role: data.role ?? "DevOps Engineer",
		location: data.location ?? "",
		email: data.email ?? "hello@example.com",
		github: data.github ?? "https://github.com",
		linkedin: data.linkedin ?? "https://linkedin.com",
		resumeUrl: data.resumeUrl ?? "/resume.pdf",
		heroSection: data.heroSection ?? "",
		heroAdditionalText: data.heroAdditionalText ?? "",
		aboutParagraphs,
		skills,
		experience,
		certifications,
		yearsOfExperience: data.yearsOfExperience,
		education: data.education,
	};
}
