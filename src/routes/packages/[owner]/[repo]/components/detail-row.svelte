<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label,
    children,
    border = true,
  }: { label: string; children: Snippet; border?: boolean } = $props();
</script>

<div
  class="{border
    ? 'border-t border-gray-100 pt-3 '
    : ''}flex items-center justify-between"
>
  <span class="text-sm text-slate-500">{label}</span>
  <span class="text-sm font-semibold text-slate-900">
    {@render children()}
  </span>
</div>
