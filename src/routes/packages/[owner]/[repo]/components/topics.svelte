<script lang="ts">
  type Props = {
    items: string[];
  };

  let { items }: Props = $props();
</script>

<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
    Keywords
  </h3>
  <div class="flex flex-wrap gap-2">
    {#each items as topic (topic)}
      <a
        href="/search?q={encodeURIComponent(topic)}"
        class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-zig-200 hover:bg-zig-50 hover:text-zig-700"
        >{topic}</a
      >
    {/each}
  </div>
</div>
