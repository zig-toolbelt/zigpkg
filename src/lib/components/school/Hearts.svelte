<script lang="ts">
  import { MAX_HEARTS } from "$lib/school/scoring";
  import { cn } from "$lib/utils/cn";

  interface Props {
    hearts: number;
    class?: string;
  }

  let { hearts, class: className }: Props = $props();

  const slots = Array.from({ length: MAX_HEARTS }, (_, index) => index);
</script>

<div class={cn("flex items-center gap-1", className)} title={`${hearts} / ${MAX_HEARTS}`}>
  {#each slots as slot (slot)}
    {@const alive = slot < hearts}
    <svg
      viewBox="0 0 24 24"
      class={cn("h-4.5 w-4.5", alive ? "fill-red-500" : "fill-slate-200", !alive && "school-break")}
      aria-hidden="true"
    >
      <path
        d="M12 21s-7.5-4.6-9.6-9A5.4 5.4 0 0 1 12 6.5 5.4 5.4 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z"
      />
    </svg>
  {/each}
  <span class="sr-only">{hearts} attempts left</span>
</div>
