<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatNumber } from '$lib/utils/formatNumber';
  import PackageCard from '$lib/components/package-card.svelte';
  import PackageLine from '$lib/components/package-line.svelte';
  import { Search, Package, Star, Library, AppWindow } from 'lucide-svelte';
  import { siteUrl } from '$lib/seo';

  let { data } = $props();

  let searchQuery = $state('');

  function handleSearch(e: Event) {
    e.preventDefault();
    goto('/search?q=' + encodeURIComponent(searchQuery));
  }

  const sections = $derived([
    { title: 'Newest', items: data.newest },
    { title: 'Most starred', items: data.popular },
    { title: 'Recently updated', items: data.updated }
  ]);

  const homeJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'zigpkg',
    url: siteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl()}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }).replace(/</g, '\\u003c');
</script>

<svelte:head>
  {@html '<script type="application/ld+json">' + homeJsonLd + '<\/script>'}
</svelte:head>

<div class="mx-auto max-w-7xl px-6 sm:px-10 py-10">
  <section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
      <div>
        <div class="mb-3 font-mono text-[11px] uppercase tracking-wide text-zig-700">
          Zig package discovery
        </div>
        <h1 class="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
          Find your next Zig package
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          Discover libraries, applications and tools across the Zig ecosystem.
        </p>

        <form
          onsubmit={handleSearch}
          class="mt-7 flex max-w-2xl rounded-lg border border-slate-200 bg-white"
        >
          <div class="relative flex-1">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search class="h-4 w-4 text-slate-400" />
            </div>
            <input
              bind:value={searchQuery}
              type="search"
              placeholder="Search {data.stats.totalPackages.toLocaleString()} packages..."
              class="h-11 w-full rounded-l-lg border-0 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:italic placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
            />
          </div>
          <button
            type="submit"
            class="shrink-0 rounded-r-lg border-l border-slate-200 bg-slate-950 px-5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            Search
          </button>
        </form>
      </div>

      <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
        <div class="bg-white p-4">
          <dt class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            <Package class="h-3.5 w-3.5 text-zig-500" />
            Packages
          </dt>
          <dd class="mt-2 font-mono text-xl font-bold text-slate-900">
            {data.stats.totalPackages.toLocaleString()}
          </dd>
        </div>
        <div class="bg-white p-4">
          <dt class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            <Star class="h-3.5 w-3.5 text-zig-500" fill="currentColor" />
            Stars
          </dt>
          <dd class="mt-2 font-mono text-xl font-bold text-slate-900">
            {formatNumber(data.stats.totalStars)}
          </dd>
        </div>
        <div class="bg-white p-4">
          <dt class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            <Library class="h-3.5 w-3.5 text-indigo-600" />
            Libraries
          </dt>
          <dd class="mt-2 font-mono text-xl font-bold text-slate-900">
            {data.stats.totalLibraries.toLocaleString()}
          </dd>
        </div>
        <div class="bg-white p-4">
          <dt class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            <AppWindow class="h-3.5 w-3.5 text-indigo-600" />
            Applications
          </dt>
          <dd class="mt-2 font-mono text-xl font-bold text-slate-900">
            {data.stats.totalApplications.toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  </section>

  {#if data.popular.length === 0}
    <div class="py-20 text-center">
      <p class="text-sm font-medium text-slate-600">No packages yet</p>
      <p class="mt-1 font-mono text-xs text-slate-400">The registry is still syncing — check back soon.</p>
    </div>
  {:else}
    <!-- Three curated sections -->
    <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      {#each sections as section (section.title)}
        <div>
          <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{section.title}</h3>
          {#each section.items.slice(0, 6) as pkg (pkg.fullName)}
            <PackageLine {...pkg} />
          {/each}
        </div>
      {/each}
    </div>

    <!-- Popular packages grid (rich cards) -->
    <div class="mt-12 mb-4 flex items-baseline justify-between">
      <h2 class="text-xl font-bold tracking-tight text-slate-900">Popular packages</h2>
      <a href="/packages" class="font-mono text-xs font-medium text-zig-600 hover:text-zig-700">
        Browse all packages →
      </a>
    </div>
    <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each data.popular as pkg (pkg.fullName)}
        <PackageCard {...pkg} />
      {/each}
    </div>
  {/if}
</div>
