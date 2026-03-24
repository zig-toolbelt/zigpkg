import { db } from '$lib/server/db';
import { packages, packageContent, users } from '$lib/server/db/schema';
import { desc, eq, sql, or, ilike, and } from 'drizzle-orm';
import type { PackageType } from '$lib/types/package';

export type SortOption = 'stars' | 'updated' | 'new' | 'name';

function escapeIlike(str: string): string {
	return str.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

// Flat package row with owner info joined from users table
const packageSelect = {
	id: packages.id,
	githubId: packages.githubId,
	name: packages.name,
	fullName: packages.fullName,
	owner: users.username,
	ownerAvatarUrl: users.avatarUrl,
	description: packages.description,
	version: packages.version,
	stars: packages.stars,
	forks: packages.forks,
	openIssues: packages.openIssues,
	license: packages.license,
	homepage: packages.homepage,
	repositoryUrl: packages.repositoryUrl,
	topics: packages.topics,
	packageType: packages.packageType,
	createdAt: packages.createdAt,
	updatedAt: packages.updatedAt,
	pushedAt: packages.pushedAt,
	cachedAt: packages.cachedAt
};

interface QueryOptions {
	limit?: number;
	offset?: number;
	sort?: SortOption;
	packageType?: PackageType;
	search?: string;
	letter?: string;
	owner?: string;
}

function getSortColumn(sort: SortOption) {
	switch (sort) {
		case 'stars':
			return desc(packages.stars);
		case 'new':
			return desc(packages.createdAt);
		case 'updated':
			return desc(packages.pushedAt);
		case 'name':
			return packages.name;
		default:
			return desc(packages.stars);
	}
}

function buildConditions(options: QueryOptions) {
	const { packageType, search, letter, owner } = options;
	const conditions = [];

	if (packageType) {
		conditions.push(eq(packages.packageType, packageType));
	}

	if (search) {
		const escaped = escapeIlike(search);
		conditions.push(
			or(ilike(packages.name, `%${escaped}%`), ilike(packages.description, `%${escaped}%`))
		);
	}

	if (letter) {
		conditions.push(ilike(packages.name, `${letter}%`));
	}

	if (owner) {
		conditions.push(eq(users.username, owner));
	}

	return conditions;
}

export async function getPackages(options: QueryOptions = {}) {
	const { limit = 20, offset = 0, sort = 'stars' } = options;

	const conditions = buildConditions(options);
	const query = db
		.select(packageSelect)
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

export async function getFilteredPackageCount(options: QueryOptions = {}): Promise<number> {
	const conditions = buildConditions(options);

	const query = db
		.select({ count: sql<number>`count(*)::int` })
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id));

	const [result] = conditions.length > 0
		? await query.where(and(...conditions))
		: await query;

	return result?.count ?? 0;
}

export async function getMostPopular(limit = 6) {
	return db
		.select(packageSelect)
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id))
		.orderBy(desc(packages.stars))
		.limit(limit);
}

export async function getNewPackages(limit = 4) {
	return db
		.select(packageSelect)
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id))
		.orderBy(desc(packages.createdAt))
		.limit(limit);
}

export async function getRecentlyUpdated(limit = 4) {
	return db
		.select(packageSelect)
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id))
		.orderBy(desc(packages.pushedAt))
		.limit(limit);
}

export async function getPackageByFullName(fullName: string) {
	const [result] = await db
		.select()
		.from(packages)
		.innerJoin(users, eq(packages.ownerId, users.id))
		.leftJoin(packageContent, eq(packages.id, packageContent.packageId))
		.where(eq(packages.fullName, fullName))
		.limit(1);

	if (!result) return undefined;

	return {
		...result.packages,
		owner: result.users.username,
		ownerAvatarUrl: result.users.avatarUrl,
		content: result.package_content
	};
}

export async function getStats() {
	const [result] = await db
		.select({
			totalPackages: sql<number>`count(*)::int`,
			totalLibraries: sql<number>`count(*) filter (where ${packages.packageType} = 'library')::int`,
			totalApplications: sql<number>`count(*) filter (where ${packages.packageType} = 'application')::int`,
			totalStars: sql<number>`coalesce(sum(${packages.stars}), 0)::int`
		})
		.from(packages);

	return result;
}

export async function getAllPackageNames() {
	return db
		.select({ name: packages.name, fullName: packages.fullName, updatedAt: packages.updatedAt })
		.from(packages);
}

export async function updatePackageContent(
	packageId: number,
	data: {
		readme: string | null;
		tags: { name: string; sha: string }[];
		files: { name: string; path: string; type: string; size: number; htmlUrl: string | null }[];
		zonContent: string | null;
		lastSync: Date;
	}
) {
	await db
		.insert(packageContent)
		.values({
			packageId,
			readme: data.readme,
			tags: data.tags,
			files: data.files,
			zonContent: data.zonContent,
			lastSync: data.lastSync
		})
		.onConflictDoUpdate({
			target: packageContent.packageId,
			set: {
				readme: data.readme,
				tags: data.tags,
				files: data.files,
				zonContent: data.zonContent,
				lastSync: data.lastSync
			}
		});
}

export async function getPackageCount() {
	const [result] = await db
		.select({
			count: sql<number>`count(*)::int`
		})
		.from(packages);

	return result?.count ?? 0;
}
