<script lang="ts">
  type Props = {
    items: string[];
  };

  let { items }: Props = $props();
</script>

<div class="bg-white border border-gray-200 rounded-2xl p-5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
    Keywords
  </h3>
  <div class="flex flex-wrap gap-2">
    {#each items as topic (topic)}
      <a
        href="/search?q={encodeURIComponent(topic)}"
        class="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 text-slate-600 border border-gray-100 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 transition-colors"
        >{topic}</a
      >
    {/each}
  </div>
</div>
