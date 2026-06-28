import type { GitHubTag, GitHubContent } from '$lib/types/github';
import { githubClient } from '$lib/server/github/client';
import { codebergClient } from '$lib/server/codeberg/client';

// ContentClient is the per-source contract the content pipeline drives to fetch
// a package's README, tags, and file listing live. Both GitHubClient and
// CodebergClient implement it and return identical shapes, so getPackageContent
// never has to know which host a package lives on.
//
// getReadme returns a ReadmeSource (filename + raw content) rather than a bare
// string so the renderer can pick the correct parser (markdown / asciidoc / rst
// / plaintext) from the README's extension.
export interface ReadmeSource {
	filename: string;
	content: string;
}

export interface ContentClient {
	getReadme(owner: string, repo: string): Promise<ReadmeSource | null>;
	getTags(owner: string, repo: string): Promise<GitHubTag[] | null>;
	getContents(owner: string, repo: string, path?: string): Promise<GitHubContent[] | null>;
	getFileContent(owner: string, repo: string, path: string): Promise<string | null>;
}

/** Returns the content client for a package's source, defaulting to GitHub. */
export function getContentClient(source: string): ContentClient {
	return source === 'codeberg' ? codebergClient : githubClient;
}
