<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatNumber } from "$lib/utils/formatNumber";
  import PackageCard from '$lib/components/package-card.svelte';
  import { Search } from 'lucide-svelte';
  import { siteUrl } from '$lib/seo';

  let { data } = $props();

  let searchQuery = $state('');

  function handleSearch(e: Event) {
    e.preventDefault();
    goto('/search?q=' + encodeURIComponent(searchQuery));
  }

  const sortTabs: { label: string; value: string }[] = [
    { label: 'Newest', value: 'new' },
    { label: 'Stars', value: 'stars' },
    { label: 'Name', value: 'name' }
  ];

  const homeJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "zigpkg",
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }).replace(/</g, "\\u003c");
</script>

<svelte:head>
  {@html '<script type="application/ld+json">' + homeJsonLd + '<\/script>'}
</svelte:head>

<!-- Hero (centered) -->
<section class="text-center pt-10 pb-12 sm:pt-16">
  <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-zig-600">
    Zig Packages
  </h1>
  <p class="mt-4 mx-auto max-w-xl text-lg text-slate-500">
    Discover Zig libraries, applications, and tools to enhance your next project.
  </p>

  <!-- Search with attached button -->
  <form onsubmit={handleSearch} class="mt-8 mx-auto flex max-w-3xl">
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search class="h-4 w-4 text-slate-400" />
      </div>
      <input
        bind:value={searchQuery}
        type="search"
        placeholder="Search {data.stats.totalPackages.toLocaleString()} packages..."
        class="block h-11 w-full rounded-l-sm border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-xs placeholder:italic placeholder:text-slate-400 focus:z-10 focus:outline-none focus:border-zig-400 focus:ring-1 focus:ring-zig-400 transition-colors"
      />
    </div>
    <button
      type="submit"
      class="shrink-0 rounded-r-sm border border-l-0 border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-zig-400 hover:text-zig-700"
    >
      Search
    </button>
  </form>

  <p class="mt-4 font-mono text-xs text-slate-400">
    {data.stats.totalPackages.toLocaleString()} packages · {formatNumber(data.stats.totalStars)} stars
  </p>
</section>

<!-- Sort pills -->
<div class="mb-4 flex items-center gap-1">
  {#each sortTabs as tab (tab.value)}
    <button
      onclick={() => goto('/?sort=' + tab.value)}
      class="h-6 rounded-sm px-1.5 font-mono text-xs transition-colors {data.sort === tab.value
        ? 'border border-zig-400/50 bg-zig-500/10 text-zig-700'
        : 'border border-transparent text-slate-500 hover:bg-slate-100'}"
    >
      {tab.label}
    </button>
  {/each}
</div>

<!-- Package grid -->
{#if data.packages.length === 0}
  <div class="py-20 text-center font-mono text-xs text-slate-400">
    No packages yet — the registry is still syncing.
  </div>
{:else}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each data.packages as pkg (pkg.fullName)}
      <PackageCard {...pkg} />
    {/each}
  </div>

  <div class="mt-10 text-center">
    <a
      href="/packages"
      class="font-mono text-xs font-medium text-zig-600 hover:text-zig-700 transition-colors"
    >
      Browse all packages →
    </a>
  </div>
{/if}
