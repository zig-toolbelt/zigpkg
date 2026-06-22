<script lang="ts">
  type Props = {
    items: string[];
  };

  let { items }: Props = $props();
</script>

<div class="rounded-lg border border-slate-200 bg-white p-3.5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
    Keywords
  </h3>
  <div class="flex flex-wrap gap-2">
    {#each items as topic (topic)}
      <a
        href="/search?q={encodeURIComponent(topic)}"
        class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500 transition-colors hover:bg-zig-100 hover:text-zig-700"
        >{topic}</a
      >
    {/each}
  </div>
</div>
