export interface SiteData {
	firstName: string;
	lastName: string;
	shortInitials: string;
	longInitials: string;
	role: string;
	location: string;
	email: string;
	socials: {
		github: string;
		linkedin: string;
	};
	resumeUrl: string;
	heroSection: string;
	aboutMe: {
		1: string;
		2: string;
	};
}
