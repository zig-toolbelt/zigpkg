<script lang="ts">
	import PackageRow from '$lib/components/package-row.svelte';

	let { data } = $props();

	const totalPages = $derived(Math.ceil(data.totalCount / 20));
</script>

<div>
	<!-- Results count -->
	{#if data.q}
		<p class="text-sm text-muted-foreground mb-4">
			{data.totalCount.toLocaleString()} result{data.totalCount !== 1 ? 's' : ''} for "<span class="text-foreground font-medium">{data.q}</span>"
		</p>
	{/if}

	<!-- Package List -->
	{#if data.packages.length === 0}
		<div class="py-16 text-center text-muted-foreground">
			{data.q ? 'No packages found.' : 'Enter a search query to find packages.'}
		</div>
	{:else}
		<div class="divide-y divide-border border border-border rounded-lg overflow-hidden">
			{#each data.packages as pkg (pkg.id)}
				<PackageRow {...pkg} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-6 flex items-center justify-center gap-1">
				{#if data.page > 1}
					<a
						href={`/search?q=${encodeURIComponent(data.q)}&page=${data.page - 1}`}
						class="px-3 py-1.5 text-sm rounded border border-border hover:bg-accent transition-colors"
					>&larr;</a>
				{/if}
				<span class="px-3 py-1.5 text-sm text-muted-foreground">
					Page {data.page} of {totalPages}
				</span>
				{#if data.page < totalPages}
					<a
						href={`/search?q=${encodeURIComponent(data.q)}&page=${data.page + 1}`}
						class="px-3 py-1.5 text-sm rounded border border-border hover:bg-accent transition-colors"
					>&rarr;</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
