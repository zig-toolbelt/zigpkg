<script lang="ts">
  import { type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    active: boolean;
    children: Snippet;
  };

  let { active, children, ...rest }: Props = $props();

  let activeCn = $derived(
    active
      ? "border-zig-400/50 bg-zig-500/10 text-zig-700"
      : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  );
</script>

<button
  type="button"
  {...rest}
  role="tab"
  aria-selected={active}
  class="inline-flex h-6 cursor-pointer items-center justify-center gap-1.5 rounded-sm border px-1.5 font-mono text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-500 {activeCn}"
>
  {@render children()}
</button>
