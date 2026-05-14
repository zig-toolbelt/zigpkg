import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import {
	getPackageByFullName,
	getPackageByFullNameCaseInsensitive
} from '$lib/server/packages/queries';
import { githubClient } from '$lib/server/github/client';
import { getPackageContent } from '$lib/server/packages/content';

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
		const content = await getPackageContent(pkg, githubClient);
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

	setHeaders(
		contentDegraded
			? { 'Cache-Control': 'no-store' }
			: { 'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200' }
	);

	return {
		package: {
			name: pkg.name,
			fullName: pkg.fullName,
			owner: pkg.owner,
			ownerAvatarUrl: pkg.ownerAvatarUrl,
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
		contentDegraded
	};
};
