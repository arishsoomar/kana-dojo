import type { Progress } from './answers';
import { makeChoices } from './choices';
import type { Kana, Script } from './kana';
import { pickNext } from './pick';
import type { Rng } from './random';

// The Taiko drill: kana ride down a track to a festival drumbeat, and the learner hits the
// right sound as each reaches the ring. Time here is milliseconds from the start of the song.

export const SONG_NAME = 'Tanuki matsuri';

// Where a script's scores are saved.
export function taikoId(script: Script): string {
  return `game:taiko:${script}`;
}

export const TAIKO_BPM = 100;
export const BEAT_MS = 60_000 / TAIKO_BPM; // 600
export const TAIKO_NOTES = 48;
const COUNT_IN_BEATS = 4; // beats before the first note, to feel the tempo
const WARM_UP_NOTES = 16; // the first notes come every other beat
// The whole song, in beats: the last note, then a little to finish. (scripts/make-sounds.mjs
// writes the drum track to this length, at this tempo.)
export const SONG_BEATS = COUNT_IN_BEATS + 2 * WARM_UP_NOTES + (TAIKO_NOTES - WARM_UP_NOTES) + 3;

// How close to the beat a hit must be, either way, for each judgement.
export const WINDOWS = { perfect: 90, good: 180, ok: 280 } as const;

export type Judgement = 'perfect' | 'good' | 'ok' | 'miss';

// The beat each note lands on: every other beat to warm up, then every beat.
export function chartBeats(): number[] {
  return Array.from({ length: TAIKO_NOTES }, (_, i) =>
    i < WARM_UP_NOTES ? COUNT_IN_BEATS + 2 * i : COUNT_IN_BEATS + 2 * WARM_UP_NOTES + (i - WARM_UP_NOTES),
  );
}

// The judgement for a hit this far from the beat (negative = early), or null if it's too far
// to count as aimed at that note.
export function judge(errorMs: number): Exclude<Judgement, 'miss'> | null {
  const off = Math.abs(errorMs);
  if (off <= WINDOWS.perfect) return 'perfect';
  if (off <= WINDOWS.good) return 'good';
  if (off <= WINDOWS.ok) return 'ok';
  return null;
}

const POINTS: Readonly<Record<Judgement, number>> = { perfect: 300, good: 150, ok: 50, miss: 0 };
const COMBO_BONUS = 10; // per note of combo before the hit

// What a hit scores, with `combo` notes hit in a row before it.
export function taikoPoints(judgement: Judgement, combo: number): number {
  return judgement === 'miss' ? 0 : POINTS[judgement] + COMBO_BONUS * combo;
}

// One note: its kana, the three sounds to pick from, the moment it reaches the ring, and how
// it went (null until judged), with the kana hit for it if that was wrong.
export type Note = { id: number; kana: Kana; choices: Kana[]; at: number; result: Judgement | null; guess: Kana | null };

export type TaikoState = {
  notes: Note[];
  score: number;
  combo: number;
  bestCombo: number;
  hits: number; // notes hit with the right sound
  done: boolean;
};

// A song's notes: a kana for each beat of the chart from `pool` (weaker ones more often, never
// the same twice in a row), each with three sounds to pick from.
export function startTaiko(progress: Progress, pool: readonly Kana[], rng: Rng): TaikoState {
  let last: Kana | null = null;
  const notes = chartBeats().map((beat, id) => {
    const options = pool.length > 1 ? pool.filter((k) => k !== last) : pool;
    const kana = pickNext(progress, options, rng);
    last = kana;
    return { id, kana, choices: makeChoices(kana, pool, rng, 3), at: beat * BEAT_MS, result: null, guess: null };
  });
  return { notes, score: 0, combo: 0, bestCombo: 0, hits: 0, done: false };
}

// The next note still to be judged, or null.
export function nextNote(state: TaikoState): Note | null {
  return state.notes.find((n) => n.result === null) ?? null;
}

// Judges a note, updating the score and combo.
function withResult(state: TaikoState, note: Note, judgement: Judgement, guess: Kana | null): TaikoState {
  const notes = state.notes.map((n) => (n.id === note.id ? { ...n, result: judgement, guess } : n));
  const hit = judgement !== 'miss';
  const combo = hit ? state.combo + 1 : 0;
  return {
    notes,
    score: state.score + taikoPoints(judgement, state.combo),
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    hits: state.hits + (hit ? 1 : 0),
    done: notes.every((n) => n.result !== null),
  };
}

export type Judged = { note: Note; judgement: Judgement; correct: boolean; guess: Kana };

// A tap on a sound at `time`. It's aimed at the next note: if that note is close enough, the
// right sound is judged by timing and the wrong one is a miss. A tap far too early does nothing.
export function tapTaiko(state: TaikoState, time: number, kana: Kana): { state: TaikoState; judged: Judged | null } {
  const note = nextNote(state);
  if (!note) return { state, judged: null };
  const judgement = judge(time - note.at);
  if (judgement === null) return { state, judged: null };
  const correct = kana === note.kana;
  const result = correct ? judgement : 'miss';
  return {
    state: withResult(state, note, result, correct ? null : kana),
    judged: { note, judgement: result, correct, guess: kana },
  };
}

// Misses every note that has gone past the ring without a hit.
export function sweepTaiko(state: TaikoState, time: number): { state: TaikoState; missed: Note[] } {
  const missed = state.notes.filter((n) => n.result === null && time > n.at + WINDOWS.ok);
  const next = missed.reduce((s, note) => withResult(s, note, 'miss', null), state);
  return { state: next, missed };
}
