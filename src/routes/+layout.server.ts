import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { syncMetadata } from '$lib/server/db/schema';
import { max } from 'drizzle-orm';
import { getSiteRepoStars } from '$lib/server/github/repo-stats';
import { formatSyncFreshness, isSyncOverdue } from '$lib/utils/formatSyncFreshness';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	const [result, githubStars] = await Promise.all([
		db.select({ lastSyncAt: max(syncMetadata.lastSyncAt) }).from(syncMetadata),
		getSiteRepoStars()
	]);

	const date = result[0]?.lastSyncAt ? new Date(result[0].lastSyncAt) : null;
	// lastSyncedAt is the header's at-a-glance freshness label; lastSyncedAtExact
	// is the precise UTC timestamp, surfaced as a hover tooltip for anyone who
	// wants it (see header.svelte).
	const lastSyncedAt = date ? formatSyncFreshness(date) : null;
	const syncOverdue = date ? isSyncOverdue(date) : false;
	const lastSyncedAtExact = date
		? (() => {
				const dd = String(date.getUTCDate()).padStart(2, '0');
				const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
				const yy = String(date.getUTCFullYear()).slice(-2);
				const hh = String(date.getUTCHours()).padStart(2, '0');
				const min = String(date.getUTCMinutes()).padStart(2, '0');
				return `${dd}.${mm}.${yy} ${hh}:${min} UTC`;
			})()
		: null;

	const user = session?.user
		? { username: session.user.username, avatarUrl: session.user.avatarUrl, htmlUrl: session.user.htmlUrl }
		: null;

	return { lastSyncedAt, lastSyncedAtExact, syncOverdue, user, githubStars };
};
