import type { PageServerLoad } from './$types';
import {
	getStats,
	getNewPackages,
	getMostPopular,
	getRecentlyUpdated,
	getTopTopics
} from '$lib/server/packages/queries';
import { NO_VERSION } from '$lib/utils/version';

type Card = {
	name: string;
	fullName: string;
	owner: string;
	description: string;
	version: string;
	stars: number;
	packageType: string;
	repositoryUrl: string;
	pushedAt: string;
};

function toCard(pkg: {
	name: string;
	fullName: string;
	owner: string | null;
	description: string | null;
	version: string | null;
	stars: number;
	packageType: string;
	repositoryUrl: string;
	pushedAt: Date;
}): Card {
	return {
		name: pkg.name,
		fullName: pkg.fullName,
		owner: pkg.owner ?? pkg.fullName.split('/')[0],
		description: pkg.description ?? '',
		version: pkg.version ?? NO_VERSION,
		stars: pkg.stars,
		packageType: pkg.packageType,
		repositoryUrl: pkg.repositoryUrl,
		pushedAt: pkg.pushedAt.toISOString()
	};
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [stats, newPkgs, popularPkgs, updatedPkgs, topics] = await Promise.all([
		getStats(),
		getNewPackages(8),
		getMostPopular(8),
		getRecentlyUpdated(8),
		getTopTopics(6)
	]);

	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return {
		stats: {
			totalPackages: stats?.totalPackages ?? 0,
			totalLibraries: stats?.totalLibraries ?? 0,
			totalApplications: stats?.totalApplications ?? 0,
			totalStars: stats?.totalStars ?? 0
		},
		topics,
		newest: newPkgs.map(toCard),
		popular: popularPkgs.map(toCard),
		updated: updatedPkgs.map(toCard)
	};
};
