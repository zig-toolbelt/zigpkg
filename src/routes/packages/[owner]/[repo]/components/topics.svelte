<script lang="ts">
  import { badgeVariants } from "$lib/components/ui/badge-variants";

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
        class={badgeVariants({ variant: "topic" })}
        >{topic}</a
      >
    {/each}
  </div>
</div>
