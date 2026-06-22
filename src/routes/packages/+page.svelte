<script lang="ts">
  import { goto } from "$app/navigation";
  import PackageCard from "$lib/components/package-card.svelte";

  let { data } = $props();

  const totalPages = $derived(Math.ceil(data.totalCount / 30));

  const visiblePages = $derived.by(() => {
    const pages: (number | "...")[] = [];
    const total = totalPages;
    const current = data.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }

    return pages;
  });

  type NavParams = {
    page?: number;
    sort?: string;
    letter?: string | null;
    type?: string | null;
    topic?: string | null;
  };

  function buildUrl(params: NavParams) {
    const p = new URLSearchParams();
    const page = params.page ?? data.page;
    const sort = params.sort ?? data.sort;
    const letter = "letter" in params ? params.letter : data.letter;
    const type = "type" in params ? params.type : data.type;
    const topic = "topic" in params ? params.topic : data.topic;

    if (page > 1) p.set("page", String(page));
    if (sort !== "stars") p.set("sort", sort);
    if (letter) p.set("letter", letter);
    if (type) p.set("type", type);
    if (topic) p.set("topic", topic);

    const qs = p.toString();
    return `/packages${qs ? "?" + qs : ""}`;
  }

  function navigate(params: NavParams) {
    goto(buildUrl(params));
  }

  const typeTabs: { label: string; value: string | null }[] = [
    { label: "All", value: null },
    { label: "Libraries", value: "library" },
    { label: "Applications", value: "application" },
  ];

  const sortOptions: { label: string; value: string }[] = [
    { label: "Stars", value: "stars" },
    { label: "Name", value: "name" },
    { label: "Newest", value: "new" },
    { label: "Updated", value: "updated" },
  ];

  const activeTypeLabel = $derived(
    typeTabs.find((tab) => tab.value === data.type)?.label ?? null,
  );
  const hasActiveFilters = $derived(
    Boolean(data.type || data.topic || data.letter),
  );
  const resultNoun = $derived(data.totalCount === 1 ? "result" : "results");
</script>

<div class="mx-auto max-w-7xl px-6 sm:px-10 py-10">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
      Packages
    </h1>
    <div
      class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"
      aria-live="polite"
    >
      <span class="text-slate-500">
        {data.totalCount.toLocaleString()}
        {hasActiveFilters
          ? resultNoun
          : "package" + (data.totalCount === 1 ? "" : "s")}
      </span>
      {#if hasActiveFilters}
        <span class="text-slate-300">·</span>
        {#if activeTypeLabel}
          <button
            onclick={() => navigate({ type: null, page: 1 })}
            aria-label="Remove filter: {activeTypeLabel}"
            class="inline-flex items-center gap-1 rounded-sm border border-zig-400/50 bg-zig-500/10 px-1.5 py-0.5 text-zig-700 transition-colors hover:bg-zig-500/20"
          >
            {activeTypeLabel}
            <span aria-hidden="true">×</span>
          </button>
        {/if}
        {#if data.topic}
          <button
            onclick={() => navigate({ topic: null, page: 1 })}
            aria-label="Remove topic filter: {data.topic}"
            class="inline-flex items-center gap-1 rounded-sm border border-zig-400/50 bg-zig-500/10 px-1.5 py-0.5 text-zig-700 transition-colors hover:bg-zig-500/20"
          >
            {data.topic}
            <span aria-hidden="true">×</span>
          </button>
        {/if}
        {#if data.letter}
          <button
            onclick={() => navigate({ letter: null, page: 1 })}
            aria-label="Remove letter filter: {data.letter}"
            class="inline-flex items-center gap-1 rounded-sm border border-zig-400/50 bg-zig-500/10 px-1.5 py-0.5 text-zig-700 transition-colors hover:bg-zig-500/20"
          >
            {data.letter}
            <span aria-hidden="true">×</span>
          </button>
        {/if}
        <a
          href={buildUrl({ type: null, topic: null, letter: null, page: 1 })}
          class="text-slate-400 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          Clear all
        </a>
      {/if}
    </div>
  </div>

  <!-- Type + sort pills -->
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-1" role="group" aria-label="Filter by type">
      <span class="mr-1 font-mono text-[11px] text-slate-400">type</span>
      {#each typeTabs as tab (tab.label)}
        <button
          onclick={() => navigate({ type: tab.value, page: 1 })}
          aria-pressed={data.type === tab.value}
          class="h-7 rounded-sm px-2 font-mono text-xs transition-colors {data.type ===
          tab.value
            ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
            : 'border border-transparent text-slate-500 hover:bg-slate-100'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <div class="flex items-center gap-1" role="group" aria-label="Sort packages">
      <span class="mr-1 font-mono text-[11px] text-slate-400">sort</span>
      {#each sortOptions as option (option.value)}
        <button
          onclick={() => navigate({ sort: option.value, page: 1 })}
          aria-pressed={data.sort === option.value}
          class="h-7 rounded-sm px-2 font-mono text-xs transition-colors {data.sort ===
          option.value
            ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
            : 'border border-transparent text-slate-500 hover:bg-slate-100'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Topic filter -->
  {#if data.topics.length > 0}
    <div
      class="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-4"
      role="group"
      aria-label="Filter by topic"
    >
      <span class="mr-1 font-mono text-[11px] text-slate-400">topics</span>
      {#each data.topics as topic (topic)}
        <button
          onclick={() =>
            navigate({ topic: data.topic === topic ? null : topic, page: 1 })}
          aria-pressed={data.topic === topic}
          class="h-7 rounded-full px-3 font-mono text-xs transition-colors {data.topic ===
          topic
            ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
            : 'border border-slate-200 text-slate-500 hover:border-zig-400 hover:text-zig-700'}"
        >
          {topic}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Package grid -->
  {#if data.packages.length === 0}
    <div class="py-20 text-center font-mono text-xs text-slate-400">
      No packages found.
    </div>
  {:else}
    <div
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {#each data.packages as pkg (pkg.id)}
        <PackageCard {...pkg} />
      {/each}
    </div>
  {/if}

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="mt-8 flex items-center justify-center gap-1 font-mono text-xs">
      <button
        onclick={() => navigate({ page: data.page - 1 })}
        disabled={data.page <= 1}
        aria-label="Previous page"
        class="h-7 rounded-sm px-2.5 text-slate-500 transition-colors hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ←
      </button>

      {#each visiblePages as pg, i (i)}
        {#if pg === "..."}
          <span class="px-1.5 text-slate-300">…</span>
        {:else}
          <button
            onclick={() => navigate({ page: pg as number })}
            aria-label="Page {pg}"
            aria-current={data.page === pg ? "page" : undefined}
            class="h-7 rounded-sm px-2.5 transition-colors {data.page === pg
              ? 'border border-zig-400/50 bg-zig-500/10 font-semibold text-zig-700'
              : 'text-slate-500 hover:bg-slate-100'}"
          >
            {pg}
          </button>
        {/if}
      {/each}

      <button
        onclick={() => navigate({ page: data.page + 1 })}
        disabled={data.page >= totalPages}
        aria-label="Next page"
        class="h-7 rounded-sm px-2.5 text-slate-500 transition-colors hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        →
      </button>
    </div>
  {/if}
</div>
