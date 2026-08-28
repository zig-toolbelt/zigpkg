import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

// isAdmin reports whether the given user is listed in the ADMIN_USERNAMES env
// var (a comma-separated set of GitHub usernames). Admins get full /admin
// access (user management, package management, dashboard); moderators, by
// contrast, are still defined via MODERATOR_ORG/MODERATOR_TEAM in moderation.ts.
// The check is a single keyed lookup and is cheap enough to run per request,
// so unlike isModerator it is not cached.
export async function isAdmin(userId: string): Promise<boolean> {
	const [user] = await db
		.select({ username: users.username })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	if (!user) return false;

	const admins = (env.ADMIN_USERNAMES ?? '')
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	return admins.includes(user.username.toLowerCase());
}
