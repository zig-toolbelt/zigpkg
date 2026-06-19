import { sql } from 'drizzle-orm';
import {
	pgTable,
	serial,
	bigint,
	integer,
	text,
	timestamp,
	varchar,
	jsonb,
	index,
	check,
	unique
} from 'drizzle-orm/pg-core';

// Users table - package owners + registered users, scoped by source.
// Identity is (source, source_id): the same numeric id can recur across
// hosts (GitHub and Codeberg both start at low ids), so uniqueness is
// per-source rather than global.
export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		source: varchar('source', { length: 20 }).notNull().default('github'),
		sourceId: bigint('source_id', { mode: 'number' }).notNull(),
		username: varchar('username', { length: 255 }).notNull(),
		avatarUrl: text('avatar_url'),
		bio: text('bio'),
		htmlUrl: text('html_url'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('users_source_source_id_unique').on(table.source, table.sourceId),
		unique('users_source_username_unique').on(table.source, table.username)
	]
);

// Packages table - cache for repositories from each source.
export const packages = pgTable(
	'packages',
	{
		id: serial('id').primaryKey(),
		source: varchar('source', { length: 20 }).notNull().default('github'),
		sourceId: bigint('source_id', { mode: 'number' }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		fullName: varchar('full_name', { length: 512 }).notNull(),
		ownerId: integer('owner_id')
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
		cachedAt: timestamp('cached_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('packages_source_source_id_unique').on(table.source, table.sourceId),
		index('packages_stars_idx').on(table.stars),
		index('packages_updated_idx').on(table.updatedAt),
		index('packages_cached_idx').on(table.cachedAt),
		index('packages_type_idx').on(table.packageType),
		index('packages_owner_idx').on(table.ownerId),
		check('packages_package_type_check', sql`${table.packageType} IN ('library', 'application')`)
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
