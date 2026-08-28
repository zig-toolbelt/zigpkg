<script lang="ts">
  import { untrack } from "svelte";

  import { useSchool } from "$lib/school/context";
  import { ChallengeRunner } from "$lib/school/runner.svelte";
  import { sound } from "$lib/school/sound";
  import type { ChoiceChallenge } from "$lib/school/types";
  import { highlightZig } from "$lib/school/zig";
  import { cn } from "$lib/utils/cn";

  import ChallengeFrame from "./ChallengeFrame.svelte";
  import FeedbackBar from "./FeedbackBar.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";

  interface Props {
    challenge: ChoiceChallenge;
    reward: number;
    onSolved: (earned: number) => void;
  }

  let { challenge, reward, onSolved }: Props = $props();

  const { copy } = useSchool();
  const runner = new ChallengeRunner(untrack(() => reward));

  const letters = ["A", "B", "C", "D", "E"];

  let stage = $state<"main" | "fix">("main");
  let chosen = $state<string | null>(null);

  const fix = $derived(challenge.fix);
  const onFixStage = $derived(stage === "fix" && fix !== undefined);
  const correctId = $derived(onFixStage && fix ? fix.correct : challenge.correct);
  const prompt = $derived(onFixStage && fix ? fix.prompt : challenge.prompt);
  const explanation = $derived(onFixStage && fix ? fix.explanation : challenge.explanation);
  const chosenFeedback = $derived.by(() => {
    if (!chosen) return "";
    if (onFixStage && fix) return fix.options.find((option) => option.id === chosen)?.feedback ?? "";
    return challenge.options.find((option) => option.id === chosen)?.feedback ?? "";
  });

  const check = () => {
    if (!chosen) return;
    if (chosen === correctId) runner.succeed();
    else runner.fail();
  };

  const reveal = () => {
    chosen = correctId;
    runner.reveal();
  };

  const advance = () => {
    if (stage === "main" && fix) {
      stage = "fix";
      chosen = null;
      runner.nextStage();
      sound.tap();
      return;
    }
    onSolved(runner.earned);
  };

  const cardClass = (id: string) => {
    const isChosen = chosen === id;
    const isCorrect = id === correctId;
    if (runner.locked && isCorrect) return "border-emerald-400 bg-emerald-50";
    if (runner.locked && isChosen) return "school-shake border-red-400 bg-red-50";
    if (runner.locked) return "border-slate-200 bg-white opacity-60";
    if (isChosen) return "border-zig-400 bg-zig-50 shadow-[0_3px_0_0_var(--color-zig-300)]";
    return "border-slate-200 bg-white shadow-[0_3px_0_0_var(--color-slate-200)] hover:border-zig-300";
  };
</script>

<ChallengeFrame
  {prompt}
  hearts={runner.hearts}
  earned={runner.earned}
  {reward}
  stage={onFixStage ? copy.challenge.fix : copy.challenge.diagnosis}
>
  <div class="space-y-2.5">
    {#if onFixStage && fix}
      {#each fix.options as option, index (option.id)}
        <button
          type="button"
          disabled={runner.locked}
          onclick={() => {
            sound.tap();
            chosen = option.id;
          }}
          class={cn(
            "block w-full rounded-xl border-2 p-3 text-left transition active:translate-y-[3px] active:shadow-none",
            runner.locked ? "cursor-default" : "cursor-pointer",
            cardClass(option.id),
          )}
        >
          <div class="mb-2 flex items-center gap-2">
            <span
              class="grid h-6 w-6 place-items-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-500"
            >
              {letters[index]}
            </span>
            <span class="font-mono text-[11px] uppercase tracking-wide text-slate-400">
              {copy.challenge.fixOption}
            </span>
          </div>
          <span
            class="block overflow-x-auto whitespace-pre rounded-lg bg-slate-900 p-3 font-mono text-[12px] leading-relaxed text-[#c9d1d9]"
            >{#each highlightZig(option.code) as token, tokenIndex (tokenIndex)}<span
                class={token.className}>{token.text}</span
              >{/each}</span
          >
        </button>
      {/each}
    {:else}
      {#each challenge.options as option, index (option.id)}
        <button
          type="button"
          disabled={runner.locked}
          onclick={() => {
            sound.tap();
            chosen = option.id;
          }}
          class={cn(
            "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition active:translate-y-[3px] active:shadow-none",
            runner.locked ? "cursor-default" : "cursor-pointer",
            cardClass(option.id),
          )}
        >
          <span
            class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-500"
          >
            {letters[index]}
          </span>
          <span class="text-sm leading-snug text-slate-700"><Inline text={option.label} /></span>
        </button>
      {/each}
    {/if}
  </div>

  {#if runner.status === "input"}
    <div class="mt-6 flex justify-end">
      <GameButton size="lg" disabled={!chosen} onclick={check}>{copy.challenge.check}</GameButton>
    </div>
  {/if}
</ChallengeFrame>

{#if runner.status === "wrong"}
  <FeedbackBar
    variant="wrong"
    title={runner.outOfHearts ? copy.feedback.wrongChoiceAgain : copy.feedback.wrongChoice}
    actionLabel={runner.outOfHearts ? copy.challenge.reveal : copy.challenge.tryAgain}
    onAction={runner.outOfHearts ? reveal : () => runner.retry()}
    secondaryLabel={runner.outOfHearts ? undefined : copy.challenge.giveUp}
    onSecondary={runner.outOfHearts ? undefined : reveal}
  >
    <p><Inline text={chosenFeedback} /></p>
  </FeedbackBar>
{/if}

{#if runner.resolved}
  <FeedbackBar
    variant={runner.status === "correct" ? "correct" : "reveal"}
    title={runner.status === "correct"
      ? onFixStage
        ? copy.feedback.correctFix
        : copy.feedback.correctChoice
      : copy.feedback.revealChoice}
    actionLabel={stage === "main" && fix ? copy.challenge.toFix : copy.challenge.next}
    onAction={advance}
  >
    {#if runner.status === "correct"}
      <p><Inline text={chosenFeedback} /></p>
    {/if}
    <p><Inline text={explanation} /></p>
  </FeedbackBar>
{/if}
