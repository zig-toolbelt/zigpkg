<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui';
	import { formatNumber } from '$lib/utils/formatNumber';
	import { Star, GitFork } from 'lucide-svelte';

	interface Props {
		name: string;
		fullName: string;
		version: string;
		packageType: string;
		description: string | null;
		stars: number;
		forks: number;
	}

	let { fullName, version, packageType, description, stars, forks }: Props = $props();
</script>

<div class="flex items-start gap-4 px-4 py-4 bg-card hover:bg-accent/30 transition-colors">
	<!-- Stats -->
	<div class="shrink-0 flex flex-col items-end gap-1 min-w-18 pt-0.5">
		<div class="flex items-center gap-1 text-sm font-medium text-foreground">
			<Star class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
			{formatNumber(stars)}
		</div>
		<div class="flex items-center gap-1 text-xs text-muted-foreground">
			<GitFork class="w-3 h-3" />
			{formatNumber(forks)} forks
		</div>
	</div>

	<!-- Package Info -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center flex-wrap gap-2 mb-1">
			<a
				href={resolve(`/packages/${fullName}`)}
				class="font-semibold text-foreground hover:text-primary transition-colors"
			>
				{fullName}
			</a>
			<Badge variant="outline" class="text-xs">{version}</Badge>
			<Badge variant="secondary" class="text-xs capitalize">{packageType}</Badge>
		</div>
		{#if description}
			<p class="text-sm text-muted-foreground line-clamp-2">{description}</p>
		{:else}
			<p class="text-sm text-muted-foreground/50 italic">No description</p>
		{/if}
	</div>
</div>
