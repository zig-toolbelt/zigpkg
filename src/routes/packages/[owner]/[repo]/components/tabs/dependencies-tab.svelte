<script lang="ts">
  let {
    dependencies,
  }: {
    dependencies: {
      name: string;
      url?: string | null;
      path?: string | null;
      hash?: string | null;
    }[];
  } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-6">
  <h2 class="text-lg font-bold text-slate-900 mb-4">
    Dependencies <span class="text-sm font-normal text-slate-400"
      >({dependencies.length})</span
    >
  </h2>
  {#if dependencies.length > 0}
    <div class="space-y-3">
      {#each dependencies as dep (dep.name)}
        <div
          class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
        >
          <div>
            <span class="font-semibold text-slate-900">{dep.name}</span>
            {#if dep.url}
              <p class="text-sm text-slate-400 mt-0.5 truncate max-w-md">
                {dep.url}
              </p>
            {:else if dep.path}
              <p class="text-sm text-slate-400 mt-0.5">Local: {dep.path}</p>
            {/if}
          </div>
          {#if dep.hash}
            <span
              class="text-xs font-mono text-slate-400 shrink-0 ml-4"
              title={dep.hash}
            >
              {dep.hash.slice(0, 12)}...
            </span>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-slate-400 text-center py-8">No dependencies found.</p>
  {/if}
</div>
