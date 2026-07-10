<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { CircleAlert, Search, Star, X } from "lucide-svelte";
  import { signIn, signOut } from "@auth/sveltekit/client";

  import Logo from "$lib/components/logo.svelte";
  import SearchBar from "$lib/components/search-bar.svelte";

  type HeaderUser = {
    username: string | undefined;
    avatarUrl: string | null | undefined;
  } | null;

  let {
    lastSyncedAt = null,
    lastSyncedAtExact = null,
    syncOverdue = false,
    user = null,
    githubStars = null,
  }: {
    lastSyncedAt: string | null;
    lastSyncedAtExact?: string | null;
    syncOverdue?: boolean;
    user?: HeaderUser;
    githubStars?: number | null;
  } = $props();

  const starCountFormatter = new Intl.NumberFormat("en", { notation: "compact" });

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

      <!-- Right: status + nav + actions -->
      <div class="flex items-center gap-2.5 shrink-0">
        {#if lastSyncedAt}
          <div
            class="hidden items-center gap-1.5 font-mono text-[11px] lg:flex {syncOverdue
              ? 'text-amber-700'
              : 'text-slate-500'}"
            title={lastSyncedAtExact ? `Last synced ${lastSyncedAtExact}` : undefined}
          >
            {#if syncOverdue}
              <CircleAlert class="h-3 w-3 shrink-0" />
            {:else}
              <span class="h-1.5 w-1.5 rounded-full bg-zig-400"></span>
            {/if}
            {lastSyncedAt}
          </div>
          <div class="hidden h-4 w-px bg-slate-200 lg:block"></div>
        {/if}

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
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 py-1.5 pl-2.5 pr-2.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z"/></svg>
          <span class="sr-only">GitHub</span>
          {#if githubStars !== null}
            <span class="inline-flex items-center gap-1">
              <Star class="h-3 w-3 shrink-0 fill-zig-400 text-zig-400" />
              {starCountFormatter.format(githubStars)}
            </span>
          {/if}
        </a>

        {#if user}
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md py-1 pl-1 pr-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onclick={() => signOut()}
            title="Sign out ({user.username ?? 'account'})"
          >
            {#if user.avatarUrl}
              <img src={user.avatarUrl} alt={user.username ?? "Account"} class="h-6 w-6 rounded-full" />
            {/if}
            <span class="hidden font-mono text-xs font-medium sm:inline">{user.username ?? "Account"}</span>
          </button>
        {:else}
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
            onclick={() => signIn("github")}
          >
            Sign in
          </button>
        {/if}
      </div>
    </div>

    {#if page.url.pathname !== "/" && mobileSearchOpen}
      <div class="border-t border-slate-100 py-3 md:hidden">
        <SearchBar />
      </div>
    {/if}
  </div>
</header>
