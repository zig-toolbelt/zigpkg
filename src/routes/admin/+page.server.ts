import type { PageServerLoad } from './$types';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { getUserStats } from '$lib/server/users/queries';
import {
	adminGetPackageStats
} from '$lib/server/packages/admin-queries';
import { getPendingPackageCount, getFlaggedPackages } from '$lib/server/packages/queries';

// Authorization is enforced by src/routes/admin/+layout.server.ts; this load
// only assembles the dashboard data.
export const load: PageServerLoad = async () => {
	const [userStats, packageStats, pendingCount, flaggedPackages, activeSessionsResult] =
		await Promise.all([
			getUserStats(),
			adminGetPackageStats(),
			getPendingPackageCount(),
			getFlaggedPackages(50, 0),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(sessions)
				.where(sql`${sessions.expires} > now()`)
		]);

	return {
		userStats,
		packageStats,
		pendingCount,
		flaggedCount: flaggedPackages.length,
		activeSessions: activeSessionsResult[0]?.count ?? 0
	};
};
