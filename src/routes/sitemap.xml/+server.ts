import { text } from '@sveltejs/kit';
import { SitemapStream, streamToPromise } from 'sitemap';
import type { RequestHandler } from './$types';
import { getAllPackageNames } from '$lib/server/packages/queries';
import { siteUrl } from '$lib/seo';

const STATIC_PATHS = ['/', '/packages', '/blog', '/docs', '/privacy', '/terms', '/cookie'];

export const GET: RequestHandler = async () => {
	try {
		const smStream = new SitemapStream({ hostname: siteUrl() });

		for (const url of STATIC_PATHS) {
			smStream.write({ url });
		}

		const pkgs = await getAllPackageNames();

		const seenOwners = new Set<string>();
		for (const pkg of pkgs) {
			if (pkg.ownerUsername && !seenOwners.has(pkg.ownerUsername)) {
				seenOwners.add(pkg.ownerUsername);
				smStream.write({ url: `/packages/${pkg.ownerUsername}` });
			}
		}

		for (const pkg of pkgs) {
			smStream.write({
				url: `/packages/${pkg.fullName}`,
				lastmod: new Date(pkg.updatedAt).toISOString()
			});
		}

		smStream.end();
		const res = await streamToPromise(smStream);

		return text(res.toString(), {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (e) {
		console.error(e);
		return text('Internal server error', { status: 500 });
	}
};
