<script lang="ts">
  import { cn } from "$lib/utils/cn";

  export type MascotMood = "idle" | "happy" | "sad" | "think" | "cheer";

  interface Props {
    mood?: MascotMood;
    size?: number;
    class?: string;
  }

  let { mood = "idle", size = 64, class: className }: Props = $props();

  const mouth = $derived.by(() => {
    switch (mood) {
      case "happy":
      case "cheer":
        return "M22 40 q10 10 20 0";
      case "sad":
        return "M22 44 q10 -9 20 0";
      case "think":
        return "M24 42 h10";
      default:
        return "M23 41 q9 4 18 0";
    }
  });

  const browLeft = $derived(mood === "sad" ? "M16 22 l10 4" : mood === "think" ? "M16 24 l10 -3" : "");
  const browRight = $derived(mood === "sad" ? "M48 22 l-10 4" : "");
  const eyeRadius = $derived(mood === "happy" || mood === "cheer" ? 3.4 : 4);
</script>

<div
  class={cn("relative inline-flex items-center justify-center", mood === "idle" && "school-bob", className)}
  style:width={`${size}px`}
  style:height={`${size}px`}
  aria-hidden="true"
>
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
    <circle cx="32" cy="32" r="31" class="fill-zig-100" />
    <path d="M14 6 v6" class="stroke-slate-700" stroke-width="2.5" stroke-linecap="round" />
    <circle
      cx="14"
      cy="5"
      r="2.6"
      class={mood === "cheer" ? "fill-emerald-500" : "fill-red-500"}
    />
    <rect x="12" y="12" width="40" height="40" rx="13" class="fill-emerald-300" />
    <path
      d="M12 25 q20 -14 40 0 v-1 a13 13 0 0 0 -13 -12 h-14 a13 13 0 0 0 -13 12 z"
      class="fill-slate-800"
    />
    <rect x="12" y="12" width="40" height="40" rx="13" class="stroke-slate-800" stroke-width="2.5" />

    {#if mood === "happy" || mood === "cheer"}
      <path d="M20 33 q4 -5 8 0" class="stroke-slate-900" stroke-width="3" stroke-linecap="round" />
      <path d="M36 33 q4 -5 8 0" class="stroke-slate-900" stroke-width="3" stroke-linecap="round" />
    {:else}
      <circle cx="24" cy="33" r={eyeRadius} class="fill-slate-900" />
      <circle
        cx="40"
        cy="33"
        r={mood === "think" ? eyeRadius - 1.2 : eyeRadius}
        class="fill-slate-900"
      />
    {/if}

    {#if browLeft}
      <path d={browLeft} class="stroke-slate-800" stroke-width="2.4" stroke-linecap="round" />
    {/if}
    {#if browRight}
      <path d={browRight} class="stroke-slate-800" stroke-width="2.4" stroke-linecap="round" />
    {/if}

    <path d={mouth} class="stroke-slate-900" stroke-width="2.6" stroke-linecap="round" />

    {#if mood === "cheer"}
      <path
        d="M6 20 l3 -6 l3 6 M52 18 l3 -6 l3 6"
        class="stroke-zig-500"
        stroke-width="2.4"
        stroke-linecap="round"
      />
    {/if}
  </svg>
</div>
