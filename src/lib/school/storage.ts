import { browser } from "$app/environment";

import type { LevelResult } from "./types";

export type Screen = "start" | "playing" | "done";

export type Progress = {
  screen: Screen;
  index: number;
  score: number;
  results: LevelResult[];
};

const PROGRESS_KEY = "zigpkg/school/progress/v1";
const MUTE_KEY = "zigpkg/school/muted/v1";

function isResult(value: unknown): value is LevelResult {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.earned === "number" &&
    typeof candidate.reward === "number" &&
    typeof candidate.mistakes === "number"
  );
}

export function loadProgress(): Progress | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { screen, index, score, results } = parsed as Record<string, unknown>;
    if (screen !== "playing" && screen !== "done") return null;
    if (typeof index !== "number" || typeof score !== "number") return null;
    return {
      screen,
      index,
      score,
      results: Array.isArray(results) ? results.filter(isResult) : [],
    };
  } catch {
    return null;
  }
}

export function saveProgress(progress: Progress): void {
  if (!browser) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    return;
  }
}

export function clearProgress(): void {
  if (!browser) return;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    return;
  }
}

export function loadMuted(): boolean {
  if (!browser) return false;
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  if (!browser) return;
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    return;
  }
}
