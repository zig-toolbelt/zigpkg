<script lang="ts">
  let { tags }: { tags: { name: string; sha: string }[] } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-6 space-y-3">
  <h2 class="text-lg font-bold text-slate-900 mb-4">Version History</h2>
  {#if tags.length > 0}
    {#each tags as tag, i (tag.name)}
      <div
        class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors {i ===
        0
          ? 'bg-yellow-50/50 border border-yellow-100'
          : ''}"
      >
        <div class="flex items-center gap-3">
          <span class="font-mono font-semibold text-slate-900">{tag.name}</span>
          {#if i === 0}
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"
              >latest</span
            >
          {/if}
        </div>
        <span class="text-xs font-mono text-slate-400"
          >{tag.sha.slice(0, 7)}</span
        >
      </div>
    {/each}
  {:else}
    <p class="text-slate-400 text-center py-8">No tagged versions found.</p>
  {/if}
</div>
