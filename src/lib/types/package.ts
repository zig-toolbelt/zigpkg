export type PackageType = 'library' | 'application';

export interface ZigPackage {
	id: number;
	source: string;
	sourceId: number;
	name: string;
	fullName: string;
	owner: string;
	ownerAvatarUrl: string | null;
	ownerHtmlUrl: string | null;
	description: string | null;
	version: string;
	stars: number;
	forks: number;
	license: string | null;
	homepage: string | null;
	repositoryUrl: string;
	topics: string[];
	packageType: PackageType;
	createdAt: Date;
	updatedAt: Date;
	pushedAt: Date;
	cachedAt: Date;
}

export interface PackageListItem {
	name: string;
	description: string | null;
	version: string;
	downloads?: string;
	isNew?: boolean;
}

export interface PackageStats {
	totalPackages: number;
	totalLibraries: number;
	totalApplications: number;
	totalStars: number;
}
