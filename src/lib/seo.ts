import { PUBLIC_SITE_URL } from '$env/static/public';

const SITE_URL = (PUBLIC_SITE_URL || 'https://zigpkg.dev').replace(/\/$/, '');

const DEFAULT_TITLE = 'Zig Package Registry — Find & Share Zig Libraries';
const DEFAULT_DESCRIPTION =
	'zigpkg — discover Zig libraries, applications, and tools. Browse packages, view READMEs, and find the right code for your project.';

export type SeoMeta = {
	title: string;
	description: string;
	image?: string;
	imageAlt?: string;
	url?: string;
	type?: string;
};

export function siteUrl(): string {
	return SITE_URL;
}

export function buildCanonical(pathname: string): string {
	let path = pathname || '/';
	if (!path.startsWith('/')) path = '/' + path;
	if (path.length > 1) path = path.replace(/\/+$/, '');
	return SITE_URL + path;
}

export function resolveSeo(overrides: Partial<SeoMeta> | undefined, pathname: string): Required<SeoMeta> {
	return {
		title: overrides?.title ?? DEFAULT_TITLE,
		description: overrides?.description ?? DEFAULT_DESCRIPTION,
		image: overrides?.image ?? `${SITE_URL}/og-default.png`,
		imageAlt: overrides?.imageAlt ?? overrides?.title ?? DEFAULT_TITLE,
		url: overrides?.url ?? buildCanonical(pathname),
		type: overrides?.type ?? 'website'
	};
}
