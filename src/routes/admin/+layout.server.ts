import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth/admin';

// Centralized guard for every page under /admin. Without this, a new admin
// page that forgets to call isAdmin() in its own +page.server.ts would be
// reachable by any signed-in user. The page-level load functions still keep
// their own checks as defense-in-depth, but this layout guard is the single
// source of truth that makes /admin/* fail-closed.
export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		throw error(401, 'You must be signed in to access admin.');
	}

	const admin = await isAdmin(session.user.id);
	if (!admin) {
		throw error(403, 'You do not have permission to access admin.');
	}
};
