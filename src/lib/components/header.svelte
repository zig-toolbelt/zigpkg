<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { Search, X } from "lucide-svelte";

  import Logo from "$lib/components/logo.svelte";
  import SearchBar from "$lib/components/search-bar.svelte";
  import Badge from "$lib/components/ui/badge.svelte";

  let { lastSyncedAt = null }: { lastSyncedAt: string | null } = $props();

  let mobileSearchOpen = $state(false);
  let scrolled = $state(false);

  const navItems = [
    { label: "Browse", href: "/packages", match: "/packages" },
    { label: "Docs", href: "/docs", match: "/docs" },
    { label: "Blog", href: "/blog", match: "/blog" },
  ];

  onMount(() => {
    const updateScrolled = () => {
      scrolled = window.scrollY > 4;
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  });
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md transition-shadow supports-backdrop-filter:bg-white/75 {scrolled
    ? 'shadow-sm shadow-slate-900/5'
    : ''}"
>
  <div class="mx-auto max-w-7xl px-6 sm:px-10">
    <div class="flex h-14 items-center justify-between gap-4 sm:gap-6">
      <!-- Logo -->
      <Logo />

      <!-- Search (hidden on home) -->
      {#if page.url.pathname !== "/"}
        <div class="hidden flex-1 max-w-md md:block">
          <SearchBar />
        </div>
      {/if}

      <!-- Right: nav + socials -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div class="hidden items-center gap-1.5 lg:flex">
          <Badge variant="zig">v{APP_VERSION}</Badge>
          {#if lastSyncedAt}
            <Badge variant="zig">synced: {lastSyncedAt}</Badge>
          {/if}
        </div>
        <div class="hidden h-4 w-px bg-slate-200 lg:block"></div>

        <nav class="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
          {#each navItems as item (item.href)}
            <a
              href={item.href}
              class="rounded-md px-3 py-2 font-mono text-xs font-medium transition-colors {page.url.pathname.startsWith(
                item.match,
              )
                ? 'bg-zig-50 text-zig-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
            >
              {item.label}
            </a>
          {/each}
        </nav>

        {#if page.url.pathname !== "/"}
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={mobileSearchOpen}
            onclick={() => (mobileSearchOpen = !mobileSearchOpen)}
          >
            {#if mobileSearchOpen}
              <X class="h-[18px] w-[18px]" />
            {:else}
              <Search class="h-[18px] w-[18px]" />
            {/if}
          </button>
        {/if}

        <a
          href="https://github.com/zig-toolbelt/zigpkg"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span class="sr-only">GitHub</span>
          <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a
          href="https://x.com/i/communities/1830711127354851778"
          class="hidden h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span class="sr-only">X (Twitter)</span>
          <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>

    {#if page.url.pathname !== "/" && mobileSearchOpen}
      <div class="border-t border-slate-100 py-3 md:hidden">
        <SearchBar />
      </div>
    {/if}
  </div>
</header>
