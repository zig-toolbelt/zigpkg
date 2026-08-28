import type { GitHubTag, GitHubContent } from '$lib/types/github';
import { env } from '$env/dynamic/private';
import type { RepoClient, ReadmeSource, RepoMetadata } from '$lib/server/content-client';

const CODEBERG_API_BASE = 'https://codeberg.org/api/v1';
const REQUEST_TIMEOUT_MS = 8000;

// Forgejo content fields actually consumed below.
interface ForgejoContent {
	name: string;
	path: string;
	type: GitHubContent['type'];
	size: number;
	html_url: string | null;
}

interface ForgejoTag {
	name: string;
	id?: string;
	commit?: { sha?: string; url?: string };
}

// CodebergClient reads README / tags / file listings live from a Forgejo
// instance, returning the same shapes as GitHubClient so the rest of the
// content pipeline is source-agnostic (see ContentClient). Forgejo has no
// dedicated readme endpoint, so getReadme finds the README in the root listing
// and fetches it raw.
interface ForgejoRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; id: number; avatar_url: string; html_url: string };
  description: string | null;
  html_url: string;
  homepage: string | null;
  stars_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  external_tracker?: null;
  license?: string | null;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at?: string;
}

export class CodebergClient implements RepoClient {
	private headers(accept = 'application/json'): HeadersInit {
		const headers: Record<string, string> = { Accept: accept };
		// Token is optional: anonymous reads work but are limited harder.
		if (env.CODEBERG_TOKEN) {
			headers['Authorization'] = `token ${env.CODEBERG_TOKEN}`;
		}
		return headers;
	}

	async getContents(
		owner: string,
		repo: string,
		path: string = ''
	): Promise<GitHubContent[] | null> {
		const url = `${CODEBERG_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: this.headers()
		});

		if (!response.ok) return null;

		const data = await response.json();
		if (!Array.isArray(data)) return null;

		return (data as ForgejoContent[]).map((c) => ({
			name: c.name,
			path: c.path,
			type: c.type,
			size: c.size,
			html_url: c.html_url
		}));
	}

	async getTags(owner: string, repo: string): Promise<GitHubTag[] | null> {
		const url = `${CODEBERG_API_BASE}/repos/${owner}/${repo}/tags?limit=100`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: this.headers()
		});

		if (!response.ok) return null;

		const data = await response.json();
		if (!Array.isArray(data)) return null;

		return (data as ForgejoTag[]).map((t) => ({
			name: t.name,
			commit: { sha: t.commit?.sha ?? t.id ?? '', url: t.commit?.url ?? '' }
		}));
	}

	async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
		const url = `${CODEBERG_API_BASE}/repos/${owner}/${repo}/raw/${path}`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: this.headers('text/plain')
		});

		if (!response.ok) return null;

		return response.text();
	}

	async getReadme(owner: string, repo: string): Promise<ReadmeSource | null> {
		// Forgejo has no /readme endpoint: locate the README in the root listing,
		// then fetch it raw. Return the filename alongside the content so the
		// renderer can dispatch by extension.
		const contents = await this.getContents(owner, repo);
		if (!contents) return null;

		const readme = contents.find((c) => c.type === 'file' && /^readme(\.|$)/i.test(c.name));
		if (!readme) return null;

		const content = await this.getFileContent(owner, repo, readme.path);
		if (content === null) return null;

		return { filename: readme.name, content };
	}

	async getRepo(owner: string, repo: string): Promise<RepoMetadata | null> {
		const url = `${CODEBERG_API_BASE}/repos/${owner}/${repo}`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: this.headers()
		});

		if (!response.ok) return null;

		const data = (await response.json()) as ForgejoRepo;
		return {
			sourceId: data.id,
			name: data.name,
			fullName: data.full_name,
			ownerLogin: data.owner.login,
			ownerSourceId: data.owner.id,
			ownerAvatarUrl: data.owner.avatar_url,
			ownerHtmlUrl: data.owner.html_url,
			description: data.description,
			url: data.html_url,
			homepage: data.homepage,
			stars: data.stars_count ?? 0,
			forks: data.forks_count ?? 0,
			openIssues: data.open_issues_count ?? 0,
			license: data.license ?? null,
			topics: data.topics ?? [],
			createdAt: data.created_at,
			updatedAt: data.updated_at,
			pushedAt: data.pushed_at ?? data.updated_at
		};
	}

	async getLanguages(owner: string, repo: string): Promise<Record<string, number> | null> {
		const url = `${CODEBERG_API_BASE}/repos/${owner}/${repo}/languages`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: this.headers()
		});

		if (!response.ok) return null;

		return (await response.json()) as Record<string, number>;
	}
}

export const codebergClient = new CodebergClient();
