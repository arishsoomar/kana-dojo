import type { Progress } from './answers';
import { makeChoices } from './choices';
import { KANA, type Kana } from './kana';
import type { Question } from './question';
import { seededRng, type Rng } from './random';

// Live duels: two phones, one room code, the same kana on both screens. The phones talk through
// a Realtime channel named after the room (see src/hooks/use-live-duel.ts); everything here is
// the rules, so both phones agree on them without a game server.

export const ROOM_CODE_LENGTH = 4;
// Letters for room codes: no I or O, which are easy to mix up with 1 and 0.
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

// Fewest kana both players must have met.
export const LIVE_MIN_SHARED = 5;
// A round's time limit.
export const LIVE_ROUND_MS = 6000;
// Points to win.
export const LIVE_WIN = 7;
// The 3-2-1 before the first kana, and how long each round's result shows.
export const LIVE_COUNTDOWN_MS = 3000;
export const LIVE_REVEAL_MS = 1200;
// Questions worked out ahead: more than any duel can use (rounds nobody takes don't end it,
// so this is generous).
const LIVE_QUESTIONS = 60;

export function makeRoomCode(rng: Rng): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () => CODE_LETTERS[Math.floor(rng() * CODE_LETTERS.length)] ?? 'A').join('');
}

// A typed code, upper case and without spaces.
export function normalizeRoomCode(text: string): string {
  return text.replace(/\s+/g, '').toUpperCase();
}

export function isRoomCode(text: string): boolean {
  const code = normalizeRoomCode(text);
  return code.length === ROOM_CODE_LENGTH && [...code].every((c) => CODE_LETTERS.includes(c));
}

// The kana both players have met (given as their characters), in chart order, so both phones
// get the same list whichever way round they're given.
export function sharedKana(mine: readonly string[], theirs: readonly string[]): Kana[] {
  const a = new Set(mine);
  const b = new Set(theirs);
  return KANA.filter((k) => a.has(k.char) && b.has(k.char));
}

// The duel's questions, worked out from the room code, so both phones ask the same ones in the
// same order without sending them. No kana comes twice in a row; choices come from the shared
// kana. None, with too few kana in common.
export function liveQuestions(code: string, pool: readonly Kana[]): Question[] {
  if (pool.length < LIVE_MIN_SHARED) return [];
  const rng = seededRng(`live:${code}`);
  const questions: Question[] = [];
  let previous: Kana | null = null;
  while (questions.length < LIVE_QUESTIONS) {
    const options = pool.filter((k) => k !== previous);
    // Safe: the pool has at least LIVE_MIN_SHARED kana, so options is never empty.
    const kana = options[Math.floor(rng() * options.length)]!;
    questions.push({ kana, choices: makeChoices(kana, pool, rng) });
    previous = kana;
  }
  return questions;
}

// One player's go at a round: right or wrong, and how long it took on their own phone.
export type Attempt = { correct: boolean; ms: number };
export type RoundResult = 'mine' | 'theirs' | 'both' | 'none';

// Who takes the round: the right answer with the quicker time. Each time is measured on its own
// phone from when the kana appeared there, so a slow connection doesn't cost the point.
export function settleRound(mine: Attempt, theirs: Attempt): RoundResult {
  if (!mine.correct && !theirs.correct) return 'none';
  if (!theirs.correct) return 'mine';
  if (!mine.correct) return 'theirs';
  if (mine.ms === theirs.ms) return 'both';
  return mine.ms < theirs.ms ? 'mine' : 'theirs';
}

// A round left unanswered until the time limit.
export function timedOut(): Attempt {
  return { correct: false, ms: LIVE_ROUND_MS };
}

// Whether a player still thinking has already lost the round: the other got it right in less
// time than has now passed. Their phone then gives up the round, so nobody waits.
export function cantWin(theirs: Attempt, myElapsed: number): boolean {
  return theirs.correct && myElapsed >= theirs.ms;
}

export type LiveScore = { mine: number; theirs: number };

export function addRound(score: LiveScore, result: RoundResult): LiveScore {
  return {
    mine: score.mine + (result === 'mine' || result === 'both' ? 1 : 0),
    theirs: score.theirs + (result === 'theirs' || result === 'both' ? 1 : 0),
  };
}

export type LiveOutcome = 'going' | 'won' | 'lost' | 'draw';

export function liveOutcome(score: LiveScore): LiveOutcome {
  const won = score.mine >= LIVE_WIN;
  const lost = score.theirs >= LIVE_WIN;
  if (won && lost) return 'draw';
  if (won) return 'won';
  if (lost) return 'lost';
  return 'going';
}

// What the phones send each other: hello (with the kana this player has met), an answer to a
// round, leaving, or a rematch in a new room.
export type LiveMessage =
  | { type: 'hello'; met: string[] }
  | { type: 'answer'; round: number; correct: boolean; ms: number }
  | { type: 'leave' }
  | { type: 'rematch'; code: string };

const KANA_CHARS = new Set(KANA.map((k) => k.char));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// A message from the other phone, checked before it's trusted (it could be anything), or null.
export function parseLiveMessage(value: unknown): LiveMessage | null {
  if (!isObject(value)) return null;
  switch (value.type) {
    case 'hello':
      if (!Array.isArray(value.met)) return null;
      return { type: 'hello', met: value.met.filter((c): c is string => typeof c === 'string' && KANA_CHARS.has(c)) };
    case 'answer': {
      const { round, correct, ms } = value;
      if (typeof round !== 'number' || !Number.isInteger(round) || round < 0) return null;
      if (typeof correct !== 'boolean' || typeof ms !== 'number' || !Number.isFinite(ms)) return null;
      return { type: 'answer', round, correct, ms: Math.min(Math.max(ms, 0), LIVE_ROUND_MS) };
    }
    case 'leave':
      return { type: 'leave' };
    case 'rematch':
      return typeof value.code === 'string' && isRoomCode(value.code) ? { type: 'rematch', code: normalizeRoomCode(value.code) } : null;
    default:
      return null;
  }
}

// A duel as one phone sees it. `liveStep` moves it on by one event; `outbox` collects the
// messages to send, in order (the phone sends the ones it hasn't yet). Times are this phone's own
// clock, in milliseconds.
export type LiveState = {
  code: string;
  mine: readonly string[]; // the kana this player has met
  theirs: readonly string[] | null; // the other player's, once their hello arrives
  phase: 'waiting' | 'countdown' | 'playing' | 'reveal' | 'over' | 'too-few';
  questions: Question[];
  round: number;
  shownAt: number; // when this round's kana appeared
  phaseEnds: number; // when the countdown or the reveal ends
  myAttempt: Attempt | null;
  theirAttempts: Readonly<Record<number, Attempt>>; // by round, since one can arrive early
  score: LiveScore;
  lastResult: RoundResult | null;
  outbox: LiveMessage[];
};

export type LiveEvent =
  | { type: 'joined' } // the other player has arrived in the room
  | { type: 'message'; message: LiveMessage; now: number }
  | { type: 'tap'; correct: boolean; now: number }
  | { type: 'tick'; now: number };

export function startLive(code: string, met: readonly string[]): LiveState {
  return {
    code,
    mine: met,
    theirs: null,
    phase: 'waiting',
    questions: [],
    round: 0,
    shownAt: 0,
    phaseEnds: 0,
    myAttempt: null,
    theirAttempts: {},
    score: { mine: 0, theirs: 0 },
    lastResult: null,
    outbox: [],
  };
}

const helloFrom = (s: LiveState): LiveMessage => ({ type: 'hello', met: [...s.mine] });

// Records this player's attempt at the round and sends it.
function attempt(s: LiveState, mine: Attempt, now: number): LiveState {
  const sent: LiveMessage = { type: 'answer', round: s.round, correct: mine.correct, ms: mine.ms };
  return settle({ ...s, myAttempt: mine, outbox: [...s.outbox, sent] }, now);
}

// Once both attempts at the round are in: the point, then the reveal, or the end.
function settle(s: LiveState, now: number): LiveState {
  const theirs = s.theirAttempts[s.round];
  if (!s.myAttempt || !theirs) return s;
  const result = settleRound(s.myAttempt, theirs);
  const score = addRound(s.score, result);
  const over = liveOutcome(score) !== 'going';
  return { ...s, score, lastResult: result, phase: over ? 'over' : 'reveal', phaseEnds: now + LIVE_REVEAL_MS };
}

function nextRound(s: LiveState, now: number): LiveState {
  // Rounds nobody takes don't end the duel, so in theory it could outlast its questions.
  if (s.round + 1 >= s.questions.length) return { ...s, phase: 'over' };
  return { ...s, phase: 'playing', round: s.round + 1, shownAt: now, myAttempt: null, lastResult: null };
}

// Moves the duel on by one event.
export function liveStep(s: LiveState, event: LiveEvent): LiveState {
  switch (event.type) {
    case 'joined':
      return { ...s, outbox: [...s.outbox, helloFrom(s)] };

    case 'message': {
      const { message, now } = event;
      if (message.type === 'hello') {
        if (s.theirs !== null) return s;
        // Say hello back, in case ours went out before they were listening.
        const next = { ...s, theirs: message.met, outbox: [...s.outbox, helloFrom(s)] };
        const questions = liveQuestions(s.code, sharedKana(s.mine, message.met));
        if (questions.length === 0) return { ...next, phase: 'too-few' };
        return { ...next, questions, phase: 'countdown', phaseEnds: now + LIVE_COUNTDOWN_MS };
      }
      if (message.type === 'answer') {
        if (message.round < s.round || s.theirAttempts[message.round]) return s;
        const theirAttempts = { ...s.theirAttempts, [message.round]: { correct: message.correct, ms: message.ms } };
        return s.phase === 'playing' ? settle({ ...s, theirAttempts }, now) : { ...s, theirAttempts };
      }
      // Leaving and rematches are about the connection, not the duel.
      return s;
    }

    case 'tap':
      if (s.phase !== 'playing' || s.myAttempt) return s;
      return attempt(s, { correct: event.correct, ms: event.now - s.shownAt }, event.now);

    case 'tick': {
      const { now } = event;
      if (s.phase === 'countdown' && now >= s.phaseEnds) {
        return { ...s, phase: 'playing', round: 0, shownAt: now, myAttempt: null };
      }
      if (s.phase === 'reveal' && now >= s.phaseEnds) return settleEarly(nextRound(s, now), now);
      if (s.phase === 'playing' && !s.myAttempt) {
        const elapsed = now - s.shownAt;
        if (elapsed >= LIVE_ROUND_MS) return attempt(s, timedOut(), now);
        const theirs = s.theirAttempts[s.round];
        if (theirs && cantWin(theirs, elapsed)) return attempt(s, { correct: false, ms: elapsed }, now);
      }
      return s;
    }
  }
}

// A new round whose other answer is already in and can't be beaten is given up straight away.
function settleEarly(s: LiveState, now: number): LiveState {
  const theirs = s.theirAttempts[s.round];
  if (s.phase === 'playing' && theirs && cantWin(theirs, 0)) return attempt(s, { correct: false, ms: 0 }, now);
  return s;
}

// The record of a finished live duel: "game:" so it counts as a game, with both scores.
export function liveDuelId(code: string): string {
  return `game:live:${code}`;
}

export function completeLiveDuel(progress: Progress, code: string, now: number, score: LiveScore): Progress {
  return { ...progress, completed: [...progress.completed, { lesson: liveDuelId(code), at: now, score: score.mine, opponent: score.theirs }] };
}
