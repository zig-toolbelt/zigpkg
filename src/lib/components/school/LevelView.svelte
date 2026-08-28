<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  import { useSchool } from "$lib/school/context";
  import { sound } from "$lib/school/sound";
  import type { Level } from "$lib/school/types";

  import ChoiceChallenge from "./ChoiceChallenge.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import FillBlankChallenge from "./FillBlankChallenge.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";
  import Mascot from "./Mascot.svelte";
  import OrderingChallenge from "./OrderingChallenge.svelte";
  import TimelineChallenge from "./TimelineChallenge.svelte";

  interface Props {
    level: Level;
    isLast: boolean;
    onSolved: (earned: number) => void;
  }

  let { level, isLast, onSolved }: Props = $props();

  const { copy } = useSchool();

  let phase = $state<"brief" | "challenge" | "reward">("brief");
  let earned = $state(0);

  const shown = new Tween(0, { duration: 900, easing: cubicOut });
  const perfect = $derived(earned === level.reward);

  const finishChallenge = (value: number) => {
    earned = value;
    phase = "reward";
    sound.levelUp();
    shown.target = value;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPhase = (next: "brief" | "challenge") => {
    sound.tap();
    phase = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
</script>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
  {#if phase === "reward"}
    <div
      class="school-pop mx-auto max-w-xl rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 text-center shadow-sm sm:p-8"
    >
      <Mascot mood="cheer" size={104} class="mx-auto" />

      <p class="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
        {copy.level.missionClear} · {copy.level.mission}
        {level.id}
      </p>
      <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">{level.title}</h2>

      <div class="mt-5 flex items-end justify-center gap-2">
        <span class="text-5xl font-black tabular-nums text-emerald-600"
          >+{Math.round(shown.current)}</span
        >
        <span class="pb-2 font-mono text-sm text-slate-500">XP</span>
      </div>

      {#if perfect}
        <p
          class="school-pop mt-3 inline-block rounded-lg border border-zig-300 bg-zig-100 px-4 py-1.5 font-mono text-xs font-black uppercase tracking-wide text-zig-800"
        >
          {copy.level.perfect}
        </p>
      {:else}
        <p class="mt-3 text-sm text-slate-500">{copy.level.partial}</p>
      {/if}

      <div class="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-left">
        <p class="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {copy.level.learned}
        </p>
        <p class="text-sm leading-6 text-slate-700"><Inline text={level.takeaway} /></p>
      </div>

      <GameButton size="lg" class="mt-6 w-full" onclick={() => onSolved(earned)}>
        {isLast ? copy.level.toDebrief : copy.level.nextMission}
      </GameButton>
    </div>
  {:else}
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <span
        class="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500"
      >
        {copy.level.mission}
        {level.id}
      </span>
      <span class="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-zig-700">
        {level.codename}
      </span>
    </div>
    <h1 class="mb-6 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
      {level.title}
    </h1>

    {#if phase === "brief"}
      <div class="space-y-5">
        <section class="school-pop flex gap-4 rounded-2xl border border-zig-200 bg-zig-50 p-5">
          <Mascot mood="think" size={64} class="hidden shrink-0 sm:block" />
          <div>
            <p class="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
              {copy.level.briefing}
            </p>
            <p class="text-base leading-7 text-slate-700">{level.story}</p>
          </div>
        </section>

        <section class="school-pop rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {copy.level.concept}
          </p>
          <p class="text-[15px] leading-7 text-slate-700"><Inline text={level.concept} /></p>

          <div class="mt-4 grid gap-1.5 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <p
              class="col-span-full font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {copy.level.syntax}
            </p>
            {#each level.glossary as entry (entry.token)}
              <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600">
                <code class="mr-1 font-mono text-[12px] font-semibold text-zig-800">{entry.token}</code>
                <span class="text-slate-400">— </span><Inline text={entry.meaning} />
              </div>
            {/each}
          </div>
        </section>

        {#if level.referenceCode}
          <section class="school-pop space-y-2">
            <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {copy.level.sample}
            </p>
            <CodeBlock code={level.referenceCode} />
          </section>
        {/if}

        <GameButton size="lg" class="w-full" onclick={() => goToPhase("challenge")}>
          {copy.level.toChallenge} · +{level.reward} XP
        </GameButton>
      </div>
    {:else}
      <div class="space-y-4">
        <button
          type="button"
          onclick={() => goToPhase("brief")}
          class="cursor-pointer font-mono text-xs text-slate-400 transition-colors hover:text-slate-900"
        >
          ← {copy.level.backToBriefing}
        </button>

        {#if level.challenge.kind === "ordering"}
          <OrderingChallenge
            challenge={level.challenge}
            reward={level.reward}
            onSolved={finishChallenge}
          />
        {:else if level.challenge.kind === "fill-blank"}
          <FillBlankChallenge
            challenge={level.challenge}
            reward={level.reward}
            onSolved={finishChallenge}
          />
        {:else if level.challenge.kind === "timeline"}
          <TimelineChallenge
            challenge={level.challenge}
            reward={level.reward}
            onSolved={finishChallenge}
          />
        {:else}
          <ChoiceChallenge
            challenge={level.challenge}
            reward={level.reward}
            onSolved={finishChallenge}
          />
        {/if}
      </div>
    {/if}
  {/if}
</div>
