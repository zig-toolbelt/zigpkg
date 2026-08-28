<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		CheckCircle2,
		AlertTriangle,
		Star,
		GitFork,
		FileCode,
		Package,
		ExternalLink,
		ArrowLeft,
		Clock,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	let showRejectForm = $state(false);
	let rejectReason = $state('');

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function languageFlag(lang: string | null): boolean {
		return lang !== null && lang !== 'Zig';
	}

	$effect(() => {
		if (form?.success) {
			goto('/moderation');
		}
	});
</script>

<svelte:head>
	<title>Review {data.pkg.fullName} — zigpkg</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 sm:px-10 py-10">
	<a
		href="/moderation"
		class="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 transition-colors hover:text-slate-900"
	>
		<ArrowLeft class="h-3.5 w-3.5" />
		Back to queue
	</a>

	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center gap-3">
			{#if data.pkg.ownerAvatarUrl}
				<img src={data.pkg.ownerAvatarUrl} alt={data.pkg.owner} class="h-8 w-8 rounded-full" />
			{/if}
			<div>
				<h1 class="text-xl font-semibold text-slate-900">{data.pkg.fullName}</h1>
				<p class="font-mono text-xs text-slate-500">by {data.pkg.owner}</p>
			</div>
		</div>

		<!-- Status badge -->
		<div class="mt-3">
			{#if data.pkg.status === 'pending'}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-mono text-xs font-medium text-amber-700">
					<Clock class="h-3 w-3" />
					Pending review
				</span>
			{:else if data.pkg.status === 'approved'}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-medium text-emerald-700">
					<CheckCircle2 class="h-3 w-3" />
					Approved
				</span>
			{:else if data.pkg.status === 'rejected'}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 font-mono text-xs font-medium text-red-700">
					<XCircle class="h-3 w-3" />
					Rejected
				</span>
			{/if}
			{#if data.pkg.origin === 'manual'}
				<span class="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">manual</span>
			{:else}
				<span class="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">sync</span>
			{/if}
		</div>
	</div>

	{#if data.pkg.description}
		<p class="mb-6 font-mono text-sm text-slate-600">{data.pkg.description}</p>
	{/if}

	<!-- Validation signals -->
	<div class="mb-6 rounded-lg border border-slate-200 p-4">
		<h2 class="mb-3 font-mono text-xs font-medium text-slate-700">Validation</h2>
		<div class="flex flex-wrap gap-2">
			{#if languageFlag(data.pkg.primaryLanguage)}
				<span class="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 font-mono text-[11px] text-red-700">
					<AlertTriangle class="h-3 w-3" />
					Primary language: {data.pkg.primaryLanguage}
				</span>
			{:else if data.pkg.primaryLanguage === 'Zig'}
				<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 font-mono text-[11px] text-emerald-700">
					<CheckCircle2 class="h-3 w-3" />
					Primary language: Zig
				</span>
			{:else}
				<span class="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500">
					Language: unknown
				</span>
			{/if}

			{#if data.pkg.hasBuildZigZon === true}
				<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 font-mono text-[11px] text-emerald-700">
					<FileCode class="h-3 w-3" />
					build.zig.zon found
				</span>
			{:else if data.pkg.hasBuildZigZon === false}
				<span class="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-700">
					<AlertTriangle class="h-3 w-3" />
					No build.zig.zon
				</span>
			{/if}

			{#if data.pkg.hasZigFiles === true}
				<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 font-mono text-[11px] text-emerald-700">
					<Package class="h-3 w-3" />
					.zig files found
				</span>
			{:else if data.pkg.hasZigFiles === false && data.pkg.hasBuildZigZon === false}
				<span class="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-700">
					<Package class="h-3 w-3" />
					No .zig files in root
				</span>
			{/if}
		</div>
	</div>

	<!-- Metadata grid -->
	<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
		<div>
			<p class="font-mono text-[10px] uppercase text-slate-400">Stars</p>
			<p class="mt-0.5 flex items-center gap-1 font-mono text-sm text-slate-900">
				<Star class="h-3.5 w-3.5 text-slate-400" />
				{data.pkg.stars}
			</p>
		</div>
		<div>
			<p class="font-mono text-[10px] uppercase text-slate-400">Forks</p>
			<p class="mt-0.5 flex items-center gap-1 font-mono text-sm text-slate-900">
				<GitFork class="h-3.5 w-3.5 text-slate-400" />
				{data.pkg.forks}
			</p>
		</div>
		<div>
			<p class="font-mono text-[10px] uppercase text-slate-400">License</p>
			<p class="mt-0.5 font-mono text-sm text-slate-900">{data.pkg.license ?? '—'}</p>
		</div>
		<div>
			<p class="font-mono text-[10px] uppercase text-slate-400">Type</p>
			<p class="mt-0.5 font-mono text-sm text-slate-900">{data.pkg.packageType}</p>
		</div>
	</div>

	<!-- Topics -->
	{#if data.pkg.topics.length > 0}
		<div class="mb-6">
			<p class="mb-1.5 font-mono text-[10px] uppercase text-slate-400">Topics</p>
			<div class="flex flex-wrap gap-1.5">
				{#each data.pkg.topics as topic (topic)}
					<span class="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">{topic}</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Dates -->
	<div class="mb-6 space-y-1 font-mono text-xs text-slate-500">
		<p>Created: {formatDate(data.pkg.createdAt)}</p>
		<p>Updated: {formatDate(data.pkg.updatedAt)}</p>
		<p>Last push: {formatDate(data.pkg.pushedAt)}</p>
		{#if data.pkg.submittedAt}
			<p>Submitted: {formatDate(data.pkg.submittedAt)}</p>
		{/if}
	</div>

	<!-- Repository link -->
	<a
		href={data.pkg.repositoryUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-zig-600 hover:text-zig-700"
	>
		<ExternalLink class="h-3.5 w-3.5" />
		View repository
	</a>

	{#if data.pkg.rejectionReason}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
			<p class="font-mono text-xs font-medium text-red-900">Rejection reason</p>
			<p class="mt-1 font-mono text-xs text-red-700">{data.pkg.rejectionReason}</p>
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
			<p class="font-mono text-xs text-red-700">{form.error}</p>
		</div>
	{/if}

	<!-- Actions -->
	{#if data.pkg.status === 'pending'}
		<div class="border-t border-slate-200 pt-6">
			{#if !showRejectForm}
				<div class="flex gap-3">
					<form method="POST" action="?/approve">
						<button
							type="submit"
							class="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 font-mono text-xs font-medium text-white transition-colors hover:bg-emerald-700"
						>
							<CheckCircle2 class="h-3.5 w-3.5" />
							Approve
						</button>
					</form>
					<button
						type="button"
						class="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-4 py-2 font-mono text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
						onclick={() => (showRejectForm = true)}
					>
						<XCircle class="h-3.5 w-3.5" />
						Reject
					</button>
				</div>
			{:else}
				<form method="POST" action="?/reject" class="space-y-3">
					<div>
						<label for="reason" class="mb-1.5 block font-mono text-xs font-medium text-slate-700">
							Rejection reason
						</label>
						<textarea
							id="reason"
							name="reason"
							bind:value={rejectReason}
							rows="3"
							placeholder="Explain why this package is being rejected (e.g. not a Zig package, pet project, duplicate)..."
							class="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-zig-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 font-mono text-xs font-medium text-white transition-colors hover:bg-red-700"
						>
							<XCircle class="h-3.5 w-3.5" />
							Confirm rejection
						</button>
						<button
							type="button"
							class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 font-mono text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
							onclick={() => (showRejectForm = false)}
						>
							Cancel
						</button>
					</div>
				</form>
			{/if}
		</div>
	{/if}
</div>
