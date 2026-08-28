import { db } from '$lib/server/db';
import { packages, users } from '$lib/server/db/schema';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';

export type AdminPackageStatusFilter = 'approved' | 'pending' | 'rejected' | 'all';
export type AdminPackageOriginFilter = 'sync' | 'manual' | 'all';
export type AdminPackageSortOption = 'stars' | 'updated' | 'new' | 'name';

function escapeIlike(str: string): string {
	return str.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

const adminPackageSelect = {
	id: packages.id,
	source: packages.source,
	name: packages.name,
	fullName: packages.fullName,
	owner: users.username,
	ownerId: packages.ownerId,
	description: packages.description,
	stars: packages.stars,
	forks: packages.forks,
	license: packages.license,
	repositoryUrl: packages.repositoryUrl,
	packageType: packages.packageType,
	status: packages.status,
	origin: packages.origin,
	createdAt: packages.createdAt,
	updatedAt: packages.updatedAt,
	pushedAt: packages.pushedAt,
	submittedBy: packages.submittedBy,
	submittedAt: packages.submittedAt
} as const;

export interface AdminListPackagesOptions {
	search?: string;
	status?: AdminPackageStatusFilter;
	origin?: AdminPackageOriginFilter;
	limit?: number;
	offset?: number;
	sort?: AdminPackageSortOption;
}

function getSortColumn(sort: AdminPackageSortOption) {
	switch (sort) {
		case 'stars':
			return desc(packages.stars);
		case 'updated':
			return desc(packages.pushedAt);
		case 'name':
			return packages.name;
		case 'new':
		default:
			return desc(packages.createdAt);
	}
}

function buildConditions(options: AdminListPackagesOptions): SQL[] {
	const { search, status, origin } = options;
	const conditions: SQL[] = [];

	if (status && status !== 'all') {
		conditions.push(eq(packages.status, status));
	}

	if (origin && origin !== 'all') {
		conditions.push(eq(packages.origin, origin));
	}

	if (search) {
		const pattern = `%${escapeIlike(search)}%`;
		conditions.push(
			or(ilike(packages.name, pattern), ilike(packages.fullName, pattern), ilike(users.username, pattern))!
		);
	}

	return conditions;
}

export async function adminListPackages(options: AdminListPackagesOptions = {}) {
	const { limit = 20, offset = 0, sort = 'new' } = options;
	const conditions = buildConditions(options);

	const query = db
		.select(adminPackageSelect)
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id))
		.orderBy(getSortColumn(sort))
		.limit(limit)
		.offset(offset);

	if (conditions.length > 0) {
		return query.where(and(...conditions));
	}

	return query;
}

export async function adminGetPackagesCount(options: AdminListPackagesOptions = {}): Promise<number> {
	const conditions = buildConditions(options);

	const query = db
		.select({ count: sql<number>`count(*)::int` })
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id));

	const [result] =
		conditions.length > 0 ? await query.where(and(...conditions)) : await query;

	return result?.count ?? 0;
}

export async function deletePackage(id: number): Promise<void> {
	await db.delete(packages).where(eq(packages.id, id));
}

export async function setPackageStatus(id: number, status: 'approved' | 'pending' | 'rejected'): Promise<void> {
	await db.update(packages).set({ status }).where(eq(packages.id, id));
}

export async function setPackageOwner(id: number, newOwnerId: string): Promise<void> {
	await db.update(packages).set({ ownerId: newOwnerId }).where(eq(packages.id, id));
}

// adminGetPackageSource returns the source and current owner of a package, so
// the setOwner action can scope the new owner lookup to the same source. This
// prevents a same-username collision across GitHub and Codeberg from
// silently reassigning a package to the wrong host's user.
export async function adminGetPackageSource(
	id: number
): Promise<{ source: string; ownerId: string } | null> {
	const [result] = await db
		.select({ source: packages.source, ownerId: packages.ownerId })
		.from(packages)
		.where(eq(packages.id, id))
		.limit(1);
	return result ?? null;
}

export interface AdminPackageStats {
	total: number;
	approved: number;
	pending: number;
	rejected: number;
	manual: number;
}

export async function adminGetPackageStats(): Promise<AdminPackageStats> {
	const [result] = await db
		.select({
			total: sql<number>`count(*)::int`,
			approved: sql<number>`count(*) filter (where ${packages.status} = 'approved')::int`,
			pending: sql<number>`count(*) filter (where ${packages.status} = 'pending')::int`,
			rejected: sql<number>`count(*) filter (where ${packages.status} = 'rejected')::int`,
			manual: sql<number>`count(*) filter (where ${packages.origin} = 'manual')::int`
		})
		.from(packages);

	return {
		total: result?.total ?? 0,
		approved: result?.approved ?? 0,
		pending: result?.pending ?? 0,
		rejected: result?.rejected ?? 0,
		manual: result?.manual ?? 0
	};
}
