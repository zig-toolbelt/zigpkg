<script lang="ts">
  import { untrack } from "svelte";

  import { useSchool } from "$lib/school/context";
  import { ChallengeRunner } from "$lib/school/runner.svelte";
  import { sound } from "$lib/school/sound";
  import type { Blank, FillBlankChallenge } from "$lib/school/types";
  import { highlightZig } from "$lib/school/zig";
  import { cn } from "$lib/utils/cn";

  import ChallengeFrame from "./ChallengeFrame.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import FeedbackBar from "./FeedbackBar.svelte";
  import GameButton from "./GameButton.svelte";
  import Inline from "./Inline.svelte";

  interface Props {
    challenge: FillBlankChallenge;
    reward: number;
    onSolved: (earned: number) => void;
  }

  let { challenge, reward, onSolved }: Props = $props();

  const { copy } = useSchool();
  const runner = new ChallengeRunner(untrack(() => reward));

  const blanks: Blank[] = untrack(() =>
    challenge.segments.filter((segment) => segment.type === "blank"),
  );

  let values = $state<Record<string, string>>({});
  let active = $state(blanks[0]?.id ?? "");

  const activeBlank = $derived(blanks.find((blank) => blank.id === active) ?? blanks[0]);
  const ready = $derived(blanks.every((blank) => values[blank.id]));
  const verdicts = $derived(
    blanks.map((blank) => ({
      blank,
      right: values[blank.id] === blank.answer,
      feedback:
        blank.options.find((option) => option.value === values[blank.id])?.feedback ?? "",
    })),
  );

  const pick = (value: string) => {
    if (runner.locked || !activeBlank) return;
    sound.place();
    values = { ...values, [activeBlank.id]: value };
    const next = blanks.find((blank) => blank.id !== activeBlank.id && !values[blank.id]);
    if (next) active = next.id;
  };

  const check = () => {
    if (blanks.every((blank) => values[blank.id] === blank.answer)) runner.succeed();
    else runner.fail();
  };

  const reveal = () => {
    values = Object.fromEntries(blanks.map((blank) => [blank.id, blank.answer]));
    runner.reveal();
  };
</script>

<ChallengeFrame
  prompt={challenge.prompt}
  hearts={runner.hearts}
  earned={runner.earned}
  {reward}
>
  <CodeBlock>
    {#snippet children()}{#each challenge.segments as segment, index (index)}{#if segment.type === "text"}{#each highlightZig(segment.value) as token, tokenIndex (tokenIndex)}<span
                class={token.className}>{token.text}</span
              >{/each}{:else}{@const value = values[segment.id]}{@const isActive =
            segment.id === active && !runner.locked}{@const right = value === segment.answer}<button
            type="button"
            disabled={runner.locked}
            onclick={() => {
              sound.tap();
              active = segment.id;
            }}
            class={cn(
              "mx-0.5 inline-flex max-w-full items-center rounded-md border-2 px-2 py-0.5 align-middle font-mono text-[12.5px] transition",
              !value && !isActive && "border-dashed border-slate-600 text-slate-400",
              !value && isActive && "school-ring border-dashed border-zig-400 text-zig-300",
              value && !runner.locked && isActive && "border-zig-400 bg-zig-400/10 text-zig-200",
              value && !runner.locked && !isActive && "border-slate-600 text-slate-100",
              value && runner.locked && right && "border-emerald-400 bg-emerald-400/10 text-emerald-300",
              value &&
                runner.locked &&
                !right &&
                "school-shake border-red-400 bg-red-400/10 text-red-300",
              !runner.locked && "cursor-pointer hover:border-zig-300",
            )}>{value ?? `▁▁ ${segment.label} ▁▁`}</button
          >{/if}{/each}{/snippet}
  </CodeBlock>

  {#if activeBlank && !runner.locked}
    <div class="mt-5 border-t border-slate-100 pt-4">
      <p class="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {copy.challenge.fillBankLabel} — {activeBlank.label}
      </p>
      <div class="flex flex-col gap-2">
        {#each activeBlank.options as option (option.value)}
          {@const chosen = values[activeBlank.id] === option.value}
          <button
            type="button"
            onclick={() => pick(option.value)}
            class={cn(
              "cursor-pointer rounded-xl border-2 px-4 py-3 text-left font-mono text-[12.5px] transition active:translate-y-[3px] active:shadow-none",
              chosen
                ? "border-zig-400 bg-zig-50 text-slate-900 shadow-[0_3px_0_0_var(--color-zig-300)]"
                : "border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_0_var(--color-slate-200)] hover:border-zig-300",
            )}
          >
            {option.value}
          </button>
        {/each}
      </div>

      {#if blanks.length > 1}
        <div class="mt-3 flex flex-wrap gap-2">
          {#each blanks as blank (blank.id)}
            <button
              type="button"
              onclick={() => {
                sound.tap();
                active = blank.id;
              }}
              class={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs transition",
                blank.id === active
                  ? "bg-zig-400 font-semibold text-slate-900"
                  : values[blank.id]
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900",
              )}
            >
              {values[blank.id] ? "✓ " : "○ "}{blank.label}
            </button>
          {/each}
        </div>
      {/if}
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
    title={runner.outOfHearts ? copy.feedback.wrongBlanksAgain : copy.feedback.wrongBlanks}
    actionLabel={runner.outOfHearts ? copy.challenge.reveal : copy.challenge.tryAgain}
    onAction={runner.outOfHearts ? reveal : () => runner.retry()}
    secondaryLabel={runner.outOfHearts ? undefined : copy.challenge.giveUp}
    onSecondary={runner.outOfHearts ? undefined : reveal}
  >
    <ul class="space-y-1.5">
      {#each verdicts as verdict (verdict.blank.id)}
        <li class={cn("rounded-lg px-3 py-2", verdict.right ? "bg-emerald-50" : "bg-white/70")}>
          <b class={verdict.right ? "text-emerald-700" : "text-red-600"}>
            {verdict.right ? "✓" : "✕"}
            {verdict.blank.label}
          </b>
          — <Inline text={verdict.feedback} />
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
        ? copy.feedback.perfectBlanks
        : copy.feedback.correctBlanks
      : copy.feedback.revealBlanks}
    actionLabel={copy.challenge.next}
    onAction={() => onSolved(runner.earned)}
  >
    <p><Inline text={challenge.explanation} /></p>
  </FeedbackBar>
{/if}
