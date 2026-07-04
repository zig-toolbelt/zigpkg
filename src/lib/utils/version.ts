import semver from 'semver';

// Sentinel meaning "no resolvable version" — the wire-format value for a
// package with no semver-shaped tag, and the signal to `zig fetch` callers
// that there's no ref to pin to (fetch HEAD instead).
export const NO_VERSION = 'latest';

// True when v is a real version string, not the NO_VERSION sentinel (or
// null/undefined).
export function hasVersion(v: string | null | undefined): v is string {
	return !!v && v !== NO_VERSION;
}

// Registries that show the most recent git tag verbatim end up displaying
// non-version markers (e.g. a manually created "bindings-cleanup" tag) as if
// they were a release. Only tags shaped like a semantic version are ever
// treated as a version.
export function isSemver(value: string): boolean {
	return semver.valid(value) !== null;
}

// Returns the tag name (as-authored, e.g. "v1.2.3") with the highest semver
// value, or null when no tag is semver-shaped.
export function highestSemverTag(tags: { name: string }[]): string | null {
	let best: string | null = null;
	for (const { name } of tags) {
		if (!isSemver(name)) continue;
		if (!best || semver.gt(name, best)) best = name;
	}
	return best;
}

// Display-only version resolution: the manifest's declared version takes
// priority (it reflects HEAD even when the repo isn't tagged at all), then the
// highest semver git tag, then a DB-cached version if it happens to be
// semver-shaped. Returns null when no source yields a real version — callers
// should fall back to a relative "updated N days ago" label in that case.
export function resolveDisplayVersion(opts: {
	zonVersion: string | null;
	tags: { name: string }[];
	fallbackVersion: string | null;
}): string | null {
	if (opts.zonVersion && isSemver(opts.zonVersion)) return opts.zonVersion;

	const tagVersion = highestSemverTag(opts.tags);
	if (tagVersion) return tagVersion;

	if (opts.fallbackVersion && isSemver(opts.fallbackVersion)) return opts.fallbackVersion;

	return null;
}

// Resolves what `zig fetch --save git+URL#ref` should pin to. Unlike
// resolveDisplayVersion, this must only ever be a real, existing git ref (a
// tag) — never the manifest's declared version, which may not correspond to
// any tag at all. fallbackVersion (typically the DB-cached version) is only
// trusted when it's still semver-shaped, so a stale non-version tag (e.g.
// before the sync worker has re-run since this fix shipped) can never leak
// through as an install ref.
export function resolveInstallRef(opts: {
	tags: { name: string }[];
	fallbackVersion: string | null;
}): string {
	return (
		highestSemverTag(opts.tags) ??
		(opts.fallbackVersion && isSemver(opts.fallbackVersion) ? opts.fallbackVersion : null) ??
		NO_VERSION
	);
}
