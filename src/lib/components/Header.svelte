<script lang="ts">
  import { page } from "$app/stores";
  import { Github } from "lucide-svelte";

  import Logo from "$lib/components/logo.svelte";
  import SearchBar from "$lib/components/search-bar.svelte";
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60"
>
  <div class="container mx-auto">
    <div class="flex flex-1 h-16 items-center justify-between">
      <!-- Logo & Nav -->
      <Logo />

      <!-- Search -->
      {#if $page.url.pathname !== "/"}
        <SearchBar />
      {/if}

      <!-- Right Side: Socials & Theme Toggle -->
      <div class="flex items-center gap-4">
        <nav class="border-r border-gray-200 pr-4">
          <ul>
            <li>
              <a
                href="/packages/"
                class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Packages
              </a>
            </li>
          </ul>
        </nav>
        <div
          class="hidden sm:flex items-center gap-3 border-r border-gray-200 pr-4"
        >
          <a
            href="https://github.com/zig-toolbelt/zigpkg"
            class="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span class="sr-only">GitHub</span>
            <Github class="w-5 h-5" />
          </a>
          <a
            href="https://x.com/i/communities/1830711127354851778"
            class="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span class="sr-only">X (Twitter)</span>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
              ><path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              /></svg
            >
          </a>
        </div>
      </div>
    </div>
  </div>
</header>
