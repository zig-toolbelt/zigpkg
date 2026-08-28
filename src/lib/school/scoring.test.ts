import { describe, expect, it } from "vitest";

import { getSchoolContent } from "./content";
import { MAX_HEARTS, computeReward, mistakesFromReward, percentOf, rankFor } from "./scoring";

const { copy, levels } = getSchoolContent();

describe("computeReward", () => {
  it("keeps the full reward for a clean run", () => {
    expect(computeReward(200, 0)).toBe(200);
  });

  it("takes a quarter off per wrong attempt", () => {
    expect(computeReward(200, 1)).toBe(150);
    expect(computeReward(200, 2)).toBe(100);
  });

  it("never drops below a quarter of the reward", () => {
    expect(computeReward(200, MAX_HEARTS)).toBe(50);
    expect(computeReward(200, 10)).toBe(50);
  });
});

describe("mistakesFromReward", () => {
  it("recovers the attempt count from the earned score", () => {
    for (const level of levels) {
      for (let mistakes = 0; mistakes < MAX_HEARTS; mistakes += 1) {
        expect(mistakesFromReward(level.reward, computeReward(level.reward, mistakes))).toBe(
          mistakes,
        );
      }
    }
  });
});

describe("rankFor", () => {
  it("returns the top rank for a perfect run and the last one for zero", () => {
    expect(rankFor(100, copy.ranks)).toBe(copy.ranks[0]);
    expect(rankFor(0, copy.ranks)).toBe(copy.ranks[copy.ranks.length - 1]);
  });

  it("is reachable without a flawless run", () => {
    const maxScore = levels.reduce((sum, level) => sum + level.reward, 0);
    const oneSlip = levels.reduce(
      (sum, level, index) => sum + computeReward(level.reward, index === 0 ? 1 : 0),
      0,
    );
    expect(rankFor(percentOf(oneSlip, maxScore), copy.ranks)).toBe(copy.ranks[0]);
  });
});

describe("level content", () => {
  it("has six missions with growing rewards", () => {
    expect(levels).toHaveLength(6);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index].reward).toBeGreaterThan(levels[index - 1].reward);
    }
  });

  it("keeps every challenge solvable", () => {
    for (const level of levels) {
      const challenge = level.challenge;

      if (challenge.kind === "ordering") {
        expect([...challenge.correctOrder].sort()).toEqual(
          challenge.items.map((item) => item.id).sort(),
        );
      }

      if (challenge.kind === "fill-blank") {
        const blanks = challenge.segments.filter((segment) => segment.type === "blank");
        expect(blanks.length).toBeGreaterThan(0);
        for (const blank of blanks) {
          expect(blank.options.map((option) => option.value)).toContain(blank.answer);
        }
      }

      if (challenge.kind === "timeline") {
        for (const line of challenge.lines) {
          expect(challenge.timestamps).toContain(challenge.correct[line.id]);
        }
        expect(challenge.totalOptions).toContain(challenge.totalSeconds);
      }

      if (challenge.kind === "choice") {
        expect(challenge.options.map((option) => option.id)).toContain(challenge.correct);
        if (challenge.fix) {
          expect(challenge.fix.options.map((option) => option.id)).toContain(challenge.fix.correct);
        }
      }
    }
  });
});
