<script lang="ts">
  import type { Snippet } from "svelte";

  import { useSchool } from "$lib/school/context";

  import Hearts from "./Hearts.svelte";
  import Inline from "./Inline.svelte";

  interface Props {
    prompt: string;
    hearts: number;
    earned: number;
    reward: number;
    stage?: string;
    children: Snippet;
  }

  let { prompt, hearts, earned, reward, stage, children }: Props = $props();

  const { copy } = useSchool();
</script>

<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <header class="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
    <div class="min-w-0 flex-1">
      <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        {stage ?? copy.challenge.task}
      </p>
      <h2 class="mt-1 text-lg font-black leading-snug tracking-tight text-slate-950">
        <Inline text={prompt} />
      </h2>
    </div>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <Hearts {hearts} class="justify-end" />
        <p class="mt-1 font-mono text-[10px] uppercase tracking-wide text-slate-400">
          {copy.challenge.heartsHint}
        </p>
      </div>
      <div class="rounded-xl bg-zig-50 px-3 py-1.5 text-right ring-1 ring-zig-100">
        <p class="font-mono text-sm font-black text-zig-700">+{earned}</p>
        <p class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
          {copy.completion.of}
          {reward} XP
        </p>
      </div>
    </div>
  </header>

  {@render children()}
</section>
