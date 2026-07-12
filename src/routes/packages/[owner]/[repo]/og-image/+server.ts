import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getPackageByFullName } from '$lib/server/packages/queries';
import { renderCard } from '$lib/server/og/render-card';
import { packageDescription } from '$lib/utils/packageDescription';
import { formatNumber } from '$lib/utils/formatNumber';

export const GET: RequestHandler = async ({ params }) => {
	const fullName = `${params.owner}/${params.repo}`;
	const pkg = await getPackageByFullName(fullName);

	if (!pkg) {
		error(404, 'Package not found');
	}

	return renderCard({
		eyebrow: `${pkg.packageType} · ${pkg.owner}`,
		title: pkg.name,
		description: packageDescription(pkg),
		avatarUrl: pkg.ownerAvatarUrl,
		stats: [
			{ label: 'Stars', value: formatNumber(pkg.stars) },
			{ label: 'License', value: pkg.license || 'Unknown' }
		]
	});
};
