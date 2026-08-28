import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { submitPackage } from '$lib/server/packages/submissions';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	return {
		isLoggedIn: !!session?.user,
		username: session?.user?.username ?? null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'You must be signed in to submit a package.' });
		}

		const formData = await request.formData();
		const repo = formData.get('repo')?.toString().trim() ?? '';
		if (!repo) {
			return fail(400, { error: 'Please enter a repository URL or owner/repo.' });
		}

		const result = await submitPackage(session.user.id, repo);
		if (!result.ok) {
			return fail(400, { error: result.error, repo });
		}

		return { success: true, packageId: result.packageId, warnings: result.warnings, repo };
	}
};
