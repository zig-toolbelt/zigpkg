<script lang="ts">
  import type { Snippet } from "svelte";

  import { highlightZig } from "$lib/school/zig";
  import { cn } from "$lib/utils/cn";

  interface Props {
    code?: string;
    label?: string;
    class?: string;
    children?: Snippet;
  }

  let { code, label, class: className, children }: Props = $props();

  const tokens = $derived(code ? highlightZig(code) : []);
</script>

<div class={cn("overflow-hidden rounded-xl border border-slate-800 bg-slate-900", className)}>
  <div class="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-3 py-2">
    <span class="h-2.5 w-2.5 rounded-full bg-red-400/80"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-amber-300/80"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></span>
    {#if label}
      <span class="ml-2 font-mono text-[11px] tracking-wide text-slate-400">{label}</span>
    {/if}
  </div>
  <pre
    class="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#c9d1d9]"><code
      >{#if children}{@render children()}{:else}{#each tokens as token, index (index)}<span
            class={token.className}>{token.text}</span
          >{/each}{/if}</code
    ></pre>
</div>
