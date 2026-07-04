// Provider helpers: map a package's `source` ("github" | "codeberg" | …) onto
// the host-specific URLs the UI and content rewriter need. GitHub and Codeberg
// (Forgejo) lay out raw/blob/archive paths differently, so every place that
// used to hardcode github.com routes through here instead.
//
// The default branch is assumed to be `main` where a branch is required and one
// is not stored (see the package schema note). Pass an explicit branch when one
// is known.

import { hasVersion } from '$lib/utils/version';

export type PackageSource = 'github' | 'codeberg';

const HOSTS: Record<PackageSource, string> = {
	github: 'github.com',
	codeberg: 'codeberg.org'
};

function isCodeberg(source: string): boolean {
	return source === 'codeberg';
}

/** Web host for a source, defaulting to GitHub for unknown values. */
export function providerHost(source: string): string {
	return HOSTS[source as PackageSource] ?? HOSTS.github;
}

/** Canonical web page for an owner/organisation on the given source. */
export function ownerUrl(source: string, owner: string): string {
	return `https://${providerHost(source)}/${owner}`;
}

/**
 * Tarball URL for `zig fetch`. Built from the stored repository URL so it works
 * regardless of host, with the source deciding the archive path shape:
 *   GitHub:   {repo}/archive/HEAD.tar.gz            (latest)
 *             {repo}/archive/refs/tags/{ver}.tar.gz (tagged)
 *   Codeberg: {repo}/archive/{branch}.tar.gz        (latest)
 *             {repo}/archive/{ver}.tar.gz           (tagged)
 */
export function archiveFetchUrl(
	source: string,
	repositoryUrl: string,
	version: string,
	branch = 'main'
): string {
	const base = repositoryUrl.replace(/\/+$/, '');
	if (isCodeberg(source)) {
		const ref = hasVersion(version) ? version : branch;
		return `${base}/archive/${ref}.tar.gz`;
	}
	const path = hasVersion(version) ? `archive/refs/tags/${version}.tar.gz` : 'archive/HEAD.tar.gz';
	return `${base}/${path}`;
}

/** Raw (unrendered) file URL — used to rewrite relative <img src> in READMEs. */
export function rawUrl(
	source: string,
	owner: string,
	repo: string,
	branch: string,
	path: string
): string {
	if (isCodeberg(source)) {
		return `https://codeberg.org/${owner}/${repo}/raw/branch/${branch}/${path}`;
	}
	return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

/** Rendered file/blob URL — used to rewrite relative <a href> in READMEs. */
export function blobUrl(
	source: string,
	owner: string,
	repo: string,
	branch: string,
	path: string
): string {
	if (isCodeberg(source)) {
		return `https://codeberg.org/${owner}/${repo}/src/branch/${branch}/${path}`;
	}
	return `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;
}
