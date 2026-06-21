<script lang="ts">
  import { goto } from "$app/navigation";
  import { Search } from "lucide-svelte";

  let query = $state("");

  function handleSearch(e: Event) {
    e.preventDefault();
    goto("/search?q=" + encodeURIComponent(query));
  }
</script>

<form onsubmit={handleSearch} class="relative w-full">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Search class="h-4 w-4 text-slate-400" />
  </div>
  <input
    bind:value={query}
    type="search"
    placeholder="Search packages..."
    class="block w-full h-9 pl-9 pr-3 rounded-sm border border-slate-300 bg-white text-sm text-slate-900 shadow-xs placeholder:italic placeholder:text-slate-400 focus:outline-none focus:border-zig-400 focus:ring-1 focus:ring-zig-400 transition-colors"
  />
</form>
