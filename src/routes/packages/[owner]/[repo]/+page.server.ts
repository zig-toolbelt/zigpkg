import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import {
	getPackageByFullName,
	getPackageByFullNameCaseInsensitive
} from '$lib/server/packages/queries';
import { getContentClient } from '$lib/server/content-client';
import { getPackageContent } from '$lib/server/packages/content';
import { ownerUrl } from '$lib/providers';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const fullName = `${params.owner}/${params.repo}`;
	let pkg = await getPackageByFullName(fullName);

	if (!pkg) {
		const alt = await getPackageByFullNameCaseInsensitive(fullName);
		if (alt) {
			redirect(301, `/packages/${alt.fullName}`);
		}
		error(404, { message: 'Package not found' });
	}

	let readmeHtml: string | null = null;
	let tagList: { name: string; sha: string }[] = [];
	let fileList: { name: string; path: string; type: string; size: number; htmlUrl: string | null }[] = [];
	let zonInfo: Awaited<ReturnType<typeof getPackageContent>>['zonInfo'] = null;
	let contentDegraded = false;

	try {
		const content = await getPackageContent(pkg, getContentClient(pkg.source));
		readmeHtml = content.readmeHtml;
		tagList = content.tagList;
		fileList = content.fileList;
		zonInfo = content.zonInfo;
	} catch (err) {
		contentDegraded = true;
		console.error('[packages/[owner]/[repo]] failed to load content', {
			fullName,
			message: err instanceof Error ? err.message : String(err)
		});
	}

	const topics = pkg.topics ?? [];

	const LICENSE_NAMES = new Set(['LICENSE', 'LICENSE.MD', 'LICENSE.TXT', 'LICENSE.RST', 'LICENCE', 'COPYING']);
	const licenseFile = fileList.find((f) => LICENSE_NAMES.has(f.name.toUpperCase()));
	const licenseFileUrl = licenseFile?.htmlUrl ?? null;

	setHeaders(
		contentDegraded
			? { 'Cache-Control': 'no-store' }
			: { 'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200' }
	);

	return {
		package: {
			name: pkg.name,
			fullName: pkg.fullName,
			source: pkg.source,
			owner: pkg.owner,
			ownerAvatarUrl: pkg.ownerAvatarUrl,
			ownerHtmlUrl: pkg.ownerHtmlUrl || ownerUrl(pkg.source, pkg.owner),
			description: pkg.description || '',
			version: pkg.version || 'latest',
			stars: pkg.stars,
			forks: pkg.forks,
			openIssues: pkg.openIssues,
			license: pkg.license,
			homepage: pkg.homepage,
			repositoryUrl: pkg.repositoryUrl,
			topics,
			packageType: pkg.packageType,
			createdAt: pkg.createdAt.toISOString(),
			pushedAt: pkg.pushedAt.toISOString()
		},
		issuesUrl: `${pkg.repositoryUrl.replace(/\/$/, '')}/issues`,
		readme: readmeHtml,
		tags: tagList,
		files: fileList,
		dependencies: zonInfo?.dependencies ?? [],
		zonInfo: zonInfo
			? {
					name: zonInfo.name,
					version: zonInfo.version,
					minimumZigVersion: zonInfo.minimum_zig_version
				}
			: null,
		contentDegraded,
		licenseFileUrl
	};
};
