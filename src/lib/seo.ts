import { PUBLIC_SITE_URL } from '$env/static/public';

const SITE_URL = (PUBLIC_SITE_URL || 'https://zigpkg.dev').replace(/\/$/, '');

export function siteUrl(): string {
	return SITE_URL;
}

export function buildCanonical(pathname: string): string {
	let path = pathname || '/';
	if (!path.startsWith('/')) path = '/' + path;
	if (path.length > 1) path = path.replace(/\/+$/, '');
	return SITE_URL + path;
}
