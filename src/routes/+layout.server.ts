import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { syncMetadata } from '$lib/server/db/schema';
import { max } from 'drizzle-orm';

export const load: LayoutServerLoad = async () => {
	const result = await db
		.select({ lastSyncAt: max(syncMetadata.lastSyncAt) })
		.from(syncMetadata);

	const date = result[0]?.lastSyncAt ? new Date(result[0].lastSyncAt) : null;
	const lastSyncedAt = date
		? (() => {
				const dd = String(date.getUTCDate()).padStart(2, '0');
				const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
				const yy = String(date.getUTCFullYear()).slice(-2);
				const hh = String(date.getUTCHours()).padStart(2, '0');
				const min = String(date.getUTCMinutes()).padStart(2, '0');
				return `${dd}.${mm}.${yy} ${hh}:${min} UTC`;
			})()
		: null;

	return { lastSyncedAt };
};
