import type { GitHubTag, GitHubContent } from '$lib/types/github';
import { env } from '$env/dynamic/private';
import type { ContentClient } from '$lib/server/content-client';

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
export class CodebergClient implements ContentClient {
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

	async getReadme(owner: string, repo: string): Promise<string | null> {
		// Forgejo has no /readme endpoint: locate the README in the root listing,
		// then fetch it raw.
		const contents = await this.getContents(owner, repo);
		if (!contents) return null;

		const readme = contents.find((c) => c.type === 'file' && /^readme(\.|$)/i.test(c.name));
		if (!readme) return null;

		return this.getFileContent(owner, repo, readme.path);
	}
}

export const codebergClient = new CodebergClient();
