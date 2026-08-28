import { browser } from "$app/environment";

import { loadMuted, saveMuted } from "./storage";

type Note = {
  freq: number;
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
};

let context: AudioContext | null = null;
let muted: boolean | null = null;

function audioContext(): AudioContext | null {
  if (!browser || isMuted()) return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function play(notes: Note[]): void {
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  for (const { freq, at = 0, dur = 0.12, type = "triangle", gain = 0.05 } of notes) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const start = now + at;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

export const sound = {
  tap: () => play([{ freq: 520, dur: 0.05, gain: 0.025, type: "square" }]),
  place: () => play([{ freq: 680, dur: 0.07, gain: 0.03 }]),
  undo: () => play([{ freq: 300, dur: 0.07, gain: 0.03, type: "sine" }]),
  correct: () =>
    play([
      { freq: 660, dur: 0.1 },
      { freq: 880, at: 0.09, dur: 0.14 },
      { freq: 1320, at: 0.18, dur: 0.2, gain: 0.035 },
    ]),
  wrong: () =>
    play([
      { freq: 200, dur: 0.16, type: "sawtooth", gain: 0.035 },
      { freq: 150, at: 0.1, dur: 0.22, type: "sawtooth", gain: 0.03 },
    ]),
  reveal: () =>
    play([
      { freq: 440, dur: 0.12, type: "sine" },
      { freq: 587, at: 0.11, dur: 0.16, type: "sine" },
    ]),
  levelUp: () =>
    play([
      { freq: 523, dur: 0.11 },
      { freq: 659, at: 0.1, dur: 0.11 },
      { freq: 784, at: 0.2, dur: 0.13 },
      { freq: 1047, at: 0.3, dur: 0.26, gain: 0.04 },
    ]),
  finish: () =>
    play([
      { freq: 523, dur: 0.14 },
      { freq: 659, at: 0.13, dur: 0.14 },
      { freq: 784, at: 0.26, dur: 0.14 },
      { freq: 1047, at: 0.39, dur: 0.18 },
      { freq: 1319, at: 0.54, dur: 0.42, gain: 0.045 },
    ]),
};

export function isMuted(): boolean {
  if (muted === null) muted = loadMuted();
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  saveMuted(next);
  if (next && context) {
    void context.close();
    context = null;
  }
}
