import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getOwnerProfile, getFilteredPackageCount, getOwnerStats } from '$lib/server/packages/queries';
import { renderCard } from '$lib/server/og/render-card';
import { formatNumber } from '$lib/utils/formatNumber';

export const GET: RequestHandler = async ({ params }) => {
	const profile = await getOwnerProfile(params.owner);

	if (!profile) {
		error(404, 'Owner not found');
	}

	const [totalCount, stats] = await Promise.all([
		getFilteredPackageCount({ owner: profile.username }),
		getOwnerStats(profile.username)
	]);

	return renderCard({
		eyebrow: 'Owner profile',
		title: profile.username,
		description: `${totalCount} Zig package${totalCount === 1 ? '' : 's'} on zigpkg`,
		avatarUrl: profile.avatarUrl,
		stats: [
			{ label: 'Packages', value: String(totalCount) },
			{ label: 'Stars', value: formatNumber(stats.totalStars) }
		]
	});
};
