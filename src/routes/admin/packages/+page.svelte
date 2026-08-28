<script lang="ts">
	import { Package, Search, ChevronLeft, ChevronRight, Trash2, Star, ExternalLink, UserCog } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';

	let { data } = $props();

	let searchInput = $state(untrack(() => data.search));
	let ownerInputs = $state<Record<number, string>>({});
	let confirmDelete = $state<number | null>(null);

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function submitSearch(e: SubmitEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (searchInput.trim()) params.set('q', searchInput.trim());
		if (data.status !== 'all') params.set('status', data.status);
		if (data.origin !== 'all') params.set('origin', data.origin);
		if (data.sort !== 'new') params.set('sort', data.sort);
		window.location.href = `/admin/packages${params.size > 0 ? `?${params.toString()}` : ''}`;
	}

	function setFilter(key: string, value: string) {
		const params = new URLSearchParams(window.location.search);
		if (value === 'all' || value === '') {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		params.delete('page');
		window.location.href = `/admin/packages?${params.toString()}`;
	}

	const totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));

	const statusBadge: Record<string, string> = {
		approved: 'bg-emerald-50 text-emerald-700',
		pending: 'bg-amber-50 text-amber-700',
		rejected: 'bg-red-50 text-red-700'
	};
</script>

<svelte:head>
	<title>Packages — Admin — zigpkg</title>
	<meta name="description" content="Manage packages." />
</svelte:head>

<div class="mx-auto max-w-6xl px-6 sm:px-10 py-10">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<a href="/admin" class="font-mono text-xs text-slate-500 hover:text-zig-700">Admin</a>
			<span class="font-mono text-xs text-slate-300">/</span>
			<h1 class="text-2xl font-semibold text-slate-900">Packages</h1>
		</div>
		<span class="font-mono text-xs text-slate-500">{data.total} total</span>
	</div>

	<!-- Filters -->
	<form onsubmit={submitSearch} class="mb-4 flex flex-wrap gap-2">
		<div class="relative min-w-[240px] flex-1">
			<Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
			<input
				type="search"
				name="q"
				value={searchInput}
				placeholder="Search by name, full name, or owner"
				class="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-zig-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
			/>
		</div>
		<select
			value={data.status}
			onchange={(e) => setFilter('status', e.currentTarget.value)}
			class="rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-700 focus:border-zig-400 focus:outline-none"
		>
			<option value="all">All statuses</option>
			<option value="approved">Approved</option>
			<option value="pending">Pending</option>
			<option value="rejected">Rejected</option>
		</select>
		<select
			value={data.origin}
			onchange={(e) => setFilter('origin', e.currentTarget.value)}
			class="rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-700 focus:border-zig-400 focus:outline-none"
		>
			<option value="all">All origins</option>
			<option value="sync">Sync</option>
			<option value="manual">Manual</option>
		</select>
		<button
			type="submit"
			class="rounded-md bg-slate-900 px-3 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
		>
			Search
		</button>
	</form>

	{#if data.packages.length === 0}
		<div class="py-20 text-center font-mono text-xs text-slate-400">
			{data.search || data.status !== 'all' || data.origin !== 'all' ? 'No packages match your filters.' : 'No packages yet.'}
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.packages as pkg (pkg.id)}
				<div class="rounded-lg border border-slate-200 p-4">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<a
									href="/packages/{pkg.fullName}"
									class="font-mono text-sm font-medium text-slate-900 hover:text-zig-700"
								>
									{pkg.fullName}
								</a>
								<span class="rounded {statusBadge[pkg.status]} px-1.5 py-0.5 font-mono text-[10px] font-medium">
									{pkg.status}
								</span>
								<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{pkg.origin}</span>
								<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{pkg.packageType}</span>
							</div>
							{#if pkg.description}
								<p class="mt-1 truncate font-mono text-xs text-slate-500">{pkg.description}</p>
							{/if}
							<div class="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
								<span>owner: <span class="text-slate-600">{pkg.owner}</span></span>
								<span class="inline-flex items-center gap-1">
									<Star class="h-3 w-3" />
									{pkg.stars}
								</span>
								{#if pkg.license}
									<span>license: {pkg.license}</span>
								{/if}
								<span>updated: {formatDate(pkg.pushedAt)}</span>
								{#if pkg.repositoryUrl}
									<a
										href={pkg.repositoryUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 text-slate-300 hover:text-zig-600"
									>
										repo <ExternalLink class="h-3 w-3" />
									</a>
								{/if}
							</div>
						</div>
					</div>

					<!-- Admin actions -->
					<div class="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
						<!-- Status switcher -->
						<form method="POST" action="?/setStatus" use:enhance class="flex items-center gap-1.5">
							<input type="hidden" name="id" value={pkg.id} />
							<span class="font-mono text-[10px] uppercase tracking-wide text-slate-400">Status:</span>
							<select
								name="status"
								value={pkg.status}
								onchange={(e) => e.currentTarget.form?.requestSubmit()}
								class="rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-700 focus:border-zig-400 focus:outline-none"
							>
								<option value="approved">approved</option>
								<option value="pending">pending</option>
								<option value="rejected">rejected</option>
							</select>
						</form>

						<!-- Owner change -->
						<form method="POST" action="?/setOwner" use:enhance class="flex items-center gap-1.5">
							<input type="hidden" name="id" value={pkg.id} />
							<span class="font-mono text-[10px] uppercase tracking-wide text-slate-400">Owner:</span>
							<input
								type="text"
								name="username"
								placeholder={pkg.owner}
								value={ownerInputs[pkg.id] ?? ''}
								oninput={(e) => (ownerInputs[pkg.id] = e.currentTarget.value)}
								class="w-32 rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-700 placeholder:text-slate-300 focus:border-zig-400 focus:outline-none"
							/>
							<button
								type="submit"
								class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600 hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
							>
								<UserCog class="h-3 w-3" />
								Set
							</button>
						</form>

						<!-- Delete -->
						<div class="ml-auto">
							{#if confirmDelete === pkg.id}
								<form method="POST" action="?/delete" use:enhance class="flex items-center gap-1.5">
									<input type="hidden" name="id" value={pkg.id} />
									<span class="font-mono text-[11px] text-red-700">Confirm?</span>
									<button
										type="submit"
										class="rounded-md bg-red-600 px-2 py-1 font-mono text-[11px] font-medium text-white hover:bg-red-700"
									>
										Delete
									</button>
									<button
										type="button"
										onclick={() => (confirmDelete = null)}
										class="rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-slate-50"
									>
										Cancel
									</button>
								</form>
							{:else}
								<button
									type="button"
									onclick={() => (confirmDelete = pkg.id)}
									class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
								>
									<Trash2 class="h-3 w-3" />
									Delete
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
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
						{#if data.status !== 'all'}{params.set('status', data.status)}{/if}
						{#if data.origin !== 'all'}{params.set('origin', data.origin)}{/if}
						{#if data.sort !== 'new'}{params.set('sort', data.sort)}{/if}
						{params.set('page', String(data.page - 1))}
						<a
							href={`/admin/packages?${params.toString()}`}
							class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-600 hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
						>
							<ChevronLeft class="h-3.5 w-3.5" />
							Prev
						</a>
					{/if}
					{#if data.page < totalPages}
						{@const params = new URLSearchParams()}
						{#if data.search}{params.set('q', data.search)}{/if}
						{#if data.status !== 'all'}{params.set('status', data.status)}{/if}
						{#if data.origin !== 'all'}{params.set('origin', data.origin)}{/if}
						{#if data.sort !== 'new'}{params.set('sort', data.sort)}{/if}
						{params.set('page', String(data.page + 1))}
						<a
							href={`/admin/packages?${params.toString()}`}
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
