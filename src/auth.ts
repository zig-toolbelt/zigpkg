import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import type { GitHubProfile } from '@auth/core/providers/github';
import type { Adapter, AdapterUser } from '@auth/core/adapters';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { and, eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users, accounts, sessions } from '$lib/server/db/schema';

declare module '@auth/core/types' {
	interface User {
		source?: string;
		sourceId?: number;
		username?: string;
		avatarUrl?: string | null;
		htmlUrl?: string | null;
		bio?: string | null;
	}
}

const baseAdapter = DrizzleAdapter(db, {
	usersTable: users,
	accountsTable: accounts,
	sessionsTable: sessions
}) as Adapter;

// The Go sync job caches package owners in `users`, keyed by (source, source_id),
// before they ever sign in. The stock adapter only recognises a returning user via
// the `accounts` link table, so a maintainer's *first* sign-in would otherwise try
// to INSERT a second row and collide with their own already-cached one on the
// (source, source_id) unique constraint. Falling back to that lookup here makes
// sign-in adopt the existing row instead.
const adapter: Adapter = {
	...baseAdapter,
	async getUserByAccount(providerAccount) {
		const viaAccount = await baseAdapter.getUserByAccount?.(providerAccount);
		if (viaAccount) return viaAccount;
		if (providerAccount.provider !== 'github') return null;

		const sourceId = Number(providerAccount.providerAccountId);
		if (isNaN(sourceId)) return null;
		const [existing] = await db
			.select()
			.from(users)
			.where(and(eq(users.source, 'github'), eq(users.sourceId, sourceId)));
		if (!existing) return null;

		return { ...existing, email: existing.email ?? '' } satisfies AdapterUser;
	}
};

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter,
	session: { strategy: 'database' },
	trustHost: env.AUTH_TRUST_HOST === 'true',
	secret: env.AUTH_SECRET,
	providers: [
		GitHub({
			clientId: env.AUTH_GITHUB_ID,
			clientSecret: env.AUTH_GITHUB_SECRET,
			profile(profile: GitHubProfile) {
				return {
					id: profile.id.toString(),
					source: 'github',
					sourceId: profile.id,
					username: profile.login,
					avatarUrl: profile.avatar_url,
					htmlUrl: profile.html_url,
					bio: profile.bio,
					name: profile.name ?? profile.login,
					email: profile.email,
					image: profile.avatar_url
				};
			}
		})
	],
	callbacks: {
		// Database strategy passes the full `users` row as `user` — no extra
		// query needed to surface our own columns alongside Auth.js's defaults.
		session({ session, user }) {
			session.user.username = user.username;
			session.user.avatarUrl = user.avatarUrl;
			session.user.htmlUrl = user.htmlUrl;
			return session;
		}
	}
});
