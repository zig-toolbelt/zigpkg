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

<!-- Gradient hero -->
<section class="relative overflow-hidden bg-gradient-to-br from-zig-400 via-orange-600 to-fuchsia-700">
  <div class="pointer-events-none absolute -left-20 -top-40 h-[420px] w-[420px] rounded-full bg-white/10"></div>
  <div class="pointer-events-none absolute -bottom-28 right-[8%] h-64 w-64 rounded-full bg-white/[0.08]"></div>
  <div class="pointer-events-none absolute -top-10 left-[35%] h-80 w-0.5 rotate-[35deg] bg-white/15"></div>
  <div class="pointer-events-none absolute top-6 left-[64%] h-80 w-0.5 rotate-[35deg] bg-white/15"></div>

  <div class="relative mx-auto max-w-7xl px-6 sm:px-10 py-16 text-center sm:py-20">
    <h1 class="text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-6xl">
      Find your next<br />Zig package
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-white/90">
      Discover libraries, applications and tools across the Zig ecosystem.
    </p>

    <form onsubmit={handleSearch} class="mx-auto mt-8 flex max-w-2xl rounded-xl shadow-xl">
      <div class="relative flex-1">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search class="h-5 w-5 text-slate-400" />
        </div>
        <input
          bind:value={searchQuery}
          type="search"
          placeholder="Search {data.stats.totalPackages.toLocaleString()} packages..."
          class="h-14 w-full rounded-l-xl border-0 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zig-300"
        />
      </div>
      <button
        type="submit"
        class="shrink-0 rounded-r-xl bg-slate-900 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-black"
      >
        Search
      </button>
    </form>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 sm:px-10 py-10">
  <!-- Stat counters -->
  <div class="grid grid-cols-2 gap-6 border-b border-slate-100 pb-8 lg:grid-cols-4">
    <div class="flex items-center gap-3.5">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-zig-400 text-white">
        <Package class="h-5 w-5" />
      </div>
      <div>
        <div class="text-2xl font-extrabold tracking-tight">{data.stats.totalPackages.toLocaleString()}</div>
        <div class="text-[13px] text-slate-500">Packages</div>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-zig-400 text-white">
        <Star class="h-5 w-5" fill="currentColor" />
      </div>
      <div>
        <div class="text-2xl font-extrabold tracking-tight">{formatNumber(data.stats.totalStars)}</div>
        <div class="text-[13px] text-slate-500">Total stars</div>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <Library class="h-5 w-5" />
      </div>
      <div>
        <div class="text-2xl font-extrabold tracking-tight">{data.stats.totalLibraries.toLocaleString()}</div>
        <div class="text-[13px] text-slate-500">Libraries</div>
      </div>
    </div>
    <div class="flex items-center gap-3.5">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <AppWindow class="h-5 w-5" />
      </div>
      <div>
        <div class="text-2xl font-extrabold tracking-tight">{data.stats.totalApplications.toLocaleString()}</div>
        <div class="text-[13px] text-slate-500">Applications</div>
      </div>
    </div>
  </div>

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
