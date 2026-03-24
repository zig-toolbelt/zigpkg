import type { PageServerLoad } from './$types';
import { getPackages, getStats } from '$lib/server/packages/queries';
import type { SortOption } from '$lib/server/packages/queries';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const sort = (url.searchParams.get('sort') ?? 'new') as SortOption;
	const validSorts: SortOption[] = ['new', 'stars', 'name'];
	const safeSort: SortOption = validSorts.includes(sort) ? sort : 'new';

	const [pkgs, stats] = await Promise.all([
		getPackages({ sort: safeSort, limit: 18 }),
		getStats()
	]);

	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return {
		packages: pkgs.map((pkg) => ({
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			description: pkg.description ?? '',
			version: pkg.version ?? 'latest',
			stars: pkg.stars,
			openIssues: pkg.openIssues,
			pushedAt: pkg.pushedAt.toISOString(),
			repositoryUrl: pkg.repositoryUrl
		})),
		sort: safeSort,
		stats: {
			totalPackages: stats?.totalPackages ?? 0,
			totalLibraries: stats?.totalLibraries ?? 0,
			totalApplications: stats?.totalApplications ?? 0,
			totalStars: stats?.totalStars ?? 0
		}
	};
};
