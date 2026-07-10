// Hour/minute-granular freshness label for the registry's sync status.
// formatRelativeDate / formatDate are day-granular (right for "package last
// updated"), but the sync job runs hourly — "today" would hide exactly the
// freshness signal this label exists to show.
export function formatSyncFreshness(date: Date): string {
	const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
	if (minutes < 1) return 'Updated just now';
	if (minutes < 60) return `Updated ${minutes}m ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `Updated ${hours}h ago`;

	const days = Math.floor(hours / 24);
	return `Updated ${days}d ago`;
}

// The sync job runs hourly (see jobs/sync's next_sync_at cadence). 90 minutes
// gives one run's worth of buffer before treating the gap as a stall worth
// flagging, rather than routine jitter.
const SYNC_OVERDUE_MS = 90 * 60_000;

export function isSyncOverdue(date: Date): boolean {
	return Date.now() - date.getTime() > SYNC_OVERDUE_MS;
}
