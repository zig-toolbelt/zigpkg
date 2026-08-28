<script lang="ts">
	import { CheckCircle2, AlertTriangle, Clock, Star, FileCode, Package } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function languageFlag(lang: string | null): boolean {
		return lang !== null && lang !== 'Zig';
	}
</script>

<svelte:head>
	<title>Moderation — zigpkg</title>
	<meta name="description" content="Review pending and flagged package submissions." />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 sm:px-10 py-10">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-900">Moderation</h1>
		{#if data.pendingCount > 0}
			<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-mono text-xs font-medium text-amber-700">
				<Clock class="h-3 w-3" />
				{data.pendingCount} pending
			</span>
		{/if}
	</div>

	<!-- Tabs -->
	<div class="mb-6 flex gap-1 border-b border-slate-200">
		<a
			href="/moderation?tab=pending"
			class="border-b-2 px-3 py-2 font-mono text-xs font-medium transition-colors {data.tab === 'pending' ? 'border-zig-600 text-zig-700' : 'border-transparent text-slate-500 hover:text-slate-900'}"
		>
			Pending review
		</a>
		<a
			href="/moderation?tab=flagged"
			class="border-b-2 px-3 py-2 font-mono text-xs font-medium transition-colors {data.tab === 'flagged' ? 'border-zig-600 text-zig-700' : 'border-transparent text-slate-500 hover:text-slate-900'}"
		>
			Flagged
		</a>
	</div>

	{#if data.packages.length === 0}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			{data.tab === 'pending' ? 'No packages awaiting review.' : 'No flagged packages.'}
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.packages as pkg (pkg.id)}
				<a
					href="/moderation/{pkg.id}"
					class="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-zig-300 hover:bg-zig-50/30"
				>
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm font-medium text-slate-900">{pkg.fullName}</span>
								{#if pkg.origin === 'manual'}
									<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">manual</span>
								{:else}
									<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">sync</span>
								{/if}
							</div>
							{#if pkg.description}
								<p class="mt-1 truncate font-mono text-xs text-slate-500">{pkg.description}</p>
							{/if}
						</div>
						<div class="flex shrink-0 items-center gap-3 font-mono text-xs text-slate-400">
							<span class="inline-flex items-center gap-1">
								<Star class="h-3 w-3" />
								{pkg.stars}
							</span>
						</div>
					</div>

					<!-- Validation flags -->
					<div class="mt-3 flex flex-wrap gap-2">
						{#if languageFlag(pkg.primaryLanguage)}
							<span class="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 font-mono text-[10px] text-red-700">
								<AlertTriangle class="h-3 w-3" />
								{pkg.primaryLanguage}
							</span>
						{:else if pkg.primaryLanguage === 'Zig'}
							<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
								<CheckCircle2 class="h-3 w-3" />
								Zig
							</span>
						{/if}
						{#if pkg.hasBuildZigZon === false}
							<span class="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-mono text-[10px] text-amber-700">
								<FileCode class="h-3 w-3" />
								No build.zig.zon
							</span>
						{:else if pkg.hasBuildZigZon === true}
							<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
								<FileCode class="h-3 w-3" />
								build.zig.zon
							</span>
						{/if}
						{#if pkg.hasZigFiles === false && pkg.hasBuildZigZon === false}
							<span class="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-mono text-[10px] text-amber-700">
								<Package class="h-3 w-3" />
								No .zig files
							</span>
						{/if}
					</div>

					{#if pkg.submittedAt}
						<p class="mt-2 font-mono text-[10px] text-slate-400">Submitted {formatDate(pkg.submittedAt)}</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
