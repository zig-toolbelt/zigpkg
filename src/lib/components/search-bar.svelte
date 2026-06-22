<script lang="ts">
  import { goto } from "$app/navigation";
  import { Search } from "lucide-svelte";

  let query = $state("");

  function handleSearch(e: Event) {
    e.preventDefault();
    goto("/search?q=" + encodeURIComponent(query));
  }
</script>

<form onsubmit={handleSearch} class="group relative w-full">
  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    <Search class="h-4 w-4 text-slate-400" />
  </div>
  <input
    bind:value={query}
    type="search"
    placeholder="Search packages..."
    class="block h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:italic placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-zig-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zig-200"
  />
</form>
