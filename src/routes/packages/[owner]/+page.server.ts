import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import {
	getPackages,
	getFilteredPackageCount,
	getOwnerStats,
	getOwnerCanonical,
	getOwnerProfile
} from '$lib/server/packages/queries';
import { ownerUrl } from '$lib/providers';
import { NO_VERSION } from '$lib/utils/version';
import { buildCanonical, siteUrl } from '$lib/seo';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const { owner } = params;

	let [pkgs, totalCount, stats] = await Promise.all([
		getPackages({ owner, limit: 100 }),
		getFilteredPackageCount({ owner }),
		getOwnerStats(owner)
	]);

	if (totalCount === 0) {
		const canonical = await getOwnerCanonical(owner);
		if (!canonical) {
			error(404, { message: 'Owner not found' });
		}
		if (canonical !== owner) {
			redirect(301, `/packages/${canonical}`);
		}

		const profile = await getOwnerProfile(owner);
		if (!profile) {
			error(404, { message: 'Owner not found' });
		}

		setHeaders({
			'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
		});

		return {
			owner,
			ownerAvatarUrl: profile.avatarUrl,
			source: profile.source ?? 'github',
			profileUrl: ownerUrl(profile.source ?? 'github', profile.username),
			totalCount: 0,
			totalStars: 0,
			packages: [],
			seo: {
				title: `${owner} — zigpkg`,
				description: `Zig packages published by ${owner} on zigpkg.`,
				image: `${siteUrl()}/packages/${owner}/og-image`,
				url: buildCanonical(`/packages/${owner}`),
				type: 'website'
			}
		};
	}

	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	const source = pkgs[0].source;

	return {
		owner,
		ownerAvatarUrl: pkgs[0].ownerAvatarUrl,
		source,
		profileUrl: ownerUrl(source, owner),
		totalCount,
		totalStars: stats.totalStars,
		seo: {
			title: `${owner} — zigpkg`,
			description: `Zig packages published by ${owner} on zigpkg — ${totalCount} package${totalCount === 1 ? '' : 's'}.`,
			image: `${siteUrl()}/packages/${owner}/og-image`,
			url: buildCanonical(`/packages/${owner}`),
			type: 'website'
		},
		packages: pkgs.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			fullName: pkg.fullName,
			source: pkg.source,
			owner: pkg.owner,
			description: pkg.description || '',
			version: pkg.version || NO_VERSION,
			packageType: pkg.packageType,
			stars: pkg.stars,
			openIssues: pkg.openIssues,
			pushedAt: pkg.pushedAt.toISOString(),
			repositoryUrl: pkg.repositoryUrl
		}))
	};
};
