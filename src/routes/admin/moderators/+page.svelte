<script lang="ts">
	import { Users, ExternalLink, ShieldAlert } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Moderators — Admin — zigpkg</title>
	<meta name="description" content="List of GitHub team members with moderator access." />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 sm:px-10 py-10">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<a href="/admin" class="font-mono text-xs text-slate-500 hover:text-zig-700">Admin</a>
			<span class="font-mono text-xs text-slate-300">/</span>
			<h1 class="text-2xl font-semibold text-slate-900">Moderators</h1>
		</div>
		{#if data.configured}
			<span class="font-mono text-xs text-slate-500">{data.moderators.length} members</span>
		{/if}
	</div>

	<div class="mb-6 rounded-md border border-slate-200 bg-slate-50 p-3">
		<div class="flex gap-2">
			<ShieldAlert class="h-4 w-4 shrink-0 text-slate-500" />
			<p class="font-mono text-[11px] leading-relaxed text-slate-600">
				Moderators are managed through the GitHub team
				<code class="rounded bg-slate-200 px-1 py-0.5 text-[10px]">{data.org}/{data.team}</code>.
				Add or remove members on GitHub to change who can approve or reject package submissions.
				This list is read-only and reflects the current team membership.
			</p>
		</div>
	</div>

	{#if !data.configured}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			Moderation is not configured. Set <code class="rounded bg-slate-100 px-1 py-0.5">MODERATOR_ORG</code> and
			<code class="rounded bg-slate-100 px-1 py-0.5">MODERATOR_TEAM</code> in the environment to enable it.
		</div>
	{:else if data.tokenMissing}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			Your account has no linked GitHub access token. Re-sign in to grant the
			<code class="rounded bg-slate-100 px-1 py-0.5">read:org</code> scope and view the team.
		</div>
	{:else if data.moderators.length === 0}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			No members in the configured team.
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-slate-200">
			<table class="w-full">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500">Member</th>
						<th class="hidden px-4 py-2 text-right font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:table-cell">Profile</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.moderators as mod (mod.login)}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-2.5">
									<img src={mod.avatarUrl} alt={mod.login} class="h-7 w-7 rounded-full" />
									<span class="font-mono text-sm font-medium text-slate-900">{mod.login}</span>
								</div>
							</td>
							<td class="hidden px-4 py-3 text-right sm:table-cell">
								<a
									href={mod.htmlUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-zig-700"
								>
									GitHub <ExternalLink class="h-3 w-3" />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
