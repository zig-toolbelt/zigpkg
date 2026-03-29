<script lang="ts">
  import { goto } from "$app/navigation";
  import { Search } from "lucide-svelte";

  let query = $state("");

  function handleSearch(e: Event) {
    e.preventDefault();
    goto("/search?q=" + encodeURIComponent(query));
  }
</script>

<form onsubmit={handleSearch} class="flex items-center flex-1 max-w-sm">
  <div class="relative flex-1">
    <input
      bind:value={query}
      type="search"
      placeholder="Search packages..."
      class="block w-full pl-9 pr-3 py-2 h-10 border border-gray-200 rounded-l-xl bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
    />
  </div>
  <button
    type="submit"
    class="px-4 h-10 rounded-r-xl bg-yellow-400 text-slate-900 text-sm font-semibold hover:bg-yellow-500 transition-colors shrink-0 border border-l-0 border-amber-400 cursor-pointer"
  >
    <Search class="h-4 w-4 text-slate-900" />
  </button>
</form>
