import { githubClient } from './client';

// The site's own repo (linked from the header), not a registry package —
// fetched and cached in-memory since it's one shared value for every visitor
// and star counts change slowly. Avoids spending GitHub API budget (shared
// with the sync job/content fetches) on every page load.
const REPO_OWNER = 'zig-toolbelt';
const REPO_NAME = 'zigpkg';
const CACHE_TTL_MS = 60 * 60 * 1000;

let cache: { stars: number; fetchedAt: number } | null = null;

export async function getSiteRepoStars(): Promise<number | null> {
	if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
		return cache.stars;
	}

	const stars = await githubClient.getStarCount(REPO_OWNER, REPO_NAME);
	if (stars === null) return cache?.stars ?? null;

	cache = { stars, fetchedAt: Date.now() };
	return stars;
}
