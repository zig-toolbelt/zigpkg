<script lang="ts">
	import { Badge } from '$lib/components/ui';

	interface Props {
		name: string;
		fullName: string;
		description: string;
		version: string;
		downloads?: string;
		isNew?: boolean;
	}

	let { name, fullName, description, version, downloads, isNew = false }: Props = $props();
</script>

<a
	href="/packages/{fullName}"
	class="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
>
	<div class="flex items-start justify-between gap-2">
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h3 class="font-semibold text-foreground truncate">{fullName}</h3>
				{#if isNew}
					<Badge variant="secondary" class="text-xs">New</Badge>
				{/if}
			</div>
			<p class="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
		</div>
		<div class="text-right shrink-0">
			<Badge variant="outline">{version}</Badge>
			{#if downloads}
				<div class="text-xs text-muted-foreground mt-1">{downloads}</div>
			{/if}
		</div>
	</div>
</a>
