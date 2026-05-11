import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPackageByFullName } from '$lib/server/packages/queries';
import { githubClient } from '$lib/server/github/client';
import { getPackageContent } from '$lib/server/packages/content';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const fullName = `${params.owner}/${params.repo}`;
	const pkg = await getPackageByFullName(fullName);

	if (!pkg) {
		error(404, { message: 'Package not found' });
	}

	const { readmeHtml, tagList, fileList, zonInfo } = await getPackageContent(pkg, githubClient);

	const topics = pkg.topics ?? [];

	setHeaders({
		'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200'
	});

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
			: null
	};
};
