import { describe, it, expect } from 'vitest';
import {
	isSemver,
	highestSemverTag,
	resolveDisplayVersion,
	resolveInstallRef,
	hasVersion,
	NO_VERSION
} from '$lib/utils/version';

describe('isSemver', () => {
	it('accepts semver strings with or without a leading v', () => {
		expect(isSemver('v1.2.3')).toBe(true);
		expect(isSemver('1.2.3')).toBe(true);
		expect(isSemver('v1.2.3-rc.1')).toBe(true);
		expect(isSemver('v1.2.3+build.5')).toBe(true);
	});

	it('rejects non-version tag markers', () => {
		expect(isSemver('bindings-cleanup')).toBe(false);
		expect(isSemver('latest')).toBe(false);
		expect(isSemver('')).toBe(false);
	});
});

describe('highestSemverTag', () => {
	it('picks the greatest semver tag regardless of list order', () => {
		expect(
			highestSemverTag([{ name: 'v1.2.2' }, { name: 'v1.2.3' }, { name: 'v1.0.0' }])
		).toBe('v1.2.3');
	});

	it('returns null when a repo only has a non-version marker tag (sokol-zig case)', () => {
		expect(highestSemverTag([{ name: 'bindings-cleanup' }])).toBeNull();
	});

	it('ignores non-semver tags mixed with real versions', () => {
		expect(
			highestSemverTag([{ name: 'bindings-cleanup' }, { name: 'v0.5.0' }, { name: 'wip' }])
		).toBe('v0.5.0');
	});

	it('returns null for an empty tag list', () => {
		expect(highestSemverTag([])).toBeNull();
	});

	it('compares prerelease identifiers numerically, not lexically', () => {
		// A plain string comparison would rank "rc.9" above "rc.10" (the
		// character '9' sorts after '1'). The `semver` package compares
		// dot-separated numeric identifiers numerically instead, per spec.
		expect(
			highestSemverTag([{ name: 'v1.0.0-rc.9' }, { name: 'v1.0.0-rc.10' }])
		).toBe('v1.0.0-rc.10');
	});
});

describe('resolveDisplayVersion', () => {
	it('prefers the manifest version when it is semver-shaped', () => {
		expect(
			resolveDisplayVersion({
				zonVersion: '2.1.0',
				tags: [{ name: 'v1.0.0' }],
				fallbackVersion: NO_VERSION
			})
		).toBe('2.1.0');
	});

	it('falls back to the highest semver tag when the manifest has no version', () => {
		expect(
			resolveDisplayVersion({
				zonVersion: null,
				tags: [{ name: 'v1.0.0' }, { name: 'v1.2.0' }],
				fallbackVersion: NO_VERSION
			})
		).toBe('v1.2.0');
	});

	it('falls back to the cached DB version when it is semver-shaped', () => {
		expect(
			resolveDisplayVersion({ zonVersion: null, tags: [], fallbackVersion: 'v0.3.0' })
		).toBe('v0.3.0');
	});

	it('returns null when no source yields a real version (sokol-zig case)', () => {
		expect(
			resolveDisplayVersion({
				zonVersion: null,
				tags: [{ name: 'bindings-cleanup' }],
				fallbackVersion: 'bindings-cleanup'
			})
		).toBeNull();
	});
});

describe('resolveInstallRef', () => {
	it('prefers the highest live semver tag', () => {
		expect(
			resolveInstallRef({ tags: [{ name: 'v1.0.0' }, { name: 'v1.2.0' }], fallbackVersion: NO_VERSION })
		).toBe('v1.2.0');
	});

	it('falls back to the cached DB version when it is semver-shaped', () => {
		expect(resolveInstallRef({ tags: [], fallbackVersion: 'v0.3.0' })).toBe('v0.3.0');
	});

	it('never uses a stale non-version DB value as a git ref (pre-resync sokol-zig case)', () => {
		// Live tags haven't been re-synced yet and the DB still holds the old
		// marker tag — resolveInstallRef must not hand that back as a ref for
		// `zig fetch --save git+URL#ref`, even though it happens to be a real
		// tag that would technically resolve.
		expect(
			resolveInstallRef({ tags: [], fallbackVersion: 'bindings-cleanup' })
		).toBe(NO_VERSION);
	});

	it('returns NO_VERSION when nothing resolves', () => {
		expect(resolveInstallRef({ tags: [], fallbackVersion: null })).toBe(NO_VERSION);
	});
});

describe('hasVersion', () => {
	it('is true for real version strings', () => {
		expect(hasVersion('v1.2.3')).toBe(true);
	});

	it('is false for the NO_VERSION sentinel, null, and undefined', () => {
		expect(hasVersion(NO_VERSION)).toBe(false);
		expect(hasVersion(null)).toBe(false);
		expect(hasVersion(undefined)).toBe(false);
	});
});
