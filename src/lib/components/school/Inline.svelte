<script lang="ts">
  import { inlineSegments } from "$lib/school/zig";

  interface Props {
    text: string;
  }

  let { text }: Props = $props();

  const segments = $derived(inlineSegments(text));
</script>

{#each segments as segment, index (index)}{#if segment.code}<code
      class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-800">{segment.text}</code
    >{:else}{segment.text}{/if}{/each}
