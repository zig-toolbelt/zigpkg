import { MAX_HEARTS, computeReward } from "./scoring";
import { sound } from "./sound";

export type RunnerStatus = "input" | "wrong" | "correct" | "revealed";

export class ChallengeRunner {
  #reward: number;

  mistakes = $state(0);
  status = $state<RunnerStatus>("input");

  constructor(reward: number) {
    this.#reward = reward;
  }

  get hearts(): number {
    return Math.max(MAX_HEARTS - this.mistakes, 0);
  }

  get outOfHearts(): boolean {
    return this.hearts === 0;
  }

  get locked(): boolean {
    return this.status !== "input";
  }

  get resolved(): boolean {
    return this.status === "correct" || this.status === "revealed";
  }

  get earned(): number {
    return computeReward(this.#reward, this.mistakes);
  }

  succeed(): void {
    this.status = "correct";
    sound.correct();
  }

  fail(): void {
    this.mistakes += 1;
    this.status = "wrong";
    sound.wrong();
  }

  retry(): void {
    this.status = "input";
    sound.tap();
  }

  reveal(): void {
    this.status = "revealed";
    sound.reveal();
  }

  nextStage(): void {
    this.status = "input";
  }
}
