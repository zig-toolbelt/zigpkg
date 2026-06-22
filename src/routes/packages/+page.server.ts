import type { PageServerLoad } from './$types';
import { getPackages, getFilteredPackageCount } from '$lib/server/packages/queries';
import type { SortOption } from '$lib/server/packages/queries';
import type { PackageType } from '$lib/types/package';

const PAGE_SIZE = 30;

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
	const sort = (url.searchParams.get('sort') ?? 'stars') as SortOption;
	const letter = url.searchParams.get('letter') ?? undefined;
	const type = (url.searchParams.get('type') ?? undefined) as PackageType | undefined;

	const validSorts: SortOption[] = ['stars', 'name', 'new', 'updated'];
	const safeSort: SortOption = validSorts.includes(sort) ? sort : 'stars';

	const safeLetter = letter && /^[a-zA-Z]$/.test(letter) ? letter.toUpperCase() : undefined;

	const options = { sort: safeSort, packageType: type, letter: safeLetter };

	const [pkgs, totalCount] = await Promise.all([
		getPackages({ ...options, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
		getFilteredPackageCount(options)
	]);

	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return {
		packages: pkgs.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			description: pkg.description ?? '',
			version: pkg.version ?? 'latest',
			stars: pkg.stars,
			forks: pkg.forks,
			packageType: pkg.packageType,
			repositoryUrl: pkg.repositoryUrl,
			updatedAt: pkg.pushedAt.toISOString()
		})),
		totalCount,
		page,
		sort: safeSort,
		letter: safeLetter ?? null,
		type: type ?? null
	};
};
