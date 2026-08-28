<script lang="ts">
  import { onMount } from "svelte";
  import { Home, Volume2, VolumeX } from "lucide-svelte";
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  import { useSchool } from "$lib/school/context";
  import { isMuted, setMuted } from "$lib/school/sound";
  import { cn } from "$lib/utils/cn";

  interface Props {
    current: number;
    total: number;
    score: number;
    onExit: () => void;
  }

  let { current, total, score, onExit }: Props = $props();

  const { copy } = useSchool();

  const xp = new Tween(0, { duration: 600, easing: cubicOut });
  let muted = $state(false);

  const steps = $derived(Array.from({ length: total }, (_, index) => index + 1));
  const progress = $derived(Math.min(Math.round(((current - 1) / total) * 100), 100));

  onMount(() => {
    muted = isMuted();
  });

  $effect(() => {
    xp.target = score;
  });

  const toggleSound = () => {
    muted = !muted;
    setMuted(muted);
  };
</script>

<div class="sticky top-14 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
  <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-6">
    <button
      type="button"
      onclick={onExit}
      class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      <Home class="h-3.5 w-3.5" />
      <span class="hidden sm:inline">{copy.shell.exit}</span>
    </button>

    <div class="flex min-w-0 flex-1 items-center gap-2">
      <div class="hidden gap-1.5 sm:flex">
        {#each steps as step (step)}
          <span
            class={cn(
              "h-2 w-2 rounded-full transition-colors",
              step < current ? "bg-emerald-500" : step === current ? "bg-zig-400" : "bg-slate-200",
            )}
          ></span>
        {/each}
      </div>
      <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-zig-400 transition-[width] duration-500"
          style:width={`${progress}%`}
        ></div>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <span class="font-mono text-sm font-black tabular-nums text-zig-700">
        {Math.round(xp.current)}
      </span>
      <span class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
        {copy.shell.xp}
      </span>
      <button
        type="button"
        onclick={toggleSound}
        title={muted ? copy.shell.soundOff : copy.shell.soundOn}
        aria-label={muted ? copy.shell.soundOff : copy.shell.soundOn}
        class="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        {#if muted}
          <VolumeX class="h-4 w-4" />
        {:else}
          <Volume2 class="h-4 w-4" />
        {/if}
      </button>
    </div>
  </div>
</div>
