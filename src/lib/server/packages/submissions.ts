import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { packages, users } from '$lib/server/db/schema';
import { getRepoClient, getContentClient } from '$lib/server/content-client';
import type { GitHubContent } from '$lib/types/github';
import type { PackageType } from '$lib/types/package';

const TOPIC_TO_TYPE: Record<string, PackageType> = {
	'zig-package': 'library',
	'zig-library': 'library',
	'zig-program': 'application'
};

export type SubmitResult =
	| { ok: true; packageId: number; warnings: string[] }
	| { ok: false; error: string };

// parseRepoInput accepts either an "owner/repo" shorthand (assumed GitHub) or a
// full URL to github.com / codeberg.org and returns the source-neutral triple.
// Returns null for anything that doesn't look like a repo reference.
export function parseRepoInput(
	input: string
): { source: string; owner: string; repo: string } | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	const urlMatch = trimmed.match(
		/^https?:\/\/(?:www\.)?(github\.com|codeberg\.org)\/([^/]+)\/([^/?#]+)/i
	);
	if (urlMatch) {
		const domain = urlMatch[1].toLowerCase();
		return {
			source: domain === 'github.com' ? 'github' : 'codeberg',
			owner: urlMatch[2],
			repo: urlMatch[3].replace(/\.git$/, '')
		};
	}

	const shorthandMatch = trimmed.match(/^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/);
	if (shorthandMatch) {
		return {
			source: 'github',
			owner: shorthandMatch[1],
			repo: shorthandMatch[2].replace(/\.git$/, '')
		};
	}

	return null;
}

function determinePackageType(topics: string[]): PackageType {
	for (const t of topics) {
		const mapped = TOPIC_TO_TYPE[t];
		if (mapped) return mapped;
	}
	return 'library';
}

// computePrimaryLanguage returns the language with the most bytes, or null when
// the host reports no languages (empty repo, fetch failure).
function computePrimaryLanguage(
	languages: Record<string, number> | null
): string | null {
	if (!languages) return null;
	let primary: string | null = null;
	let max = -1;
	for (const [lang, bytes] of Object.entries(languages)) {
		if (bytes > max) {
			max = bytes;
			primary = lang;
		}
	}
	return primary;
}

function detectZigSignals(contents: GitHubContent[] | null): {
	hasZigFiles: boolean;
	hasBuildZigZon: boolean;
} {
	if (!contents) return { hasZigFiles: false, hasBuildZigZon: false };
	let hasZigFiles = false;
	let hasBuildZigZon = false;
	for (const entry of contents) {
		if (entry.type !== 'file') continue;
		if (entry.name === 'build.zig.zon') hasBuildZigZon = true;
		if (entry.name.endsWith('.zig')) hasZigFiles = true;
	}
	return { hasZigFiles, hasBuildZigZon };
}

// submitPackage fetches a repo's metadata, runs lightweight validation (primary
// language, presence of build.zig.zon / .zig files), checks for duplicates, and
// inserts a pending package row for moderator review. Validation never blocks
// submission — suspicious signals surface as warnings the moderator sees.
export async function submitPackage(
	submitterId: string,
	input: string
): Promise<SubmitResult> {
	const parsed = parseRepoInput(input);
	if (!parsed) {
		return { ok: false, error: 'Invalid repository. Use "owner/repo" or a full github.com/codeberg.org URL.' };
	}
	const { source, owner, repo } = parsed;

	const repoClient = getRepoClient(source);
	const contentClient = getContentClient(source);

	const repoMetadata = await repoClient.getRepo(owner, repo);
	if (!repoMetadata) {
		return { ok: false, error: 'Repository not found. Check the name and try again.' };
	}

	const [languages, rootContents] = await Promise.all([
		repoClient.getLanguages(owner, repo),
		contentClient.getContents(owner, repo, '')
	]);

	const primaryLanguage = computePrimaryLanguage(languages);
	const { hasZigFiles, hasBuildZigZon } = detectZigSignals(rootContents);
	const packageType = determinePackageType(repoMetadata.topics);

	const [existing] = await db
		.select({ id: packages.id, status: packages.status })
		.from(packages)
		.where(and(eq(packages.source, source), eq(packages.sourceId, repoMetadata.sourceId)))
		.limit(1);

	if (existing) {
		if (existing.status === 'approved') {
			return { ok: false, error: 'This package is already in the registry.' };
		}
		if (existing.status === 'pending') {
			return { ok: false, error: 'This package is already awaiting review.' };
		}
	}

	const [ownerRow] = await db
		.insert(users)
		.values({
			source,
			sourceId: repoMetadata.ownerSourceId,
			username: repoMetadata.ownerLogin,
			avatarUrl: repoMetadata.ownerAvatarUrl,
			htmlUrl: repoMetadata.ownerHtmlUrl
		})
		.onConflictDoUpdate({
			target: [users.source, users.sourceId],
			set: {
				username: repoMetadata.ownerLogin,
				avatarUrl: repoMetadata.ownerAvatarUrl,
				htmlUrl: repoMetadata.ownerHtmlUrl,
				updatedAt: new Date()
			}
		})
		.returning({ id: users.id });

	const warnings: string[] = [];
	if (primaryLanguage && primaryLanguage !== 'Zig') {
		warnings.push(`Primary language is ${primaryLanguage}, not Zig.`);
	}
	if (!hasBuildZigZon) {
		warnings.push('No build.zig.zon found in the repository root.');
	}
	if (!hasZigFiles && !hasBuildZigZon) {
		warnings.push('No .zig files found in the repository root.');
	}

	const now = new Date();
	const values = {
		source,
		sourceId: repoMetadata.sourceId,
		name: repoMetadata.name,
		fullName: repoMetadata.fullName,
		ownerId: ownerRow.id,
		description: repoMetadata.description,
		stars: repoMetadata.stars,
		forks: repoMetadata.forks,
		openIssues: repoMetadata.openIssues,
		license: repoMetadata.license,
		homepage: repoMetadata.homepage,
		repositoryUrl: repoMetadata.url,
		topics: repoMetadata.topics,
		packageType,
		createdAt: new Date(repoMetadata.createdAt),
		updatedAt: new Date(repoMetadata.updatedAt),
		pushedAt: new Date(repoMetadata.pushedAt),
		status: 'pending' as const,
		origin: 'manual' as const,
		submittedBy: submitterId,
		submittedAt: now,
		primaryLanguage,
		hasZigFiles,
		hasBuildZigZon
	};

	if (existing && existing.status === 'rejected') {
		const [updated] = await db
			.update(packages)
			.set({
				...values,
				reviewedBy: null,
				reviewedAt: null,
				rejectionReason: null
			})
			.where(eq(packages.id, existing.id))
			.returning({ id: packages.id });
		return { ok: true, packageId: updated.id, warnings };
	}

	const [inserted] = await db
		.insert(packages)
		.values(values)
		.returning({ id: packages.id });

	return { ok: true, packageId: inserted.id, warnings };
}
