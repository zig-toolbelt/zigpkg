<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatNumber } from '$lib/utils/formatNumber';
	import { Star } from 'lucide-svelte';

	interface Props {
		name?: string;
		fullName: string;
		description?: string | null;
		stars: number;
	}

	let { name, fullName, description, stars }: Props = $props();

	const repo = $derived(name ?? fullName.split('/').slice(1).join('/') ?? fullName);
</script>

<a
	href={resolve(`/packages/${fullName}`)}
	class="group block border-b border-slate-100 py-2.5 last:border-b-0"
>
	<div class="flex items-center justify-between gap-2">
		<span class="truncate text-sm font-semibold text-slate-900 group-hover:text-zig-700">
			{repo}
		</span>
		<span class="flex shrink-0 items-center gap-1 font-mono text-xs text-slate-500">
			<Star class="h-3 w-3 text-zig-500" fill="currentColor" />
			{formatNumber(stars)}
		</span>
	</div>
	{#if description}
		<p class="mt-0.5 truncate text-xs text-slate-500">{description}</p>
	{/if}
</a>
