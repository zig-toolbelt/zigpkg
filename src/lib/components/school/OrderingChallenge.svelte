<script lang="ts">
  import { untrack } from "svelte";

  import { useSchool } from "$lib/school/context";
  import { ChallengeRunner } from "$lib/school/runner.svelte";
  import { sound } from "$lib/school/sound";
  import type { OrderingChallenge } from "$lib/school/types";
  import { cn } from "$lib/utils/cn";

  import ChallengeFrame from "./ChallengeFrame.svelte";
  import FeedbackBar from "./FeedbackBar.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";

  interface Props {
    challenge: OrderingChallenge;
    reward: number;
    onSolved: (earned: number) => void;
  }

  let { challenge, reward, onSolved }: Props = $props();

  const { copy } = useSchool();
  const runner = new ChallengeRunner(untrack(() => reward));

  let placed = $state<string[]>([]);
  let misplaced = $state<string[]>([]);

  const bank = $derived(challenge.items.filter((item) => !placed.includes(item.id)));
  const ready = $derived(placed.length === challenge.items.length);
  const hints = $derived(
    misplaced
      .slice(0, 2)
      .map((id) => challenge.items.find((item) => item.id === id))
      .filter((item) => item !== undefined),
  );

  const byId = (id: string) => challenge.items.find((item) => item.id === id);

  const place = (id: string) => {
    if (runner.locked) return;
    sound.place();
    misplaced = [];
    placed = [...placed, id];
  };

  const pull = (id: string) => {
    if (runner.locked) return;
    sound.undo();
    misplaced = [];
    placed = placed.filter((item) => item !== id);
  };

  const check = () => {
    const wrong = placed.filter((id, index) => challenge.correctOrder[index] !== id);
    if (wrong.length === 0) {
      runner.succeed();
      return;
    }
    misplaced = wrong;
    runner.fail();
  };

  const reveal = () => {
    placed = [...challenge.correctOrder];
    misplaced = [];
    runner.reveal();
  };
</script>

<ChallengeFrame
  prompt={challenge.prompt}
  hearts={runner.hearts}
  earned={runner.earned}
  {reward}
>
  <ol class="space-y-2">
    {#each placed as id, index (id)}
      {@const item = byId(id)}
      {#if item}
        {@const isWrong = misplaced.includes(id)}
        <li>
          <button
            type="button"
            disabled={runner.locked}
            onclick={() => pull(id)}
            class={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition",
              isWrong
                ? "school-shake border-red-400 bg-red-50"
                : runner.resolved
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-zig-300 hover:bg-zig-50/50",
              runner.locked ? "cursor-default" : "cursor-pointer",
            )}
          >
            <span
              class={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-sm font-black",
                isWrong ? "bg-red-500 text-white" : "bg-zig-400 text-slate-900",
              )}
            >
              {index + 1}
            </span>
            <span class="text-sm leading-snug text-slate-700">{item.label}</span>
          </button>
        </li>
      {/if}
    {/each}

    {#each Array.from({ length: challenge.items.length - placed.length }, (_, index) => index) as slot (slot)}
      <li
        class="flex h-[52px] items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-3"
      >
        <span
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 font-mono text-sm font-black text-slate-400"
        >
          {placed.length + slot + 1}
        </span>
        <span class="text-sm text-slate-400">{copy.challenge.orderingEmpty}</span>
      </li>
    {/each}
  </ol>

  {#if bank.length > 0}
    <div class="mt-5 border-t border-slate-100 pt-4">
      <p class="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {copy.challenge.orderingBank}
      </p>
      <div class="flex flex-wrap gap-2">
        {#each bank as item (item.id)}
          <button
            type="button"
            disabled={runner.locked}
            onclick={() => place(item.id)}
            class="school-pop cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-700 shadow-[0_3px_0_0_var(--color-slate-200)] transition hover:border-zig-300 hover:bg-zig-50/50 active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50"
          >
            {item.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if runner.status === "input"}
    <div class="mt-6 flex justify-end">
      <GameButton size="lg" disabled={!ready} onclick={check}>{copy.challenge.check}</GameButton>
    </div>
  {/if}
</ChallengeFrame>

{#if runner.status === "wrong"}
  <FeedbackBar
    variant="wrong"
    title={runner.outOfHearts ? copy.feedback.wrongOrderAgain : copy.feedback.wrongOrder}
    actionLabel={runner.outOfHearts ? copy.challenge.reveal : copy.challenge.tryAgain}
    onAction={runner.outOfHearts ? reveal : () => runner.retry()}
    secondaryLabel={runner.outOfHearts ? undefined : copy.challenge.giveUp}
    onSecondary={runner.outOfHearts ? undefined : reveal}
  >
    <p>{copy.challenge.orderingRetryHint}</p>
    <ul class="space-y-1.5">
      {#each hints as item (item.id)}
        <li class="rounded-lg bg-white/70 px-3 py-2">
          <b class="text-red-600">{item.label.split(":")[0]}</b>
          — <Inline text={item.hint} />
        </li>
      {/each}
    </ul>
  </FeedbackBar>
{/if}

{#if runner.resolved}
  <FeedbackBar
    variant={runner.status === "correct" ? "correct" : "reveal"}
    title={runner.status === "correct"
      ? runner.mistakes === 0
        ? copy.feedback.perfectOrder
        : copy.feedback.correctOrder
      : copy.feedback.revealOrder}
    actionLabel={copy.challenge.next}
    onAction={() => onSolved(runner.earned)}
  >
    <p><Inline text={challenge.explanation} /></p>
  </FeedbackBar>
{/if}
