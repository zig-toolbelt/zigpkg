import { marked } from 'marked';
import { env } from '$env/dynamic/private';
import { parseZonFile } from '$lib/server/packages/zon-parser';
import { updatePackageContent } from '$lib/server/packages/queries';
import type { GitHubClient } from '$lib/server/github/client';
import type { InferSelectModel } from 'drizzle-orm';
import type { packageContent } from '$lib/server/db/schema';

type PackageContentRow = InferSelectModel<typeof packageContent>;

// Shape returned by getPackageByFullName — packages row + owner fields + content
type PackageWithContent = {
	id: number;
	name: string;
	owner: string;
	content: PackageContentRow | null;
	[key: string]: unknown;
};

export type PackageContent = {
	readmeHtml: string | null;
	tagList: { name: string; sha: string }[];
	fileList: { name: string; path: string; type: string; size: number; htmlUrl: string | null }[];
	zonRaw: string | null;
	zonInfo: ReturnType<typeof parseZonFile> | null;
};

function getContentTtlMs(): number {
	return parseInt(env.CONTENT_TTL_HOURS ?? '24') * 60 * 60 * 1000;
}

function rewriteRelativeUrls(html: string, owner: string, repo: string): string {
	html = html.replace(
		/href="(?!https?:\/\/|#|mailto:)([^"]+)"/g,
		`href="https://github.com/${owner}/${repo}/blob/main/$1"`
	);
	html = html.replace(
		/src="(?!https?:\/\/)([^"]+)"/g,
		`src="https://raw.githubusercontent.com/${owner}/${repo}/main/$1"`
	);
	return html;
}

async function fetchFromGitHub(pkg: PackageWithContent, githubClient: GitHubClient): Promise<PackageContent> {
	const [readme, tags, contents, zonContent] = await Promise.allSettled([
		githubClient.getReadme(pkg.owner, pkg.name),
		githubClient.getTags(pkg.owner, pkg.name),
		githubClient.getContents(pkg.owner, pkg.name),
		githubClient.getFileContent(pkg.owner, pkg.name, 'build.zig.zon')
	]);

	const readmeRaw = readme.status === 'fulfilled' ? readme.value : null;
	let readmeHtml = readmeRaw ? String(await marked(readmeRaw, { gfm: true })) : null;
	if (readmeHtml) {
		readmeHtml = rewriteRelativeUrls(readmeHtml, pkg.owner, pkg.name);
	}

	const tagList =
		tags.status === 'fulfilled' && tags.value
			? tags.value.map((t) => ({ name: t.name, sha: t.commit.sha }))
			: [];

	const fileList =
		contents.status === 'fulfilled' && contents.value
			? contents.value
					.map((c) => ({
						name: c.name,
						path: c.path,
						type: c.type,
						size: c.size,
						htmlUrl: c.html_url
					}))
					.sort((a, b) => {
						if (a.type === 'dir' && b.type !== 'dir') return -1;
						if (a.type !== 'dir' && b.type === 'dir') return 1;
						return a.name.localeCompare(b.name);
					})
			: [];

	const zonRaw = zonContent.status === 'fulfilled' ? zonContent.value : null;
	const zonInfo = zonRaw ? parseZonFile(zonRaw) : null;

	return { readmeHtml, tagList, fileList, zonRaw, zonInfo };
}

function fromCache(content: PackageContentRow): PackageContent {
	const tagList = content.tags ?? [];
	const fileList = content.files ?? [];
	const zonRaw = content.zonContent;
	const zonInfo = zonRaw ? parseZonFile(zonRaw) : null;
	return { readmeHtml: content.readme, tagList, fileList, zonRaw, zonInfo };
}

function saveToDb(packageId: number, content: PackageContent): void {
	updatePackageContent(packageId, {
		readme: content.readmeHtml,
		tags: content.tagList,
		files: content.fileList,
		zonContent: content.zonRaw,
		lastSync: new Date()
	}).catch(console.error);
}

export async function getPackageContent(
	pkg: PackageWithContent,
	githubClient: GitHubClient
): Promise<PackageContent> {
	const content = pkg.content;
	const isStale =
		!content?.lastSync || Date.now() - content.lastSync.getTime() > getContentTtlMs();

	// Fresh cache — serve immediately
	if (content?.readme && !isStale) {
		return fromCache(content);
	}

	// Stale cache — serve old data, refresh in background
	if (content?.readme && isStale) {
		fetchFromGitHub(pkg, githubClient)
			.then((fresh) => saveToDb(pkg.id, fresh))
			.catch(console.error);
		return fromCache(content);
	}

	// No cache — fetch, store, return
	const fresh = await fetchFromGitHub(pkg, githubClient);
	saveToDb(pkg.id, fresh);
	return fresh;
}
