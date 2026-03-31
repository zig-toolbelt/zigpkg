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
      ? "border-yellow-400 text-yellow-700"
      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-gray-300",
  );
</script>

<button
  {...rest}
  class="cursor-pointer px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 {activeCn}"
>
  {@render children()}
</button>
