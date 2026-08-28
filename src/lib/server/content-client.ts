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

// RepoMetadata is the source-neutral shape returned by getRepo: enough fields to
// upsert a packages row without caring whether the repo lives on GitHub or
// Codeberg. Nullable fields mirror the host's own nullability (a repo may have
// no description, no homepage, no license).
export interface RepoMetadata {
	sourceId: number;
	name: string;
	fullName: string;
	ownerLogin: string;
	ownerSourceId: number;
	ownerAvatarUrl: string | null;
	ownerHtmlUrl: string | null;
	description: string | null;
	url: string;
	homepage: string | null;
	stars: number;
	forks: number;
	openIssues: number;
	license: string | null;
	topics: string[];
	createdAt: string;
	updatedAt: string;
	pushedAt: string;
}

// RepoClient extends ContentClient with one-shot repo metadata and language
// stats, used by the manual-submission flow. Both GitHubClient and CodebergClient
// implement it.
export interface RepoClient extends ContentClient {
	getRepo(owner: string, repo: string): Promise<RepoMetadata | null>;
	getLanguages(owner: string, repo: string): Promise<Record<string, number> | null>;
}

/** Returns the content client for a package's source, defaulting to GitHub. */
export function getContentClient(source: string): ContentClient {
	return source === 'codeberg' ? codebergClient : githubClient;
}

/** Returns the repo client for a source, defaulting to GitHub. */
export function getRepoClient(source: string): RepoClient {
	return source === 'codeberg' ? codebergClient : githubClient;
}
