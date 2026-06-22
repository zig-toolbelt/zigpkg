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

<section class="relative overflow-hidden border-b border-zig-100 bg-white">
  <!-- Warm landscape illustration anchored to the bottom -->
  <div
    class="pointer-events-none absolute inset-x-0 bottom-0 h-56 sm:h-72"
    aria-hidden="true"
  >
    <svg
      class="h-full w-full"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="heroSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd591" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#ffd591" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f08c1e" />
          <stop offset="100%" stop-color="#e0700f" />
        </linearGradient>
      </defs>

      <circle cx="720" cy="120" r="130" fill="url(#heroSun)" />

      <path
        d="M0,206 C 320,168 560,196 760,190 C 1000,182 1240,160 1440,196 L1440,320 L0,320 Z"
        fill="#fde4c4"
      />
      <path
        d="M0,236 C 280,206 600,240 880,228 C 1120,218 1320,210 1440,232 L1440,320 L0,320 Z"
        fill="#fbcd96"
      />
      <path
        d="M0,266 C 360,238 720,272 1040,262 C 1240,256 1360,250 1440,264 L1440,320 L0,320 Z"
        fill="#f7a41d"
      />
      <path
        d="M0,292 C 420,272 820,296 1160,286 C 1300,282 1380,280 1440,288 L1440,320 L0,320 Z"
        fill="url(#hillFront)"
      />

      <g>
        <path d="M150,262 L150,196" stroke="#7a4a25" stroke-width="6" stroke-linecap="round" />
        <circle cx="150" cy="176" r="34" fill="#e0700f" />
        <circle cx="126" cy="194" r="24" fill="#ef8a1c" />
        <circle cx="174" cy="192" r="26" fill="#f59324" />
      </g>
      <g>
        <path d="M1296,264 L1296,198" stroke="#7a4a25" stroke-width="6" stroke-linecap="round" />
        <circle cx="1296" cy="178" r="36" fill="#e0700f" />
        <circle cx="1272" cy="196" r="24" fill="#ef8a1c" />
        <circle cx="1322" cy="194" r="26" fill="#f59324" />
      </g>
      <g>
        <path d="M1086,272 L1086,234" stroke="#7a4a25" stroke-width="5" stroke-linecap="round" />
        <circle cx="1086" cy="222" r="22" fill="#ef8a1c" />
      </g>

      <g>
        <path d="M70,316 L70,284" stroke="#7a4a25" stroke-width="3" />
        <circle cx="70" cy="278" r="9" fill="#e0301a" />
        <circle cx="60" cy="282" r="7" fill="#cc2a16" />
        <circle cx="80" cy="282" r="7" fill="#cc2a16" />
        <circle cx="70" cy="278" r="3" fill="#5b1a10" />
      </g>
      <g>
        <path d="M1380,318 L1380,286" stroke="#7a4a25" stroke-width="3" />
        <circle cx="1380" cy="280" r="9" fill="#e0301a" />
        <circle cx="1370" cy="284" r="7" fill="#cc2a16" />
        <circle cx="1390" cy="284" r="7" fill="#cc2a16" />
        <circle cx="1380" cy="280" r="3" fill="#5b1a10" />
      </g>
    </svg>
  </div>

  <div class="relative mx-auto max-w-7xl px-6 pt-16 pb-44 sm:px-10 sm:pt-20 sm:pb-56">
    <div class="mx-auto max-w-3xl text-center">
      <div class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        Zig package discovery
      </div>
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
          class="shrink-0 rounded-r-lg bg-zig-400 px-6 font-mono text-xs font-medium text-slate-900 transition-colors hover:bg-zig-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zig-500 focus-visible:ring-offset-2"
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
