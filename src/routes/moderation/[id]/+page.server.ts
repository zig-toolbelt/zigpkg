import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { isModerator } from '$lib/server/auth/moderation';
import { getSubmission, approvePackage, rejectPackage } from '$lib/server/packages/queries';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		throw error(401, 'You must be signed in to access moderation.');
	}

	const moderator = await isModerator(session.user.id);
	if (!moderator) {
		throw error(403, 'You do not have permission to access moderation.');
	}

	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid package id.');
	}

	const pkg = await getSubmission(id);
	if (!pkg) {
		throw error(404, 'Package not found.');
	}

	return {
		pkg: {
			id: pkg.id,
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			ownerAvatarUrl: pkg.ownerAvatarUrl,
			ownerHtmlUrl: pkg.ownerHtmlUrl,
			source: pkg.source,
			description: pkg.description ?? '',
			stars: pkg.stars,
			forks: pkg.forks,
			license: pkg.license,
			homepage: pkg.homepage,
			repositoryUrl: pkg.repositoryUrl,
			topics: pkg.topics ?? [],
			packageType: pkg.packageType,
			createdAt: pkg.createdAt.toISOString(),
			updatedAt: pkg.updatedAt.toISOString(),
			pushedAt: pkg.pushedAt.toISOString(),
			status: pkg.status,
			origin: pkg.origin,
			submittedAt: pkg.submittedAt?.toISOString() ?? null,
			primaryLanguage: pkg.primaryLanguage,
			hasZigFiles: pkg.hasZigFiles,
			hasBuildZigZon: pkg.hasBuildZigZon,
			rejectionReason: pkg.rejectionReason
		}
	};
};

export const actions: Actions = {
	approve: async ({ params, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const moderator = await isModerator(session.user.id, false);
		if (!moderator) {
			return fail(403, { error: 'Forbidden' });
		}

		const id = Number(params.id);
		if (isNaN(id)) {
			return fail(400, { error: 'Invalid package id.' });
		}

		const transitioned = await approvePackage(id, session.user.id);
		if (!transitioned) {
			return fail(409, { error: 'Package is not pending review.' });
		}
		return { success: true, action: 'approved' };
	},

	reject: async ({ request, params, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const moderator = await isModerator(session.user.id, false);
		if (!moderator) {
			return fail(403, { error: 'Forbidden' });
		}

		const id = Number(params.id);
		if (isNaN(id)) {
			return fail(400, { error: 'Invalid package id.' });
		}

		const formData = await request.formData();
		const reason = formData.get('reason')?.toString().trim() ?? '';
		if (!reason) {
			return fail(400, { error: 'A rejection reason is required.' });
		}

		const transitioned = await rejectPackage(id, session.user.id, reason);
		if (!transitioned) {
			return fail(409, { error: 'Package is not pending review.' });
		}
		return { success: true, action: 'rejected' };
	}
};
