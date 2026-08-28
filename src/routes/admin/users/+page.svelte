<script lang="ts">
	import { Ban, ShieldCheck, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';

	let { data } = $props();

	let searchInput = $state(untrack(() => data.search));

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function submitSearch(e: SubmitEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (searchInput.trim()) params.set('q', searchInput.trim());
		if (data.sort !== 'new') params.set('sort', data.sort);
		window.location.href = `/admin/users${params.size > 0 ? `?${params.toString()}` : ''}`;
	}

	const totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));
</script>

<svelte:head>
	<title>Users — Admin — zigpkg</title>
	<meta name="description" content="Manage registered users." />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 sm:px-10 py-10">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<a href="/admin" class="font-mono text-xs text-slate-500 hover:text-zig-700">Admin</a>
			<span class="font-mono text-xs text-slate-300">/</span>
			<h1 class="text-2xl font-semibold text-slate-900">Users</h1>
		</div>
		<span class="font-mono text-xs text-slate-500">{data.total} total</span>
	</div>

	<!-- Search -->
	<form onsubmit={submitSearch} class="mb-6 flex gap-2">
		<div class="relative flex-1">
			<Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
			<input
				type="search"
				name="q"
				value={searchInput}
				placeholder="Search by username, name, or email"
				class="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-zig-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
			/>
		</div>
		<button
			type="submit"
			class="rounded-md bg-slate-900 px-3 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
		>
			Search
		</button>
	</form>

	{#if data.users.length === 0}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			{data.search ? 'No users match your search.' : 'No users yet.'}
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-slate-200">
			<table class="w-full">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500">User</th>
						<th class="hidden px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:table-cell">Source</th>
						<th class="hidden px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500 md:table-cell">Joined</th>
						<th class="px-4 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500">Role</th>
						<th class="px-4 py-2 text-right font-mono text-[11px] font-medium uppercase tracking-wide text-slate-500">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.users as user (user.id)}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-2.5">
									{#if user.avatarUrl}
										<img src={user.avatarUrl} alt={user.username} class="h-7 w-7 rounded-full" />
									{/if}
									<div class="min-w-0">
										<div class="flex items-center gap-1.5">
											<span class="font-mono text-sm font-medium text-slate-900">{user.username}</span>
											{#if user.htmlUrl}
												<a
													href={user.htmlUrl}
													target="_blank"
													rel="noopener noreferrer"
													class="text-slate-300 hover:text-zig-600"
												>
													<ExternalLink class="h-3 w-3" />
												</a>
											{/if}
										</div>
										{#if user.email}
											<p class="truncate font-mono text-[10px] text-slate-400">{user.email}</p>
										{/if}
									</div>
								</div>
							</td>
							<td class="hidden px-4 py-3 sm:table-cell">
								<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{user.source}</span>
							</td>
							<td class="hidden px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
								{formatDate(user.createdAt)}
							</td>
							<td class="px-4 py-3">
								{#if user.isAdmin}
									<span class="inline-flex items-center gap-1 rounded bg-zig-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zig-700">
										<ShieldCheck class="h-3 w-3" />
										admin
									</span>
								{:else if user.bannedAt}
									<span class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-red-700">
										<Ban class="h-3 w-3" />
										banned
									</span>
								{:else}
									<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">user</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								{#if user.isAdmin || user.id === data.currentUserId}
									<span class="font-mono text-[10px] text-slate-300">—</span>
								{:else if user.bannedAt}
									<form method="POST" action="?/unban" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<button
											type="submit"
											class="rounded-md border border-slate-200 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
										>
											Unban
										</button>
									</form>
								{:else}
									<form method="POST" action="?/ban" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<button
											type="submit"
											class="rounded-md border border-slate-200 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
										>
											Ban
										</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-6 flex items-center justify-between">
				<span class="font-mono text-xs text-slate-500">
					Page {data.page} of {totalPages}
				</span>
				<div class="flex gap-2">
					{#if data.page > 1}
						{@const params = new URLSearchParams()}
						{#if data.search}{params.set('q', data.search)}{/if}
						{#if data.sort !== 'new'}{params.set('sort', data.sort)}{/if}
						{params.set('page', String(data.page - 1))}
						<a
							href={`/admin/users?${params.toString()}`}
							class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-600 hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
						>
							<ChevronLeft class="h-3.5 w-3.5" />
							Prev
						</a>
					{/if}
					{#if data.page < totalPages}
						{@const params = new URLSearchParams()}
						{#if data.search}{params.set('q', data.search)}{/if}
						{#if data.sort !== 'new'}{params.set('sort', data.sort)}{/if}
						{params.set('page', String(data.page + 1))}
						<a
							href={`/admin/users?${params.toString()}`}
							class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-600 hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
						>
							Next
							<ChevronRight class="h-3.5 w-3.5" />
						</a>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>
