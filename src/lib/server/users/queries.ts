import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { invalidateModeratorCache } from '$lib/server/auth/moderation';

export type UserSortOption = 'new' | 'old' | 'username';

function escapeIlike(str: string): string {
	return str.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

const userSelect = {
	id: users.id,
	source: users.source,
	sourceId: users.sourceId,
	username: users.username,
	avatarUrl: users.avatarUrl,
	bio: users.bio,
	htmlUrl: users.htmlUrl,
	name: users.name,
	email: users.email,
	bannedAt: users.bannedAt,
	bannedBy: users.bannedBy,
	createdAt: users.createdAt,
	updatedAt: users.updatedAt
} as const;

export interface ListUsersOptions {
	search?: string;
	limit?: number;
	offset?: number;
	sort?: UserSortOption;
}

function getSortColumn(sort: UserSortOption) {
	switch (sort) {
		case 'old':
			return users.createdAt;
		case 'username':
			return users.username;
		case 'new':
		default:
			return desc(users.createdAt);
	}
}

function buildConditions(options: ListUsersOptions): SQL[] {
	const { search } = options;
	const conditions: SQL[] = [];

	if (search) {
		const pattern = `%${escapeIlike(search)}%`;
		conditions.push(
			or(
				ilike(users.username, pattern),
				ilike(users.name, pattern),
				ilike(users.email, pattern)
			)!
		);
	}

	return conditions;
}

export async function listUsers(options: ListUsersOptions = {}) {
	const { limit = 20, offset = 0, sort = 'new' } = options;
	const conditions = buildConditions(options);

	const query = db
		.select(userSelect)
		.from(users)
		.orderBy(getSortColumn(sort))
		.limit(limit)
		.offset(offset);

	if (conditions.length > 0) {
		return query.where(and(...conditions));
	}

	return query;
}

export async function getUsersCount(options: ListUsersOptions = {}): Promise<number> {
	const conditions = buildConditions(options);

	const query = db.select({ count: sql<number>`count(*)::int` }).from(users);

	const [result] =
		conditions.length > 0 ? await query.where(and(...conditions)) : await query;

	return result?.count ?? 0;
}

export async function getUser(id: string) {
	const [result] = await db.select(userSelect).from(users).where(eq(users.id, id)).limit(1);
	return result;
}

export async function getUserByUsername(username: string, source?: string) {
	const [result] = await db
		.select(userSelect)
		.from(users)
		.where(source ? and(eq(users.username, username), eq(users.source, source)) : eq(users.username, username))
		.limit(1);
	return result;
}

// banUser marks the user as banned and hard-revokes every active session for
// them by deleting the rows from the `sessions` table. Without this, a banned
// user could keep acting on authenticated endpoints until their session cookie
// expired naturally — the session callback in src/auth.ts only kicks in on the
// next request that re-reads the user row, and even then returns an empty user
// object rather than invalidating the cookie. Deleting the session rows forces
// the next request to be treated as unauthenticated. The moderator cache is
// also invalidated so a banned moderator loses access immediately.
export async function banUser(id: string, bannedBy: string): Promise<void> {
	await db.transaction(async (tx) => {
		await tx
			.update(users)
			.set({ bannedAt: new Date(), bannedBy })
			.where(eq(users.id, id));
		await tx.delete(sessions).where(eq(sessions.userId, id));
	});
	invalidateModeratorCache(id);
}

export async function unbanUser(id: string): Promise<void> {
	await db
		.update(users)
		.set({ bannedAt: null, bannedBy: null })
		.where(eq(users.id, id));
}

export interface UserStats {
	total: number;
	banned: number;
	joinedLast7d: number;
}

export async function getUserStats(): Promise<UserStats> {
	const [totals] = await db
		.select({
			total: sql<number>`count(*)::int`,
			banned: sql<number>`count(*) filter (where ${users.bannedAt} is not null)::int`,
			joinedLast7d: sql<number>`count(*) filter (where ${users.createdAt} > now() - interval '7 days')::int`
		})
		.from(users);

	return {
		total: totals?.total ?? 0,
		banned: totals?.banned ?? 0,
		joinedLast7d: totals?.joinedLast7d ?? 0
	};
}
