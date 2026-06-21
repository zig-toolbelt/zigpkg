<script lang="ts">
  import { page } from "$app/stores";

  import Logo from "$lib/components/logo.svelte";
  import SearchBar from "$lib/components/search-bar.svelte";
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md supports-backdrop-filter:bg-white/70"
>
  <div class="mx-auto max-w-7xl px-6 sm:px-10">
    <div class="flex h-14 items-center justify-between gap-6">
      <!-- Logo -->
      <Logo />

      <!-- Search (hidden on home) -->
      {#if $page.url.pathname !== "/"}
        <div class="flex-1 max-w-sm">
          <SearchBar />
        </div>
      {/if}

      <!-- Right: nav + socials -->
      <div class="flex items-center gap-5 shrink-0">
        <a
          href="/packages/"
          class="font-mono text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Packages
        </a>
        <a
          href="https://github.com/zig-toolbelt/zigpkg"
          class="text-slate-400 hover:text-slate-900 transition-colors"
        >
          <span class="sr-only">GitHub</span>
          <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a
          href="https://x.com/i/communities/1830711127354851778"
          class="hidden sm:inline-flex text-slate-400 hover:text-slate-900 transition-colors"
        >
          <span class="sr-only">X (Twitter)</span>
          <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>
  </div>
</header>
