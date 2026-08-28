import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isAdmin } from '$lib/server/auth/admin';
import {
	listUsers,
	getUsersCount,
	banUser,
	unbanUser,
	getUser,
	type UserSortOption
} from '$lib/server/users/queries';

const PAGE_SIZE = 20;

// Authorization is enforced by src/routes/admin/+layout.server.ts.

function getAdminUsernames(): Set<string> {
	return new Set(
		(env.ADMIN_USERNAMES ?? '')
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean)
	);
}

function parseSort(value: string | null): UserSortOption {
	if (value === 'old' || value === 'username') return value;
	return 'new';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth();
	const currentUserId = session?.user?.id ?? null;

	const search = url.searchParams.get('q')?.trim() || undefined;
	const sort = parseSort(url.searchParams.get('sort'));
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
	const offset = (page - 1) * PAGE_SIZE;

	const [users, total] = await Promise.all([
		listUsers({ search, sort, limit: PAGE_SIZE, offset }),
		getUsersCount({ search })
	]);

	const adminUsernames = getAdminUsernames();

	return {
		users: users.map((u) => ({
			id: u.id,
			source: u.source,
			username: u.username,
			avatarUrl: u.avatarUrl,
			htmlUrl: u.htmlUrl,
			name: u.name,
			email: u.email,
			bannedAt: u.bannedAt?.toISOString() ?? null,
			createdAt: u.createdAt.toISOString(),
			isAdmin: adminUsernames.has(u.username.toLowerCase())
		})),
		search: search ?? '',
		sort,
		page,
		pageSize: PAGE_SIZE,
		total,
		currentUserId
	};
};

export const actions: Actions = {
	ban: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const admin = await isAdmin(session.user.id);
		if (!admin) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString().trim();
		if (!userId) {
			return fail(400, { error: 'User id is required.' });
		}

		if (userId === session.user.id) {
			return fail(400, { error: 'You cannot ban yourself.' });
		}

		const target = await getUser(userId);
		if (!target) {
			return fail(404, { error: 'User not found.' });
		}

		const adminUsernames = getAdminUsernames();
		if (adminUsernames.has(target.username.toLowerCase())) {
			return fail(400, { error: 'You cannot ban another admin.' });
		}

		await banUser(userId, session.user.id);
		return { success: true, action: 'banned' };
	},

	unban: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const admin = await isAdmin(session.user.id);
		if (!admin) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString().trim();
		if (!userId) {
			return fail(400, { error: 'User id is required.' });
		}

		await unbanUser(userId);
		return { success: true, action: 'unbanned' };
	}
};
