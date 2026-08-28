import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth/admin';
import {
	adminListPackages,
	adminGetPackagesCount,
	deletePackage,
	setPackageStatus,
	setPackageOwner,
	adminGetPackageSource,
	type AdminPackageStatusFilter,
	type AdminPackageOriginFilter,
	type AdminPackageSortOption
} from '$lib/server/packages/admin-queries';
import { getUserByUsername } from '$lib/server/users/queries';

const PAGE_SIZE = 20;

// Authorization is enforced by src/routes/admin/+layout.server.ts.

function parseStatus(value: string | null): AdminPackageStatusFilter {
	if (value === 'approved' || value === 'pending' || value === 'rejected') return value;
	return 'all';
}

function parseOrigin(value: string | null): AdminPackageOriginFilter {
	if (value === 'sync' || value === 'manual') return value;
	return 'all';
}

function parseSort(value: string | null): AdminPackageSortOption {
	if (value === 'stars' || value === 'updated' || value === 'name') return value;
	return 'new';
}

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q')?.trim() || undefined;
	const status = parseStatus(url.searchParams.get('status'));
	const origin = parseOrigin(url.searchParams.get('origin'));
	const sort = parseSort(url.searchParams.get('sort'));
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
	const offset = (page - 1) * PAGE_SIZE;

	const [pkgs, total] = await Promise.all([
		adminListPackages({ search, status, origin, sort, limit: PAGE_SIZE, offset }),
		adminGetPackagesCount({ search, status, origin })
	]);

	return {
		packages: pkgs.map((p) => ({
			id: p.id,
			source: p.source,
			name: p.name,
			fullName: p.fullName,
			owner: p.owner,
			ownerId: p.ownerId,
			description: p.description,
			stars: p.stars,
			license: p.license,
			repositoryUrl: p.repositoryUrl,
			packageType: p.packageType,
			status: p.status,
			origin: p.origin,
			createdAt: p.createdAt.toISOString(),
			updatedAt: p.updatedAt.toISOString(),
			pushedAt: p.pushedAt.toISOString()
		})),
		search: search ?? '',
		status,
		origin,
		sort,
		page,
		pageSize: PAGE_SIZE,
		total
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const admin = await isAdmin(session.user.id);
		if (!admin) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (isNaN(id)) {
			return fail(400, { error: 'Invalid package id.' });
		}

		await deletePackage(id);
		return { success: true, action: 'deleted' };
	},

	setStatus: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const admin = await isAdmin(session.user.id);
		if (!admin) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status')?.toString();
		if (isNaN(id) || !status || !['approved', 'pending', 'rejected'].includes(status)) {
			return fail(400, { error: 'Invalid id or status.' });
		}

		await setPackageStatus(id, status as 'approved' | 'pending' | 'rejected');
		return { success: true, action: 'status', status };
	},

	setOwner: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const admin = await isAdmin(session.user.id);
		if (!admin) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const username = formData.get('username')?.toString().trim();
		if (isNaN(id) || !username) {
			return fail(400, { error: 'Invalid id or username.' });
		}

		const pkg = await adminGetPackageSource(id);
		if (!pkg) {
			return fail(404, { error: 'Package not found.' });
		}

		const newOwner = await getUserByUsername(username, pkg.source);
		if (!newOwner) {
			return fail(404, { error: `User "${username}" not found on ${pkg.source}.` });
		}

		await setPackageOwner(id, newOwner.id);
		return { success: true, action: 'owner', username };
	}
};
