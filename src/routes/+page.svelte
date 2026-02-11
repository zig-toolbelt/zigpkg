<script lang="ts">
  import { formatNumber } from "$lib/utils/formatNumber";
  import { SvelteSet } from "svelte/reactivity";

  let { data } = $props();

  const allPackages = $derived.by(() => {
    const seen = new SvelteSet<string>();
    return [
      ...data.popularPackages,
      ...data.newPackages,
      ...data.recentlyUpdated,
    ].filter((pkg) => {
      if (seen.has(pkg.name)) return false;
      seen.add(pkg.name);
      return true;
    });
  });

  let copiedPkg = $state<string | null>(null);

  async function copyFetchCommand(
    owner: string,
    name: string,
    version: string,
  ) {
    const archivePath =
      version === "latest"
        ? "archive/HEAD.tar.gz"
        : `archive/refs/tags/${version}.tar.gz`;
    const url = `https://github.com/${owner}/${name}/${archivePath}`;
    const command = `zig fetch --save ${url}`;
    await navigator.clipboard.writeText(command);
    copiedPkg = `${owner}/${name}`;
    setTimeout(() => {
      copiedPkg = null;
    }, 2000);
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month ago";
    if (diffMonths < 12) return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return "1 year ago";
    return `${diffYears} years ago`;
  }
</script>

<div
  class="fixed inset-0 z-100 bg-[#fafafa] overflow-y-auto text-slate-900 font-sans selection:bg-yellow-200 selection:text-black scroll-smooth"
>
  <!-- Header -->
  <header
    class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-1 h-16 items-center justify-between">
        <!-- Logo & Nav -->
        <div class="flex items-center gap-8">
          <a href="/" class="flex items-center gap-2 group">
            <div
              class="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm group-hover:rotate-3 transition-transform"
            >
              ZIG
            </div>
            <span class="text-xl font-bold tracking-tight text-slate-900"
              >packages</span
            >
          </a>
        </div>

        <!-- Right Side: Socials & Theme Toggle -->
        <div class="flex items-center gap-4">
          <div
            class="hidden sm:flex items-center gap-3 border-r border-gray-200 pr-4"
          >
            <a
              href="https://github.com/zig-toolbelt"
              class="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span class="sr-only">GitHub</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                ><path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                /></svg
              >
            </a>
            <a
              href="#"
              class="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span class="sr-only">X (Twitter)</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
                ><path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                /></svg
              >
            </a>
          </div>

          <button
            class="text-slate-500 hover:text-amber-500 transition-colors"
            aria-label="Toggle Theme"
          >
            <!-- Sun Icon for Light Mode -->
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div
      class="relative overflow-hidden bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-12 shadow-sm"
    >
      <!-- Decor: Subtle Light Gradient -->
      <div
        class="absolute inset-0 bg-linear-to-br from-yellow-50/50 via-transparent to-transparent pointer-events-none"
      ></div>

      <div class="relative z-10 flex-1">
        <h1
          class="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
        >
          Packages
        </h1>
        <p class="text-xl text-slate-500 max-w-xl leading-relaxed">
          A gateway to our galaxy of Zig utilities, libraries, and tools created
          to empower developers.
        </p>
      </div>

      <div class="relative z-10 flex gap-12 sm:gap-16">
        <div class="text-center group">
          <div
            class="text-6xl sm:text-7xl font-bold text-slate-900 mb-2 group-hover:scale-105 transition-transform duration-300"
          >
            {data.stats.totalPackages}
          </div>
          <div
            class="text-sm text-slate-500 font-bold tracking-widest uppercase"
          >
            Packages
          </div>
        </div>
        <div
          class="text-center border-l-2 border-gray-100 pl-12 sm:pl-16 group"
        >
          <div
            class="text-6xl sm:text-7xl font-bold text-slate-900 mb-2 group-hover:scale-105 transition-transform duration-300"
          >
            {formatNumber(data.stats.totalStars)}
          </div>
          <div
            class="text-sm text-slate-500 font-bold tracking-widest uppercase"
          >
            Total Stars
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section (Search & Sort) -->
    <div
      class="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between"
    >
      <!-- Search -->
      <div class="relative w-full md:max-w-md group">
        <div
          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search a package..."
          class="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      <!-- Sorting Controls -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div
          class="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200"
        >
          <button
            class="px-4 py-1.5 text-sm font-semibold rounded-lg bg-white text-slate-900 shadow-sm border border-gray-100 ring-1 ring-black/5"
            >Stars</button
          >
          <button
            class="px-4 py-1.5 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            >Downloads</button
          >
          <button
            class="px-4 py-1.5 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            >Name</button
          >
        </div>

        <button
          class="p-2.5 bg-white border border-gray-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-gray-300 transition-colors shadow-sm"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Packages Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each allPackages as pkg (pkg.name)}
        <div
          class="group relative flex flex-col bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-400/50"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:bg-yellow-50 group-hover:border-yellow-100 transition-all duration-300"
              >
                📦
              </div>
              <h2
                class="text-lg font-bold text-slate-900 group-hover:text-yellow-600 transition-colors"
              >
                {pkg.name}
              </h2>
            </div>
            <div class="flex items-center gap-1.5">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-slate-500 border border-gray-200 group-hover:border-yellow-200 group-hover:bg-yellow-50 group-hover:text-yellow-700 transition-colors"
              >
                {pkg.version}
              </span>
              <button
                onclick={() =>
                  copyFetchCommand(pkg.owner, pkg.name, pkg.version)}
                class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
                title="Copy zig fetch command"
              >
                {#if copiedPkg === `${pkg.owner}/${pkg.name}`}
                  <svg
                    class="w-3.5 h-3.5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {:else}
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>

          <p class="text-sm text-slate-500 mb-6 grow leading-relaxed">
            {pkg.description}
          </p>

          <footer
            class="flex items-center gap-4 text-xs font-medium text-slate-400"
          >
            <!-- Stars -->
            <div
              class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {formatNumber(pkg.stars)}
            </div>
            <!-- Issues -->
            <div
              class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {pkg.openIssues}
            </div>
            <!-- Last commit -->
            <div
              class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(pkg.pushedAt)}
            </div>
          </footer>
        </div>
      {/each}
    </div>

    <!-- Community Section / Footer Extension -->
    <div class="mt-20 py-16 text-center">
      <h3 class="text-slate-900 font-bold mb-4 text-2xl">Join the Community</h3>
      <p class="text-slate-500 mb-8 max-w-lg mx-auto text-lg">
        Contribute to our packages, report issues, and help us grow the Zig
        ecosystem together.
      </p>
      <div class="flex justify-center gap-4">
        <a
          href="https://github.com/zig-toolbelt"
          class="inline-flex items-center px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20"
        >
          GitHub
        </a>
        <a
          href="/docs"
          class="inline-flex items-center px-8 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          Documentation
        </a>
      </div>
    </div>
  </main>

  <!-- Detailed Footer -->
  <footer class="border-t border-gray-200 bg-white pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <!-- Column 1 -->
        <div>
          <h4 class="font-bold text-slate-900 mb-4">Community</h4>
          <ul class="space-y-3 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Discord</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Twitter</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >GitHub</a
              >
            </li>
          </ul>
        </div>
        <!-- Column 2 -->
        <div>
          <h4 class="font-bold text-slate-900 mb-4">Resources</h4>
          <ul class="space-y-3 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Documentation</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Blog</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Design Kit</a
              >
            </li>
          </ul>
        </div>
        <!-- Column 3 -->
        <div>
          <h4 class="font-bold text-slate-900 mb-4">Ecosystem</h4>
          <ul class="space-y-3 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Packages</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Release Notes</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Jobs</a
              >
            </li>
          </ul>
        </div>
        <!-- Column 4 -->
        <div>
          <h4 class="font-bold text-slate-900 mb-4">Legal</h4>
          <ul class="space-y-3 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Privacy Policy</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Terms of Service</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-yellow-600 transition-colors"
                >Cookie Policy</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400"
      >
        <p>© 2026 ZigPkg. All rights reserved.</p>
        <div class="flex items-center gap-2 mt-4 md:mt-0">
          <span>Made with</span>
          <svg class="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24"
            ><path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            /></svg
          >
          <span>for zig community</span>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Ensure the overlay works well with global styles */
  :global(body) {
    overflow: hidden; /* Prevent body scroll, let overlay handle it */
  }
</style>
