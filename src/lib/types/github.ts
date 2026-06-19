// GitHub Search API response structure
export interface GitHubSearchResponse {
	total_count: number;
	incomplete_results: boolean;
	items: GitHubRepository[];
}

export interface GitHubRepository {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	owner: GitHubOwner;
	html_url: string;
	description: string | null;
	fork: boolean;
	url: string;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	homepage: string | null;
	stargazers_count: number;
	watchers_count: number;
	forks_count: number;
	open_issues_count: number;
	license: GitHubLicense | null;
	topics: string[];
	default_branch: string;
}

export interface GitHubOwner {
	login: string;
	id: number;
	avatar_url: string;
	html_url: string;
}

export interface GitHubLicense {
	key: string;
	name: string;
	spdx_id: string;
}

export interface GitHubTag {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
}

export interface GitHubContent {
	name: string;
	path: string;
	type: 'file' | 'dir' | 'symlink' | 'submodule';
	size: number;
	// Forgejo may omit the web URL for some entries; the cached file list and
	// DB column are both nullable, so model it as such here too.
	html_url: string | null;
}
