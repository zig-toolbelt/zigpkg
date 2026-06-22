import type { PageServerLoad } from './$types';
import { getPackages, getFilteredPackageCount } from '$lib/server/packages/queries';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));

	const options = { search: q || undefined };

	const [pkgs, totalCount] = await Promise.all([
		getPackages({ ...options, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
		getFilteredPackageCount(options)
	]);

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
			repositoryUrl: pkg.repositoryUrl
		})),
		totalCount,
		page,
		q
	};
};
