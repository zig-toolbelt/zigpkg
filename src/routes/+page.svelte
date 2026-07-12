<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatNumber } from '$lib/utils/formatNumber';
  import PackageCard from '$lib/components/package-card.svelte';
  import PackageLine from '$lib/components/package-line.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
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

  const HERO_GROUND = 320;
  const heroHouses = [
    { x: 30, w: 110, wallH: 92, roofH: 40, wall: '#fff3e2', roof: '#d9500e', chimney: true },
    { x: 158, w: 92, wallH: 70, roofH: 32, wall: '#ffe8cf', roof: '#e0700f', chimney: false },
    { x: 268, w: 132, wallH: 112, roofH: 46, wall: '#fdf0dd', roof: '#c2410c', chimney: true },
    { x: 420, w: 100, wallH: 80, roofH: 36, wall: '#fff3e2', roof: '#ef8a1c', chimney: false },
    { x: 540, w: 124, wallH: 98, roofH: 42, wall: '#ffe8cf', roof: '#d9500e', chimney: true },
    { x: 684, w: 94, wallH: 72, roofH: 32, wall: '#fff3e2', roof: '#e0700f', chimney: false },
    { x: 798, w: 142, wallH: 116, roofH: 48, wall: '#fdf0dd', roof: '#c2410c', chimney: true },
    { x: 962, w: 100, wallH: 82, roofH: 36, wall: '#fff3e2', roof: '#ef8a1c', chimney: false },
    { x: 1086, w: 122, wallH: 100, roofH: 44, wall: '#ffe8cf', roof: '#d9500e', chimney: true },
    { x: 1232, w: 132, wallH: 88, roofH: 40, wall: '#fdf0dd', roof: '#e0700f', chimney: false }
  ];
  const heroHouseShapes = heroHouses.map((h) => ({
    ...h,
    top: HERO_GROUND - h.wallH,
    apex: HERO_GROUND - h.wallH - h.roofH
  }));

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

<section class="relative overflow-hidden border-b bg-amber-50 border-zig-100">
  <div class="relative mx-auto max-w-7xl px-6 pt-16 pb-52 sm:px-10 sm:pt-20 sm:pb-32">
    <div class="mx-auto max-w-3xl text-center">
      <div class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        Zig package discovery
      </div>
      {#if data.lastSyncedAtExact}
        <div class="mb-4 flex justify-center">
          <Badge variant="zig">synced: {data.lastSyncedAtExact}</Badge>
        </div>
      {/if}
      <h1 class="text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
        Find your next Zig package
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        Search curated Zig libraries from GitHub and Codeberg, compare activity, and find the right dependency faster.
      </p>

      <form
        onsubmit={handleSearch}
        class="mx-auto mt-8 flex max-w-2xl rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_rgb(15_23_42_/_0.10)]"
      >
        <div class="relative flex-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-4 w-4 text-slate-400" />
          </div>
          <input
            bind:value={searchQuery}
            type="search"
            name="q"
            aria-label="Search Zig packages"
            placeholder="Search by name, topic, or description..."
            class="h-14 w-full rounded-l-lg border-0 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:italic placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zig-400"
          />
        </div>
        <button
          type="submit"
          class="shrink-0 rounded-r-lg bg-zig-400 px-6 font-mono text-xs font-medium text-slate-900 transition-colors cursor-pointer hover:bg-zig-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zig-500 focus-visible:ring-offset-2"
        >
          Search
        </button>
      </form>

      <div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        {#if data.topics.length > 0}
          <span class="font-mono text-slate-400">Popular:</span>
          {#each data.topics as topic (topic)}
            <a
              href="/search?q={encodeURIComponent(topic)}"
              class="rounded-full border border-zig-200 bg-white/80 px-3 py-1 font-mono text-slate-600 backdrop-blur-sm transition-colors hover:border-zig-400 hover:bg-white hover:text-zig-700"
            >
              {topic}
            </a>
          {/each}
        {/if}
        <a
          href="/packages"
          class="rounded-full px-3 py-1 font-mono font-medium text-zig-600 transition-colors hover:text-zig-700"
        >
          Browse all →
        </a>
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 sm:px-10 py-10">
  <dl class="mb-8 grid grid-cols-2 gap-6 border-b border-slate-100 pb-8 lg:grid-cols-4">
    <div class="flex items-center gap-3.5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-zig-200 bg-zig-100 text-zig-700">
        <Package class="h-4 w-4" />
      </div>
      <div>
        <dt class="font-mono text-[11px] uppercase tracking-wide text-slate-400">
          Packages
        </dt>
        <dd class="mt-1 font-mono text-xl font-bold text-slate-900">
          {data.stats.totalPackages.toLocaleString()}
        </dd>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-zig-200 bg-zig-100 text-zig-700">
        <Star class="h-4 w-4" fill="currentColor" />
      </div>
      <div>
        <dt class="font-mono text-[11px] uppercase tracking-wide text-slate-400">
          Stars
        </dt>
        <dd class="mt-1 font-mono text-xl font-bold text-slate-900">
          {formatNumber(data.stats.totalStars)}
        </dd>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
        <Library class="h-4 w-4" />
      </div>
      <div>
        <dt class="font-mono text-[11px] uppercase tracking-wide text-slate-400">
          Libraries
        </dt>
        <dd class="mt-1 font-mono text-xl font-bold text-slate-900">
          {data.stats.totalLibraries.toLocaleString()}
        </dd>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
        <AppWindow class="h-4 w-4" />
      </div>
      <div>
        <dt class="font-mono text-[11px] uppercase tracking-wide text-slate-400">
          Applications
        </dt>
        <dd class="mt-1 font-mono text-xl font-bold text-slate-900">
          {data.stats.totalApplications.toLocaleString()}
        </dd>
      </div>
    </div>
  </dl>

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
          {#each section.items.slice(0, 6) as pkg (pkg.id)}
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
      {#each data.popular as pkg (pkg.id)}
        <PackageCard {...pkg} />
      {/each}
    </div>
  {/if}
</div>
