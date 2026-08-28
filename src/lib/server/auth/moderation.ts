import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users, accounts } from '$lib/server/db/schema';
import { githubClient } from '$lib/server/github/client';

// Cache TTL is intentionally short: a moderator removed from the GitHub team
// should lose access within a minute, not 5. Mutating actions (approve/reject)
// bypass the cache entirely (call isModerator(userId, false)) so a revoked
// moderator cannot act during the cache window.
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
	isModerator: boolean;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// isModerator reports whether the given user is an active member of the
// configured moderator team on GitHub. Membership is verified through the
// user's own OAuth access token (the read:org scope granted at sign-in), so a
// server-issued token is never used to impersonate them. Results are cached per
// user for a short window to avoid hitting the GitHub API on every request.
//
// Pass `useCache: false` for mutating actions (approve/reject package) so that
// a moderator removed from the team loses the ability to act immediately,
// rather than up to CACHE_TTL_MS later.
export async function isModerator(userId: string, useCache = true): Promise<boolean> {
	if (useCache) {
		const cached = cache.get(userId);
		if (cached && cached.expiresAt > Date.now()) {
			return cached.isModerator;
		}
	}

	const org = env.MODERATOR_ORG;
	const team = env.MODERATOR_TEAM;
	if (!org || !team) {
		return false;
	}

	const [user] = await db
		.select({ username: users.username })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	if (!user) {
		return false;
	}

	const [account] = await db
		.select({ accessToken: accounts.access_token })
		.from(accounts)
		.where(eq(accounts.userId, userId))
		.limit(1);
	if (!account?.accessToken) {
		return false;
	}

	const member = await githubClient.getTeamMembership(
		org,
		team,
		user.username,
		account.accessToken
	);

	cache.set(userId, {
		isModerator: member,
		expiresAt: Date.now() + CACHE_TTL_MS
	});
	return member;
}

// invalidateModeratorCache drops the cached membership for a user. Call this
// when a user is banned (so they cannot act as a moderator even within the
// cache window) or when you otherwise know their team membership changed.
export function invalidateModeratorCache(userId: string): void {
	cache.delete(userId);
}
