<script lang="ts">
	import type { ComponentType } from "svelte";
	import type { PageProps } from "./$types";
	import { BookOpen, CheckCircle2, ChevronLeft, Code2, Terminal } from "lucide-svelte";

	let { data }: PageProps = $props();

	const iconMap: Record<string, ComponentType> = {
		terminal: Terminal,
		"book-open": BookOpen,
		"check-circle-2": CheckCircle2,
		"code-2": Code2,
	};

	const DocIcon = $derived(iconMap[data.doc.icon] ?? BookOpen);
</script>

<svelte:head>
	<title>{data.doc.title} - ZigPkg Docs</title>
	<meta name="description" content={data.doc.description} />
</svelte:head>

<section class="border-b border-zig-100 bg-zig-50">
	<div class="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
		<a
			href="/docs"
			class="mb-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-500 transition-colors hover:text-zig-700"
		>
			<ChevronLeft class="h-3.5 w-3.5" />
			Back to docs
		</a>

		<div class="max-w-3xl">
			<p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
				{data.doc.eyebrow}
			</p>
			<h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
				{data.doc.title}
			</h1>
			<p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
				{data.doc.description}
			</p>
			<div class="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
				<span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Docs page</span>
				<span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">{data.doc.readTime}</span>
			</div>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
	<div class="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
		<aside class="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
			<p class="px-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
				Documentation
			</p>
			<nav class="mt-3 space-y-1 text-sm">
				{#each data.docs as item (item.slug)}
					<a
						href={`/docs/${item.slug}`}
						class="block rounded-md px-3 py-2 transition-colors {item.slug === data.doc.slug
							? 'bg-zig-100 font-medium text-zig-700'
							: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}"
					>
						{item.title}
					</a>
				{/each}
			</nav>
		</aside>

		<article
			class="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-6 sm:p-8 prose-headings:font-bold prose-a:text-zig-600 prose-a:no-underline hover:prose-a:underline"
		>
			<div class="not-prose mb-8 flex items-center gap-4 rounded-lg border border-zig-200 bg-zig-50 p-4">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zig-100 text-zig-700">
					<DocIcon class="h-4 w-4" />
				</div>
				<p class="text-sm leading-6 text-slate-600">{data.doc.description}</p>
			</div>
			{@html data.doc.html}
			{#if data.doc.command}
				<h2>Example command</h2>
				<pre><code>{data.doc.command}</code></pre>
			{/if}
		</article>
	</div>
</div>
