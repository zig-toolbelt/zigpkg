<script lang="ts">
	import PackageListCard from './package-list-card.svelte';

	interface Package {
		name: string;
		fullName: string;
		description: string;
		version: string;
		downloads?: string;
		isNew?: boolean;
	}

	interface Props {
		title: string;
		packages: Package[];
		viewAllHref?: string;
	}

	let { title, packages, viewAllHref }: Props = $props();
</script>

<section class="py-12">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-xl font-bold">{title}</h2>
			{#if viewAllHref}
				<a href={viewAllHref} class="text-sm text-muted-foreground hover:text-foreground">
					View all &rarr;
				</a>
			{/if}
		</div>
		<div class="grid md:grid-cols-2 gap-4">
			{#each packages as pkg}
				<PackageListCard {...pkg} />
			{/each}
		</div>
	</div>
</section>
