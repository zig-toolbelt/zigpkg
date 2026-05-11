import type {
  GitHubTag,
  GitHubContent,
} from "$lib/types/github";
import { env } from "$env/dynamic/private";
import { RateLimitError } from "./errors";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubClient {
  private rateLimitRemaining = 30; // Conservative default
  private rateLimitReset = 0;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${env.GITHUB_TOKEN}`;
    }

    return headers;
  }

  private checkRateLimit(): void {
    if (this.rateLimitRemaining <= 1 && Date.now() < this.rateLimitReset * 1000) {
      throw new RateLimitError(new Date(this.rateLimitReset * 1000));
    }
  }

  private updateRateLimit(response: Response): void {
    this.rateLimitRemaining = parseInt(response.headers.get("X-RateLimit-Remaining") || "30");
    this.rateLimitReset = parseInt(response.headers.get("X-RateLimit-Reset") || "0");
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    this.checkRateLimit();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
    this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        ...this.getHeaders(),
        Accept: "application/vnd.github.raw+json",
      },
    });
    this.updateRateLimit(response);

    if (!response.ok) return null;

    return response.text();
  }

  async getTags(owner: string, repo: string): Promise<GitHubTag[] | null> {
    this.checkRateLimit();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/tags?per_page=100`;
    this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response);

    if (!response.ok) return null;

    return response.json();
  }

  async getContents(
    owner: string,
    repo: string,
    path: string = "",
  ): Promise<GitHubContent[] | null> {
    this.checkRateLimit();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response);

    if (!response.ok) return null;

    const data = await response.json();
    return Array.isArray(data) ? data : null;
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
  ): Promise<string | null> {
    this.checkRateLimit();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        ...this.getHeaders(),
        Accept: "application/vnd.github.raw+json",
      },
    });
    this.updateRateLimit(response);

    if (!response.ok) return null;

    return response.text();
  }

  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      resetAt: new Date(this.rateLimitReset * 1000),
    };
  }
}

export const githubClient = new GitHubClient();
