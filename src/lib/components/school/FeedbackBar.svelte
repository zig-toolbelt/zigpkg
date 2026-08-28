<script lang="ts">
  import type { Snippet } from "svelte";

  import { useSchool } from "$lib/school/context";
  import { cn } from "$lib/utils/cn";

  import GameButton from "./GameButton.svelte";
  import Mascot from "./Mascot.svelte";

  type Variant = "correct" | "wrong" | "reveal";

  interface Props {
    variant: Variant;
    title: string;
    actionLabel: string;
    onAction: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    children: Snippet;
  }

  let { variant, title, actionLabel, onAction, secondaryLabel, onSecondary, children }: Props =
    $props();

  const { copy } = useSchool();

  const skin = {
    correct: {
      bar: "border-t-emerald-400 bg-emerald-50",
      title: "text-emerald-700",
      button: "success" as const,
      mood: "cheer" as const,
    },
    wrong: {
      bar: "border-t-red-400 bg-red-50",
      title: "text-red-700",
      button: "danger" as const,
      mood: "sad" as const,
    },
    reveal: {
      bar: "border-t-zig-400 bg-zig-50",
      title: "text-zig-800",
      button: "primary" as const,
      mood: "think" as const,
    },
  };

  const tone = $derived(skin[variant]);

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;
    if (document.activeElement instanceof HTMLButtonElement) return;
    event.preventDefault();
    onAction();
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-56" aria-hidden="true"></div>

<div
  class={cn(
    "school-rise fixed inset-x-0 bottom-0 z-40 border-t-4 shadow-[0_-8px_24px_-12px_rgb(15_23_42/0.25)]",
    tone.bar,
  )}
>
  <div class="mx-auto max-h-[58vh] w-full max-w-4xl overflow-y-auto px-4 py-4 sm:px-6">
    <div class="flex items-start gap-3 sm:gap-4">
      <Mascot mood={tone.mood} size={52} class="hidden shrink-0 sm:block" />

      <div class="min-w-0 flex-1">
        <p class={cn("text-base font-black tracking-tight", tone.title)}>{title}</p>
        <div class="mt-1.5 space-y-2 text-sm leading-6 text-slate-700">
          {@render children()}
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-2">
        <GameButton variant={tone.button} size="lg" onclick={onAction}>{actionLabel}</GameButton>
        {#if secondaryLabel && onSecondary}
          <GameButton variant="ghost" size="sm" onclick={onSecondary}>{secondaryLabel}</GameButton>
        {:else}
          <span class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
            {copy.challenge.enterHint}
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>
