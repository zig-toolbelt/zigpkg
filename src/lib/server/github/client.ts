import type {
  GitHubTag,
  GitHubContent,
} from "$lib/types/github";
import { env } from "$env/dynamic/private";
import { RateLimitError } from "./errors";
import type { ReadmeSource } from "$lib/server/content-client";

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

  async getReadme(owner: string, repo: string): Promise<ReadmeSource | null> {
    this.checkRateLimit();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
    this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);
    // Hit the JSON endpoint (default Accept) so we get both the filename
    // (`name`) and the base64-encoded `content` in a single request. The
    // filename is needed downstream to dispatch the correct renderer
    // (markdown / asciidoc / rst / plaintext) by extension.
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: this.getHeaders(),
    });
    this.updateRateLimit(response);

    if (!response.ok) return null;

    const data = (await response.json()) as {
      name?: string;
      content?: string;
      encoding?: string;
      download_url?: string | null;
    };

    const filename = data.name ?? "README.md";

    // Prefer the pre-encoded content GitHub returns; fall back to the raw
    // download_url when content is missing or not base64-encoded.
    if (data.content && data.encoding === "base64") {
      try {
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        return { filename, content };
      } catch {
        // fall through to download_url
      }
    }

    if (data.download_url) {
      const rawResponse = await fetch(data.download_url, {
        signal: AbortSignal.timeout(8000),
      });
      if (rawResponse.ok) {
        return { filename, content: await rawResponse.text() };
      }
    }

    return null;
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
