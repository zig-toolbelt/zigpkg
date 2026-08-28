import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isModerator } from '$lib/server/auth/moderation';
import { getPendingPackages, getPendingPackageCount, getFlaggedPackages } from '$lib/server/packages/queries';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		throw error(401, 'You must be signed in to access moderation.');
	}

	const moderator = await isModerator(session.user.id);
	if (!moderator) {
		throw error(403, 'You do not have permission to access moderation.');
	}

	const tab = url.searchParams.get('tab') === 'flagged' ? 'flagged' : 'pending';

	const [packages, pendingCount] = await Promise.all([
		tab === 'flagged' ? getFlaggedPackages() : getPendingPackages(),
		getPendingPackageCount()
	]);

	return {
		tab,
		packages: packages.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			description: pkg.description ?? '',
			stars: pkg.stars,
			repositoryUrl: pkg.repositoryUrl,
			origin: pkg.origin,
			submittedAt: pkg.submittedAt?.toISOString() ?? null,
			primaryLanguage: pkg.primaryLanguage,
			hasZigFiles: pkg.hasZigFiles,
			hasBuildZigZon: pkg.hasBuildZigZon
		})),
		pendingCount
	};
};
