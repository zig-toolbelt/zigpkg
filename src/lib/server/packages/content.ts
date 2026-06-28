import DOMPurify from 'isomorphic-dompurify';
import { env } from '$env/dynamic/private';
import { parseZonFile } from '$lib/server/packages/zon-parser';
import { updatePackageContent } from '$lib/server/packages/queries';
import type { ContentClient } from '$lib/server/content-client';
import { rawUrl, blobUrl } from '$lib/providers';
import { renderReadme } from '$lib/server/packages/readme-renderer';
import type { getPackageByFullName } from './queries';

type PackageWithContent = NonNullable<Awaited<ReturnType<typeof getPackageByFullName>>>;
type PackageContentRow = NonNullable<PackageWithContent['content']>;

export type PackageContent = {
	readmeHtml: string | null;
	tagList: { name: string; sha: string }[];
	fileList: { name: string; path: string; type: string; size: number; htmlUrl: string | null }[];
	zonRaw: string | null;
	zonInfo: ReturnType<typeof parseZonFile> | null;
};

const CONTENT_TTL_MS = parseInt(env.CONTENT_TTL_HOURS ?? '24') * 60 * 60 * 1000;

function rewriteRelativeUrls(
	html: string,
	source: string,
	owner: string,
	repo: string,
	branch = 'main'
): string {
	html = html.replace(
		/href="(?!https?:\/\/|#|mailto:)([^"]+)"/g,
		(_m, path) => `href="${blobUrl(source, owner, repo, branch, path)}"`
	);
	html = html.replace(
		/src="(?!https?:\/\/)([^"]+)"/g,
		(_m, path) => `src="${rawUrl(source, owner, repo, branch, path)}"`
	);
	// Rewrite absolute github.com blob URLs in src to raw.githubusercontent.com
	// (GitHub-only: Codeberg READMEs don't embed github.com blob links).
	if (source !== 'codeberg') {
		html = html.replace(
			/src="https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^"]+)"/g,
			'src="https://raw.githubusercontent.com/$1/$2"'
		);
	}
	return html;
}

async function fetchContent(pkg: PackageWithContent, client: ContentClient): Promise<PackageContent> {
	const [readme, tags, contents, zonContent] = await Promise.allSettled([
		client.getReadme(pkg.owner, pkg.name),
		client.getTags(pkg.owner, pkg.name),
		client.getContents(pkg.owner, pkg.name),
		client.getFileContent(pkg.owner, pkg.name, 'build.zig.zon')
	]);

	const SAFE_REPO_NAME = /^[a-zA-Z0-9._-]+$/;
	const readmeSource = readme.status === 'fulfilled' ? readme.value : null;
	let readmeHtml = readmeSource ? await renderReadme(readmeSource.filename, readmeSource.content) : null;
	if (readmeHtml) {
		readmeHtml = DOMPurify.sanitize(readmeHtml, { ADD_ATTR: ['align', 'media', 'target', 'id'] });
		if (SAFE_REPO_NAME.test(pkg.owner) && SAFE_REPO_NAME.test(pkg.name)) {
			readmeHtml = rewriteRelativeUrls(readmeHtml, pkg.source, pkg.owner, pkg.name);
		}
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
	client: ContentClient
): Promise<PackageContent> {
	const content = pkg.content;
	const isStale =
		!content?.lastSync || Date.now() - content.lastSync.getTime() > CONTENT_TTL_MS;

	// Fresh cache — serve immediately
	if (content?.readme && !isStale) {
		return fromCache(content);
	}

	// Stale cache — serve old data, refresh in background
	if (content?.readme && isStale) {
		fetchContent(pkg, client)
			.then((fresh) => saveToDb(pkg.id, fresh))
			.catch(console.error);
		return fromCache(content);
	}

	// No cache — fetch, store, return
	const fresh = await fetchContent(pkg, client);
	saveToDb(pkg.id, fresh);
	return fresh;
}
