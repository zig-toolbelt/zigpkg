<script lang="ts">
  import { Play, RotateCcw, Sparkles } from "lucide-svelte";

  import { useSchool } from "$lib/school/context";
  import { totalReward } from "$lib/school/scoring";

  import GameButton from "./GameButton.svelte";
  import Mascot from "./Mascot.svelte";
  import MissionMap from "./MissionMap.svelte";

  interface Props {
    completed: number;
    savedScore: number;
    onStart: () => void;
    onResume?: () => void;
  }

  let { completed, savedScore, onStart, onResume }: Props = $props();

  const { copy, levels } = useSchool();
  const maxScore = totalReward(levels);
</script>

<section class="relative overflow-hidden border-b border-zig-100 bg-zig-50">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(245_158_11/0.16)_1px,transparent_0)] bg-size-[26px_26px] opacity-50"
  ></div>
  <div class="pointer-events-none absolute right-10 top-8 h-56 w-56 rounded-full bg-white/70 blur-3xl"></div>

  <div class="relative mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div class="max-w-3xl">
        <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
          {copy.hero.eyebrow}
        </p>
        <h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
          {copy.hero.title}
          <span class="text-zig-600">{copy.hero.titleAccent}</span>
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
          {copy.hero.lead}
        </p>
        <div class="mt-6 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
          {#each copy.hero.tags as tag (tag)}
            <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">{tag}</span>
          {/each}
        </div>
      </div>

      <Mascot mood="idle" size={140} class="shrink-0 self-start lg:self-center" />
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
    <div class="space-y-6">
      <section class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <div class="flex items-start gap-4">
          <div
            class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zig-200 bg-zig-100 text-zig-700 sm:flex"
          >
            <Sparkles class="h-4 w-4" />
          </div>
          <div>
            <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {copy.hero.audience}
            </p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {copy.hero.audienceLead}
            </h2>
            <ul class="mt-5 grid gap-2 sm:grid-cols-2">
              {#each copy.skills as skill (skill)}
                <li class="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zig-400"></span>
                  <span>{skill}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {copy.start.mapTitle}
        </p>
        <MissionMap {levels} {completed} />
      </section>
    </div>

    <aside class="rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
      {#if onResume}
        <div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {copy.start.saved}
          </p>
          <p class="mt-1 text-sm text-slate-700">
            {completed} / {levels.length} · {savedScore} XP
          </p>
        </div>
        <GameButton size="lg" class="w-full" onclick={onResume}>
          <Play class="h-4 w-4" />
          {copy.start.resume}
        </GameButton>
        <GameButton variant="neutral" size="md" class="mt-2 w-full" onclick={onStart}>
          <RotateCcw class="h-3.5 w-3.5" />
          {copy.start.restart}
        </GameButton>
      {:else}
        <GameButton size="lg" class="w-full" onclick={onStart}>
          <Play class="h-4 w-4" />
          {copy.start.begin}
        </GameButton>
      {/if}

      <dl class="mt-5 space-y-2 border-t border-slate-100 pt-4 font-mono text-[11px] text-slate-500">
        <div class="flex items-center justify-between">
          <dt>missions</dt>
          <dd class="font-semibold text-slate-700">{levels.length}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt>max score</dt>
          <dd class="font-semibold text-slate-700">{maxScore} XP</dd>
        </div>
      </dl>

      <p class="mt-4 text-[11px] leading-5 text-slate-400">{copy.start.storageNote}</p>
    </aside>
  </div>
</div>
