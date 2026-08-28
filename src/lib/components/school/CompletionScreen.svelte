<script lang="ts">
  import { onMount } from "svelte";
  import { Home, RotateCcw } from "lucide-svelte";
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  import { useSchool } from "$lib/school/context";
  import { MAX_HEARTS, cleanRuns, percentOf, rankFor, totalReward } from "$lib/school/scoring";
  import { sound } from "$lib/school/sound";
  import type { LevelResult } from "$lib/school/types";
  import { cn } from "$lib/utils/cn";

  import Confetti from "./Confetti.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";
  import Mascot from "./Mascot.svelte";

  interface Props {
    score: number;
    results: LevelResult[];
    onRestart: () => void;
    onExit: () => void;
  }

  let { score, results, onRestart, onExit }: Props = $props();

  const { copy, levels } = useSchool();

  const maxScore = totalReward(levels);
  const percent = $derived(percentOf(score, maxScore));
  const rank = $derived(rankFor(percent, copy.ranks));
  const perfectRuns = $derived(cleanRuns(results));

  const shown = new Tween(0, { duration: 1200, easing: cubicOut });

  const mistakeLabel = (mistakes: number): string => {
    if (mistakes <= 0) return copy.completion.noMistakes;
    if (mistakes >= MAX_HEARTS) return copy.completion.maxedMistakes;
    if (mistakes === 1) return copy.completion.oneMistake;
    return `${mistakes} ${copy.completion.manyMistakes}`;
  };

  onMount(() => {
    sound.finish();
    shown.target = score;
  });
</script>

<Confetti />

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
  <section
    class="school-pop rounded-2xl border border-zig-200 bg-zig-50 p-6 text-center shadow-sm sm:p-8"
  >
    <Mascot mood="cheer" size={120} class="mx-auto" />

    <p class="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
      {copy.completion.eyebrow}
    </p>

    <div class="mt-4 flex items-center justify-center gap-4">
      <span
        class="grid h-16 w-16 place-items-center rounded-2xl bg-slate-900 text-3xl font-black text-zig-400"
      >
        {rank.badge}
      </span>
      <div class="text-left">
        <h1 class="text-3xl font-black tracking-tight text-slate-950">{rank.title}</h1>
        <p class="font-mono text-sm text-slate-500">
          {percent}% {copy.completion.mastery}
        </p>
      </div>
    </div>

    <p class="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">{rank.verdict}</p>

    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p class="font-mono text-2xl font-black tabular-nums text-zig-700">
          {Math.round(shown.current)}
        </p>
        <p class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
          {copy.completion.of}
          {maxScore} XP
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p class="font-mono text-2xl font-black tabular-nums text-emerald-600">
          {perfectRuns}/{levels.length}
        </p>
        <p class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
          {copy.completion.cleanRuns}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p class="font-mono text-2xl font-black tabular-nums text-slate-900">{percent}%</p>
        <p class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
          {copy.completion.mastery}
        </p>
      </div>
    </div>
  </section>

  <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {copy.completion.log}
    </p>
    <ul class="divide-y divide-slate-100">
      {#each levels as level (level.id)}
        {@const result = results.find((entry) => entry.id === level.id)}
        <li class="flex items-center gap-3 py-2.5">
          <span
            class={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-black",
              result?.mistakes === 0 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500",
            )}
          >
            {level.id}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-slate-800">{level.title}</span>
            <span class="font-mono text-[11px] text-slate-400">
              {level.codename} · {mistakeLabel(result?.mistakes ?? MAX_HEARTS)}
            </span>
          </span>
          <span class="shrink-0 font-mono text-sm font-bold text-zig-700">
            +{result?.earned ?? 0}
          </span>
        </li>
      {/each}
    </ul>
  </section>

  <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {copy.completion.concepts}
    </p>
    <ul class="space-y-2">
      {#each levels as level (level.id)}
        <li class="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
          <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zig-400"></span>
          <span><Inline text={level.takeaway} /></span>
        </li>
      {/each}
    </ul>
  </section>

  <p class="mt-6 text-center text-sm leading-6 text-slate-500">{copy.completion.epilogue}</p>

  <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
    <GameButton size="lg" onclick={onRestart}>
      <RotateCcw class="h-4 w-4" />
      {copy.completion.replay}
    </GameButton>
    <GameButton variant="neutral" size="lg" onclick={onExit}>
      <Home class="h-4 w-4" />
      {copy.completion.menu}
    </GameButton>
  </div>

  <p class="mt-3 text-center text-[11px] text-slate-400">{copy.completion.replayHint}</p>
</div>
