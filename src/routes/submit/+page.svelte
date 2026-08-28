<script lang="ts">
	import { CheckCircle2, AlertCircle, Plus } from 'lucide-svelte';

	let { data, form } = $props();

	let repo = $state('');
</script>

<svelte:head>
	<title>Submit a package — zigpkg</title>
	<meta name="description" content="Submit a Zig package from GitHub or Codeberg to the zigpkg registry." />
</svelte:head>

<div class="mx-auto max-w-2xl px-6 sm:px-10 py-12">
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-slate-900">Submit a package</h1>
		<p class="mt-2 font-mono text-xs text-slate-500">
			Add a Zig package from GitHub or Codeberg that isn't auto-discovered via topics.
			Submissions are reviewed by moderators before appearing in the registry.
		</p>
	</div>

	{#if !data.isLoggedIn}
		<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
			<div class="flex items-start gap-2.5">
				<AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
				<div>
					<p class="text-sm font-medium text-amber-900">Sign in required</p>
					<p class="mt-1 font-mono text-xs text-amber-700">
						You need to sign in with GitHub to submit a package.
					</p>
				</div>
			</div>
		</div>
	{:else if form?.success}
		<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
			<div class="flex items-start gap-2.5">
				<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
				<div class="flex-1">
					<p class="text-sm font-medium text-emerald-900">Package submitted for review</p>
					<p class="mt-1 font-mono text-xs text-emerald-700">
						A moderator will review your submission. You can track its status in the moderation queue.
					</p>
					{#if form.warnings.length > 0}
						<ul class="mt-3 space-y-1">
							{#each form.warnings as warning (warning)}
								<li class="flex items-start gap-1.5 font-mono text-xs text-amber-700">
									<span class="mt-0.5">•</span>
									{warning}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-6">
			<a
				href="/submit"
				class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
			>
				<Plus class="h-3.5 w-3.5" />
				Submit another
			</a>
		</div>
	{:else}
		<form method="POST" class="space-y-4">
			<div>
				<label for="repo" class="mb-1.5 block font-mono text-xs font-medium text-slate-700">
					Repository
				</label>
				<input
					id="repo"
					name="repo"
					type="text"
					bind:value={repo}
					placeholder="owner/repo or https://github.com/owner/repo"
					class="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-zig-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
					required
				/>
				<p class="mt-1.5 font-mono text-[11px] text-slate-400">
					Accepts <code class="text-slate-600">owner/repo</code> (GitHub) or full URLs to github.com / codeberg.org.
				</p>
			</div>

			{#if form?.error}
				<div class="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
					<AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
					<p class="font-mono text-xs text-red-700">{form.error}</p>
				</div>
			{/if}

			<button
				type="submit"
				class="inline-flex items-center gap-1.5 rounded-md bg-zig-600 px-4 py-2 font-mono text-xs font-medium text-white transition-colors hover:bg-zig-700"
			>
				<Plus class="h-3.5 w-3.5" />
				Submit for review
			</button>
		</form>
	{/if}
</div>
