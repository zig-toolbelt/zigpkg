<script lang="ts">
  import { goto } from '$app/navigation';
  import { Search, Github, Sun } from 'lucide-svelte';

  let query = $state('');

  function handleSearch(e: Event) {
    e.preventDefault();
    goto('/search?q=' + encodeURIComponent(query));
  }
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60"
>
  <div class="container mx-auto">
    <div class="flex flex-1 h-16 items-center justify-between">
      <!-- Logo & Nav -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm group-hover:rotate-3 transition-transform">
            ZIG
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900">packages</span>
        </a>
        <a href="/packages/" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          Packages
        </a>
      </div>

      <!-- Search -->
      <form onsubmit={handleSearch} class="flex items-center flex-1 max-w-sm">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-slate-400" />
          </div>
          <input
            bind:value={query}
            type="search"
            placeholder="Search packages..."
            class="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-l-xl bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          class="px-4 py-2 rounded-r-xl bg-yellow-400 text-slate-900 text-sm font-semibold hover:bg-yellow-500 transition-colors shrink-0 border border-l-0 border-amber-400 cursor-pointer"
        >
          Search
        </button>
      </form>

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
            <Github class="w-5 h-5" />
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
          <Sun class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</header>
