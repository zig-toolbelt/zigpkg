import type { Level, LevelResult, Rank } from "./types";

export const MAX_HEARTS = 3;

const RANK_THRESHOLDS = [95, 85, 70, 50, 0];

export function computeReward(base: number, wrongAttempts: number): number {
  const quarter = Math.round(base * 0.25);
  return Math.max(base - quarter * wrongAttempts, quarter);
}

export function mistakesFromReward(reward: number, earned: number): number {
  const quarter = Math.round(reward * 0.25);
  return quarter === 0 ? 0 : Math.round((reward - earned) / quarter);
}

export function percentOf(score: number, max: number): number {
  return max === 0 ? 0 : Math.round((score / max) * 100);
}

export function rankFor(percent: number, ranks: Rank[]): Rank {
  const index = RANK_THRESHOLDS.findIndex((threshold) => percent >= threshold);
  return ranks[index === -1 ? ranks.length - 1 : index];
}

export function totalReward(levels: Level[]): number {
  return levels.reduce((sum, level) => sum + level.reward, 0);
}

export function cleanRuns(results: LevelResult[]): number {
  return results.filter((result) => result.mistakes === 0).length;
}
