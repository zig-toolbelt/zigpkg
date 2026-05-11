<script lang="ts">
	import { goto } from '$app/navigation';
	import PackageRow from '$lib/components/package-row.svelte';

	let { data } = $props();

	const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	const totalPages = $derived(Math.ceil(data.totalCount / 30));

	const visiblePages = $derived.by(() => {
		const pages: (number | '...')[] = [];
		const total = totalPages;
		const current = data.page;

		if (total <= 7) {
			for (let i = 1; i <= total; i++) pages.push(i);
		} else {
			pages.push(1);
			if (current > 3) pages.push('...');
			const start = Math.max(2, current - 1);
			const end = Math.min(total - 1, current + 1);
			for (let i = start; i <= end; i++) pages.push(i);
			if (current < total - 2) pages.push('...');
			pages.push(total);
		}

		return pages;
	});

	function buildUrl(params: { page?: number; sort?: string; letter?: string | null }) {
		const p = new URLSearchParams();
		const page = params.page ?? data.page;
		const sort = params.sort ?? data.sort;
		const letter = 'letter' in params ? params.letter : data.letter;

		if (page > 1) p.set('page', String(page));
		if (sort !== 'stars') p.set('sort', sort);
		if (letter) p.set('letter', letter);

		const qs = p.toString();
		return `/packages${qs ? '?' + qs : ''}`;
	}

	function navigate(params: { page?: number; sort?: string; letter?: string | null }) {
		goto(buildUrl(params));
	}

	const sortOptions: { label: string; value: string }[] = [
		{ label: 'Stars', value: 'stars' },
		{ label: 'Name', value: 'name' },
		{ label: 'Recently Created', value: 'new' },
		{ label: 'Recently Updated', value: 'updated' }
	];
</script>

<div class="">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-foreground">Packages</h1>
		<p class="text-muted-foreground mt-1">
			{data.totalCount.toLocaleString()} Result{data.totalCount !== 1 ? 's' : ''} Found
		</p>
	</div>

	<!-- Letter Filter -->
	<div class="mb-4 flex flex-wrap gap-1">
		<button
			onclick={() => navigate({ letter: null, page: 1 })}
			class="px-2.5 py-1 text-sm rounded border transition-colors {!data.letter
				? 'bg-primary text-primary-foreground border-primary'
				: 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}"
		>
			All
		</button>
		{#each LETTERS as letter (letter)}
			<button
				onclick={() => navigate({ letter, page: 1 })}
				class="px-2.5 py-1 text-sm rounded border transition-colors {data.letter === letter
					? 'bg-primary text-primary-foreground border-primary'
					: 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}"
			>
				{letter}
			</button>
		{/each}
	</div>

	<!-- Sort Options -->
	<div class="mb-4 flex items-center gap-1 border-b border-border pb-3">
		<span class="text-sm text-muted-foreground mr-2">Sort by:</span>
		{#each sortOptions as option (option.value)}
			<button
				onclick={() => navigate({ sort: option.value, page: 1 })}
				class="px-3 py-1.5 text-sm rounded transition-colors {data.sort === option.value
					? 'bg-accent text-foreground font-medium'
					: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
			>
				{option.label}
			</button>
		{/each}
	</div>

	<!-- Package List -->
	{#if data.packages.length === 0}
		<div class="py-16 text-center text-muted-foreground">No packages found.</div>
	{:else}
		<div class="divide-y divide-border border border-border rounded-lg overflow-hidden">
			{#each data.packages as pkg (pkg.id)}
				<PackageRow {...pkg} />
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-6 flex items-center justify-center gap-1">
			<button
				onclick={() => navigate({ page: data.page - 1 })}
				disabled={data.page <= 1}
				class="px-3 py-1.5 text-sm rounded border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-accent"
			>
				&larr;
			</button>

			{#each visiblePages as pg (pg)}
				{#if pg === '...'}
					<span class="px-2 py-1.5 text-sm text-muted-foreground">…</span>
				{:else}
					<button
						onclick={() => navigate({ page: pg as number })}
						class="px-3 py-1.5 text-sm rounded border transition-colors {data.page === pg
							? 'bg-primary text-primary-foreground border-primary font-medium'
							: 'border-border hover:bg-accent'}"
					>
						{pg}
					</button>
				{/if}
			{/each}

			<button
				onclick={() => navigate({ page: data.page + 1 })}
				disabled={data.page >= totalPages}
				class="px-3 py-1.5 text-sm rounded border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-accent"
			>
				&rarr;
			</button>
		</div>
	{/if}
</div>
