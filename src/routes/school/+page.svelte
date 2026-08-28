<script lang="ts">
  import { onMount } from "svelte";

  import CompletionScreen from "$lib/components/school/CompletionScreen.svelte";
  import GameShell from "$lib/components/school/GameShell.svelte";
  import LevelView from "$lib/components/school/LevelView.svelte";
  import StartScreen from "$lib/components/school/StartScreen.svelte";
  import { getSchoolContent } from "$lib/school/content";
  import { setSchoolContext } from "$lib/school/context";
  import { mistakesFromReward } from "$lib/school/scoring";
  import {
    clearProgress,
    loadProgress,
    saveProgress,
    type Progress,
    type Screen,
  } from "$lib/school/storage";
  import type { LevelResult } from "$lib/school/types";

  import "$lib/school/school.css";

  const content = getSchoolContent();
  setSchoolContext(content);

  const levels = content.levels;

  let screen = $state<Screen>("start");
  let index = $state(0);
  let score = $state(0);
  let results = $state<LevelResult[]>([]);
  let saved = $state<Progress | null>(null);

  const level = $derived(levels[Math.min(index, levels.length - 1)]);

  onMount(() => {
    saved = loadProgress();
  });

  $effect(() => {
    if (screen === "playing" || screen === "done") {
      saveProgress({ screen, index, score, results });
    }
  });

  const start = () => {
    clearProgress();
    saved = null;
    index = 0;
    score = 0;
    results = [];
    screen = "playing";
  };

  const resume = () => {
    const progress = loadProgress();
    if (!progress) {
      start();
      return;
    }
    index = Math.min(progress.index, levels.length - 1);
    score = progress.score;
    results = progress.results;
    screen = progress.screen;
  };

  const exitToStart = () => {
    saved = loadProgress();
    screen = "start";
  };

  const solve = (earned: number) => {
    score += earned;
    results = [
      ...results.filter((result) => result.id !== level.id),
      {
        id: level.id,
        earned,
        reward: level.reward,
        mistakes: mistakesFromReward(level.reward, earned),
      },
    ];

    if (index + 1 < levels.length) {
      index += 1;
      window.scrollTo({ top: 0 });
    } else {
      screen = "done";
    }
  };
</script>

{#if screen === "start"}
  <StartScreen
    completed={saved?.results.length ?? 0}
    savedScore={saved?.score ?? 0}
    onStart={start}
    onResume={saved ? resume : undefined}
  />
{:else if screen === "done"}
  <GameShell current={levels.length + 1} total={levels.length} {score} onExit={exitToStart} />
  <CompletionScreen {score} {results} onRestart={start} onExit={exitToStart} />
{:else}
  <GameShell current={index + 1} total={levels.length} {score} onExit={exitToStart} />
  {#key level.id}
    <LevelView {level} isLast={index === levels.length - 1} onSolved={solve} />
  {/key}
{/if}
