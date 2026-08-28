import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema';
import { githubClient } from '$lib/server/github/client';

// Authorization is enforced by src/routes/admin/+layout.server.ts.

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const userId = session?.user?.id;
	// Layout guard guarantees userId is present; this is defense-in-depth.
	if (!userId) {
		return { configured: false, moderators: [], org: null, team: null };
	}

	const org = env.MODERATOR_ORG;
	const team = env.MODERATOR_TEAM;
	if (!org || !team) {
		return { configured: false, moderators: [], org: null, team: null };
	}

	const [account] = await db
		.select({ accessToken: accounts.access_token })
		.from(accounts)
		.where(eq(accounts.userId, userId))
		.limit(1);

	if (!account?.accessToken) {
		return { configured: true, moderators: [], tokenMissing: true, org, team };
	}

	const members = await githubClient.listTeamMembers(org, team, account.accessToken);

	return {
		configured: true,
		moderators: members.map((m) => ({
			login: m.login,
			avatarUrl: m.avatar_url,
			htmlUrl: m.html_url
		})),
		org,
		team
	};
};
