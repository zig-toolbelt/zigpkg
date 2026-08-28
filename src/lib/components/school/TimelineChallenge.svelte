<script lang="ts">
  import { untrack } from "svelte";

  import { useSchool } from "$lib/school/context";
  import { ChallengeRunner } from "$lib/school/runner.svelte";
  import { sound } from "$lib/school/sound";
  import type { TimelineChallenge } from "$lib/school/types";
  import { cn } from "$lib/utils/cn";

  import ChallengeFrame from "./ChallengeFrame.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import FeedbackBar from "./FeedbackBar.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";

  interface Props {
    challenge: TimelineChallenge;
    reward: number;
    onSolved: (earned: number) => void;
  }

  let { challenge, reward, onSolved }: Props = $props();

  const { copy } = useSchool();
  const runner = new ChallengeRunner(untrack(() => reward));

  let placement = $state<Record<string, string>>({});
  let total = $state<number | null>(null);
  let selected = $state<string | null>(untrack(() => challenge.lines[0]?.id ?? null));

  const bank = $derived(challenge.lines.filter((line) => !placement[line.id]));
  const ready = $derived(bank.length === 0 && total !== null);
  const totalRight = $derived(total === challenge.totalSeconds);

  const placeInto = (timestamp: string) => {
    if (runner.locked) return;
    const lineId = selected ?? bank[0]?.id;
    if (!lineId) return;
    sound.place();
    placement = { ...placement, [lineId]: timestamp };
    selected = bank.find((line) => line.id !== lineId)?.id ?? null;
  };

  const pull = (lineId: string) => {
    if (runner.locked) return;
    sound.undo();
    const next = { ...placement };
    delete next[lineId];
    placement = next;
    selected = lineId;
  };

  const check = () => {
    const linesRight = challenge.lines.every(
      (line) => placement[line.id] === challenge.correct[line.id],
    );
    if (linesRight && total === challenge.totalSeconds) runner.succeed();
    else runner.fail();
  };

  const reveal = () => {
    placement = { ...challenge.correct };
    total = challenge.totalSeconds;
    runner.reveal();
  };
</script>

<ChallengeFrame
  prompt={challenge.prompt}
  hearts={runner.hearts}
  earned={runner.earned}
  {reward}
>
  <CodeBlock code={challenge.code} label="scout log" />

  {#if bank.length > 0}
    <div class="mt-5">
      <p class="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {copy.challenge.timelineBank}
      </p>
      <div class="flex flex-wrap gap-2">
        {#each bank as line (line.id)}
          <button
            type="button"
            disabled={runner.locked}
            onclick={() => {
              sound.tap();
              selected = line.id;
            }}
            class={cn(
              "cursor-pointer rounded-xl border-2 px-4 py-2.5 font-mono text-[12.5px] transition active:translate-y-[3px] active:shadow-none",
              selected === line.id
                ? "border-zig-400 bg-zig-50 text-slate-900 shadow-[0_3px_0_0_var(--color-zig-300)]"
                : "border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_0_var(--color-slate-200)] hover:border-zig-300",
            )}
          >
            {line.text}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mt-5 grid grid-cols-3 gap-2">
    {#each challenge.timestamps as timestamp (timestamp)}
      {@const inColumn = challenge.lines.filter((line) => placement[line.id] === timestamp)}
      {@const droppable = !runner.locked && bank.length > 0}
      <div
        role="button"
        tabindex={0}
        aria-disabled={!droppable}
        onclick={() => placeInto(timestamp)}
        onkeydown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          placeInto(timestamp);
        }}
        class={cn(
          "min-h-[104px] rounded-xl border-2 border-dashed p-2 transition",
          droppable
            ? "cursor-pointer border-slate-300 hover:border-zig-400 hover:bg-zig-50/60"
            : "border-slate-200",
        )}
      >
        <p class="mb-2 text-center font-mono text-xs font-bold text-zig-700">{timestamp}</p>
        <div class="space-y-1.5">
          {#each inColumn as line (line.id)}
            {@const right = challenge.correct[line.id] === timestamp}
            <button
              type="button"
              disabled={runner.locked}
              onclick={(event) => {
                event.stopPropagation();
                pull(line.id);
              }}
              class={cn(
                "block w-full break-words rounded-lg border-2 px-2 py-1.5 text-left font-mono text-[11px] leading-tight",
                runner.locked
                  ? right
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "school-shake border-red-400 bg-red-50 text-red-700"
                  : "cursor-pointer border-zig-300 bg-white text-slate-700 hover:border-red-300",
              )}
            >
              {line.text}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-6 border-t border-slate-100 pt-4">
    <p class="mb-2 text-sm font-bold text-slate-900">{copy.challenge.timelineTotal}</p>
    <div class="flex flex-wrap gap-2">
      {#each challenge.totalOptions as option (option)}
        {@const chosen = total === option}
        <button
          type="button"
          disabled={runner.locked}
          onclick={() => {
            sound.tap();
            total = option;
          }}
          class={cn(
            "min-w-[76px] cursor-pointer rounded-xl border-2 px-4 py-2.5 font-mono text-sm font-bold transition active:translate-y-[3px] active:shadow-none",
            runner.locked && chosen && totalRight && "border-emerald-400 bg-emerald-50 text-emerald-700",
            runner.locked && chosen && !totalRight && "border-red-400 bg-red-50 text-red-700",
            runner.locked && !chosen && "border-slate-200 bg-white text-slate-400",
            !runner.locked && chosen && "border-zig-400 bg-zig-50 text-slate-900 shadow-[0_3px_0_0_var(--color-zig-300)]",
            !runner.locked &&
              !chosen &&
              "border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_0_var(--color-slate-200)] hover:border-zig-300",
          )}
        >
          {option}{copy.challenge.seconds}
        </button>
      {/each}
    </div>
  </div>

  {#if runner.status === "input"}
    <div class="mt-6 flex justify-end">
      <GameButton size="lg" disabled={!ready} onclick={check}>{copy.challenge.check}</GameButton>
    </div>
  {/if}
</ChallengeFrame>

{#if runner.status === "wrong"}
  <FeedbackBar
    variant="wrong"
    title={runner.outOfHearts ? copy.feedback.wrongTimelineAgain : copy.feedback.wrongTimeline}
    actionLabel={runner.outOfHearts ? copy.challenge.reveal : copy.challenge.tryAgain}
    onAction={runner.outOfHearts ? reveal : () => runner.retry()}
    secondaryLabel={runner.outOfHearts ? undefined : copy.challenge.giveUp}
    onSecondary={runner.outOfHearts ? undefined : reveal}
  >
    <ul class="space-y-1.5">
      {#each challenge.lines as line (line.id)}
        {@const right = placement[line.id] === challenge.correct[line.id]}
        <li class={cn("rounded-lg px-3 py-2", right ? "bg-emerald-50" : "bg-white/70")}>
          <b class={right ? "text-emerald-700" : "text-red-600"}>
            {right ? "✓" : "✕"}
            {line.text}
          </b>
          — <Inline text={line.explain} />
        </li>
      {/each}
      <li class={cn("rounded-lg px-3 py-2", totalRight ? "bg-emerald-50" : "bg-white/70")}>
        <b class={totalRight ? "text-emerald-700" : "text-red-600"}>
          {totalRight ? "✓" : "✕"}
          {copy.challenge.totalRow}
        </b>
        — <Inline text={challenge.totalExplain} />
      </li>
    </ul>
  </FeedbackBar>
{/if}

{#if runner.resolved}
  <FeedbackBar
    variant={runner.status === "correct" ? "correct" : "reveal"}
    title={runner.status === "correct"
      ? runner.mistakes === 0
        ? copy.feedback.perfectTimeline
        : copy.feedback.correctTimeline
      : copy.feedback.revealTimeline}
    actionLabel={copy.challenge.next}
    onAction={() => onSolved(runner.earned)}
  >
    <p><Inline text={challenge.explanation} /></p>
  </FeedbackBar>
{/if}
