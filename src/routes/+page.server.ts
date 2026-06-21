import type { PageServerLoad } from './$types';
import { getPackages, getStats } from '$lib/server/packages/queries';
import type { SortOption } from '$lib/server/packages/queries';

// TODO(remove): temporary mock cards shown when the registry is empty (no crawler data yet).
const MOCK_PACKAGES = [
	{
		name: 'zap',
		fullName: 'zigzap/zap',
		owner: 'zigzap',
		description: 'Blazingly fast backends in Zig, built on facil.io.',
		version: 'v0.10.3',
		stars: 2400,
		forks: 112,
		packageType: 'library',
		openIssues: 18,
		pushedAt: new Date('2026-05-30').toISOString(),
		repositoryUrl: 'https://github.com/zigzap/zap'
	},
	{
		name: 'zls',
		fullName: 'zigtools/zls',
		owner: 'zigtools',
		description: 'The Zig Language Server — completion, goto-definition and more.',
		version: 'v0.13.0',
		stars: 4100,
		forks: 289,
		packageType: 'application',
		openIssues: 64,
		pushedAt: new Date('2026-06-12').toISOString(),
		repositoryUrl: 'https://github.com/zigtools/zls'
	},
	{
		name: 'zig-clap',
		fullName: 'Hejsil/zig-clap',
		owner: 'Hejsil',
		description: 'Simple command-line argument parsing library for Zig.',
		version: 'v0.9.1',
		stars: 1300,
		forks: 74,
		packageType: 'library',
		openIssues: 9,
		pushedAt: new Date('2026-04-21').toISOString(),
		repositoryUrl: 'https://github.com/Hejsil/zig-clap'
	}
];

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

	const packages = pkgs.map((pkg) => ({
		name: pkg.name,
		fullName: pkg.fullName,
		owner: pkg.owner,
		description: pkg.description ?? '',
		version: pkg.version ?? 'latest',
		stars: pkg.stars,
		forks: pkg.forks,
		packageType: pkg.packageType,
		openIssues: pkg.openIssues,
		pushedAt: pkg.pushedAt.toISOString(),
		repositoryUrl: pkg.repositoryUrl
	}));

	return {
		// TODO(remove): fall back to mock cards while the registry has no data
		packages: packages.length > 0 ? packages : MOCK_PACKAGES,
		sort: safeSort,
		stats: {
			totalPackages: stats?.totalPackages ?? 0,
			totalLibraries: stats?.totalLibraries ?? 0,
			totalApplications: stats?.totalApplications ?? 0,
			totalStars: stats?.totalStars ?? 0
		}
	};
};
