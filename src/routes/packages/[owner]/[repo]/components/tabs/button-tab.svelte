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
      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
      : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
  );
</script>

<button
  type="button"
  {...rest}
  role="tab"
  aria-selected={active}
  class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-500 {activeCn}"
>
  {@render children()}
</button>
