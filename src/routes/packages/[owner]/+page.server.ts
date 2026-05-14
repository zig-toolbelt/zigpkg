import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import {
	getPackages,
	getFilteredPackageCount,
	getOwnerCanonical
} from '$lib/server/packages/queries';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const { owner } = params;

	let [pkgs, totalCount] = await Promise.all([
		getPackages({ owner }),
		getFilteredPackageCount({ owner })
	]);

	if (totalCount === 0) {
		const canonical = await getOwnerCanonical(owner);
		if (canonical && canonical !== owner) {
			redirect(301, `/packages/${canonical}`);
		}
		error(404, { message: 'Owner not found' });
	}

	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return {
		owner,
		ownerAvatarUrl: pkgs[0].ownerAvatarUrl,
		totalCount,
		packages: pkgs.map((pkg) => ({
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			description: pkg.description || '',
			version: pkg.version || 'latest',
			stars: pkg.stars,
			openIssues: pkg.openIssues,
			pushedAt: pkg.pushedAt.toISOString(),
			repositoryUrl: pkg.repositoryUrl
		}))
	};
};
