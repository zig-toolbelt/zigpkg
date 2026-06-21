<script lang="ts">
	import PackageCard from '$lib/components/package-card.svelte';

	let { data } = $props();

	const totalPages = $derived(Math.ceil(data.totalCount / 20));
</script>

<!-- Results count -->
{#if data.q}
	<p class="mb-5 font-mono text-xs text-slate-400">
		{data.totalCount.toLocaleString()} result{data.totalCount !== 1 ? 's' : ''} for
		<span class="text-slate-700">"{data.q}"</span>
	</p>
{/if}

<!-- Package grid -->
{#if data.packages.length === 0}
	<div class="py-20 text-center font-mono text-xs text-slate-400">
		{data.q ? 'No packages found.' : 'Enter a search query to find packages.'}
	</div>
{:else}
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.packages as pkg (pkg.id)}
			<PackageCard {...pkg} />
		{/each}
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-8 flex items-center justify-center gap-3 font-mono text-xs">
			{#if data.page > 1}
				<a
					href={`/search?q=${encodeURIComponent(data.q)}&page=${data.page - 1}`}
					class="h-7 px-2.5 flex items-center rounded-sm text-slate-500 hover:bg-slate-100 transition-colors"
				>←</a>
			{/if}
			<span class="text-slate-400">
				Page {data.page} / {totalPages}
			</span>
			{#if data.page < totalPages}
				<a
					href={`/search?q=${encodeURIComponent(data.q)}&page=${data.page + 1}`}
					class="h-7 px-2.5 flex items-center rounded-sm text-slate-500 hover:bg-slate-100 transition-colors"
				>→</a>
			{/if}
		</div>
	{/if}
{/if}
