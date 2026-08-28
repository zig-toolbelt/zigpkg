import { sql } from 'drizzle-orm';
import {
	pgTable,
	serial,
	bigint,
	integer,
	boolean,
	text,
	timestamp,
	varchar,
	jsonb,
	index,
	check,
	unique,
	primaryKey,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';

// Users table - package owners + registered users, scoped by source.
// Identity is (source, source_id): the same numeric id can recur across
// hosts (GitHub and Codeberg both start at low ids), so uniqueness is
// per-source rather than global.
//
// id is text (uuid), not serial: @auth/drizzle-adapter's AdapterUser contract
// requires a string id, since Auth.js core generates it before the row exists.
// name/email/emailVerified/image are unused (GitHub-only, no email flow) but
// required by the same adapter contract.
export const users = pgTable(
	'users',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		source: varchar('source', { length: 20 }).notNull().default('github'),
		sourceId: bigint('source_id', { mode: 'number' }).notNull(),
		username: varchar('username', { length: 255 }).notNull(),
		avatarUrl: text('avatar_url'),
		bio: text('bio'),
		htmlUrl: text('html_url'),
		name: text('name'),
		email: text('email').unique(),
		emailVerified: timestamp('email_verified', { withTimezone: true }),
		image: text('image'),
		// Moderation: set by an admin via /admin/users. bannedAt is null for an
		// active account; setting it invalidates the user's session on the next
		// request (see src/auth.ts session callback). bannedBy records which
		// admin issued the ban for audit.
		bannedAt: timestamp('banned_at', { withTimezone: true }),
		bannedBy: text('banned_by').references((): AnyPgColumn => users.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('users_source_source_id_unique').on(table.source, table.sourceId),
		unique('users_source_username_unique').on(table.source, table.username)
	]
);

// Accounts table - Auth.js provider linkage. Only GitHub is configured today,
// but this is what lets Auth.js look up a user by (provider, providerAccountId)
// without us hand-rolling that lookup against the users table.
//
// Token field names are snake_case, not camelCase: they mirror AdapterAccount's
// contract (@auth/core/adapters), which the DrizzleAdapter reads/writes by these
// exact JS property names.
export const accounts = pgTable(
	'accounts',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: varchar('type', { length: 255 }).notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: varchar('token_type', { length: 255 }),
		scope: varchar('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: varchar('session_state', { length: 255 })
	},
	(table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

// Sessions table - Auth.js database session strategy. Session rows are real,
// revocable server state (sign-out deletes the row), unlike a stateless JWT.
export const sessions = pgTable('sessions', {
	sessionToken: text('session_token').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { withTimezone: true }).notNull()
});

// Packages table - cache for repositories from each source.
export const packages = pgTable(
	'packages',
	{
		id: serial('id').primaryKey(),
		source: varchar('source', { length: 20 }).notNull().default('github'),
		sourceId: bigint('source_id', { mode: 'number' }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		fullName: varchar('full_name', { length: 512 }).notNull(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => users.id),
		description: text('description'),
		version: varchar('version', { length: 50 }).default('latest'),
		stars: integer('stars').default(0).notNull(),
		forks: integer('forks').default(0).notNull(),
		openIssues: integer('open_issues').default(0).notNull(),
		license: varchar('license', { length: 100 }),
		homepage: text('homepage'),
		repositoryUrl: text('repository_url').notNull(),
		topics: jsonb('topics').$type<string[]>(),
		packageType: varchar('package_type', { length: 20 }).notNull(), // 'library' or 'application'
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
		pushedAt: timestamp('pushed_at', { withTimezone: true }).notNull(),
		cachedAt: timestamp('cached_at', { withTimezone: true }).defaultNow().notNull(),
		// Moderation: 'approved' (visible), 'pending' (awaiting review), 'rejected'.
		// Sync job writes 'approved'; manual submissions start 'pending'.
		status: varchar('status', { length: 20 }).notNull().default('approved'),
		// Origin: 'sync' (auto-discovered by jobs/sync) or 'manual' (user-submitted).
		origin: varchar('origin', { length: 20 }).notNull().default('sync'),
		submittedBy: text('submitted_by').references(() => users.id),
		submittedAt: timestamp('submitted_at', { withTimezone: true }),
		reviewedBy: text('reviewed_by').references(() => users.id),
		reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
		rejectionReason: text('rejection_reason'),
		// Cached validation signals computed at submission time; nullable for
		// sync-origin rows that have not been validated yet.
		primaryLanguage: varchar('primary_language', { length: 50 }),
		hasZigFiles: boolean('has_zig_files'),
		hasBuildZigZon: boolean('has_build_zig_zon')
	},
	(table) => [
		unique('packages_source_source_id_unique').on(table.source, table.sourceId),
		index('packages_stars_idx').on(table.stars),
		index('packages_updated_idx').on(table.updatedAt),
		index('packages_cached_idx').on(table.cachedAt),
		index('packages_type_idx').on(table.packageType),
		index('packages_owner_idx').on(table.ownerId),
		index('packages_status_idx').on(table.status),
		index('packages_origin_idx').on(table.origin),
		check('packages_package_type_check', sql`${table.packageType} IN ('library', 'application')`),
		check('packages_status_check', sql`${table.status} IN ('approved', 'pending', 'rejected')`),
		check('packages_origin_check', sql`${table.origin} IN ('sync', 'manual')`)
	]
);

// Package content table - heavy content stored separately (1:1 with packages)
export const packageContent = pgTable('package_content', {
	id: serial('id').primaryKey(),
	packageId: integer('package_id')
		.notNull()
		.unique()
		.references(() => packages.id, { onDelete: 'cascade' }),
	readme: text('readme'),
	tags: jsonb('tags').$type<{ name: string; sha: string }[]>(),
	files: jsonb('files').$type<
		{ name: string; path: string; type: string; size: number; htmlUrl: string | null }[]
	>(),
	zonContent: text('zon_content'),
	lastSync: timestamp('last_sync', { withTimezone: true })
});

// Sync metadata table - track last sync time per (source, topic)
export const syncMetadata = pgTable(
	'sync_metadata',
	{
		id: serial('id').primaryKey(),
		source: varchar('source', { length: 20 }).notNull().default('github'),
		topic: varchar('topic', { length: 100 }).notNull(),
		lastSyncAt: timestamp('last_sync_at', { withTimezone: true }).notNull(),
		totalCount: integer('total_count').default(0),
		nextSyncAt: timestamp('next_sync_at', { withTimezone: true }).notNull(),
		// Resume point of an in-progress sync pass, written by the jobs/sync job.
		// Null when the last pass completed.
		syncCursor: text('sync_cursor')
	},
	(table) => [unique('sync_metadata_source_topic_unique').on(table.source, table.topic)]
);
