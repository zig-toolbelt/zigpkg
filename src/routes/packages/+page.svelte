<script lang="ts">
  import { goto } from "$app/navigation";
  import PackageCard from "$lib/components/package-card.svelte";

  let { data } = $props();

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

  function buildUrl(params: {
    page?: number;
    sort?: string;
    letter?: string | null;
    type?: string | null;
  }) {
    const p = new URLSearchParams();
    const page = params.page ?? data.page;
    const sort = params.sort ?? data.sort;
    const letter = "letter" in params ? params.letter : data.letter;
    const type = "type" in params ? params.type : data.type;

    if (page > 1) p.set("page", String(page));
    if (sort !== "stars") p.set("sort", sort);
    if (letter) p.set("letter", letter);
    if (type) p.set("type", type);

    const qs = p.toString();
    return `/packages${qs ? "?" + qs : ""}`;
  }

  function navigate(params: {
    page?: number;
    sort?: string;
    letter?: string | null;
    type?: string | null;
  }) {
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
</script>

<div class="mx-auto max-w-7xl px-6 sm:px-10 py-10">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
      Packages
    </h1>
    <p class="mt-1 font-mono text-xs text-slate-400">
      {data.totalCount.toLocaleString()} package{data.totalCount !== 1
        ? "s"
        : ""}
    </p>
  </div>

  <!-- Type + sort pills -->
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-1">
      {#each typeTabs as tab (tab.label)}
        <button
          onclick={() => navigate({ type: tab.value, page: 1 })}
          class="h-6 rounded-sm px-1.5 font-mono text-xs transition-colors {data.type ===
          tab.value
            ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
            : 'border border-transparent text-slate-500 hover:bg-slate-100'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <div class="flex items-center gap-1">
      <span class="mr-1 font-mono text-[11px] text-slate-400">sort</span>
      {#each sortOptions as option (option.value)}
        <button
          onclick={() => navigate({ sort: option.value, page: 1 })}
          class="h-6 rounded-sm px-1.5 font-mono text-xs transition-colors {data.sort ===
          option.value
            ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
            : 'border border-transparent text-slate-500 hover:bg-slate-100'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Letter filter -->
  <div class="mb-4 flex flex-wrap gap-1 border-b border-slate-200 pb-4">
    <button
      onclick={() => navigate({ letter: null, page: 1 })}
      class="h-5 rounded-sm px-1 font-mono text-[11px] transition-colors {!data.letter
        ? 'font-semibold text-zig-700'
        : 'text-slate-400 hover:text-slate-900'}"
    >
      All
    </button>
    {#each LETTERS as letter (letter)}
      <button
        onclick={() => navigate({ letter, page: 1 })}
        class="h-5 rounded-sm px-1 font-mono text-[11px] transition-colors {data.letter ===
        letter
          ? 'font-semibold text-zig-700'
          : 'text-slate-400 hover:text-slate-900'}"
      >
        {letter}
      </button>
    {/each}
  </div>

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
        class="h-7 rounded-sm px-2.5 text-slate-500 transition-colors hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ←
      </button>

      {#each visiblePages as pg (pg)}
        {#if pg === "..."}
          <span class="px-1.5 text-slate-300">…</span>
        {:else}
          <button
            onclick={() => navigate({ page: pg as number })}
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
        class="h-7 rounded-sm px-2.5 text-slate-500 transition-colors hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        →
      </button>
    </div>
  {/if}
</div>
