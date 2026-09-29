import type { Completion, Progress } from './answers';
import { BELTS, type Belt } from './boxes';
import { dojoRoom, type DojoRoom, type RackGame, type RackRecord, type RoomPlaque, type BonsaiStage } from './dojo';
import { gearById } from './gear';
import { ROWS, type RowId, type Script } from './kana';
import { kataId } from './kata';
import { overallRank } from './rank';
import type { Rng } from './random';

// Friends: names, friend codes, and the summary a friend can see. Friends are added by code;
// nobody can be searched for. A summary comes from someone else's phone, so reading one
// checks every part of it, like a save.

export const NAME_MAX = 20;
export const FRIEND_CODE_LENGTH = 6;
// No I, O, 0 or 1, which are easy to mix up.
const CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SCROLL_NAME_MAX = 40;
const PLAQUE_KANA_MAX = 12;

// A name as it's kept: trimmed, with runs of spaces made single.
export function normalizeName(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function isValidName(text: string): boolean {
  const name = normalizeName(text);
  // Counted in characters, not UTF-16 units, so けんじ is 3.
  return [...name].length >= 1 && [...name].length <= NAME_MAX && !/[\u0000-\u001f\u007f]/.test(text.trim());
}

export function makeFriendCode(rng: Rng): string {
  return Array.from({ length: FRIEND_CODE_LENGTH }, () => CODE_CHARACTERS[Math.floor(rng() * CODE_CHARACTERS.length)] ?? 'A').join('');
}

// A typed code without its spaces and dashes, in capitals.
export function normalizeFriendCode(text: string): string {
  return text.replace(/[\s-]+/g, '').toUpperCase();
}

export function isFriendCode(text: string): boolean {
  const code = normalizeFriendCode(text);
  return code.length === FRIEND_CODE_LENGTH && [...code].every((c) => CODE_CHARACTERS.includes(c));
}

// Shown in two halves, "7Q4-MKX", so it's easy to read out.
export function formatFriendCode(code: string): string {
  const half = FRIEND_CODE_LENGTH / 2;
  return `${code.slice(0, half)}-${code.slice(half)}`;
}

// What a friend can see: rank, streak, today's training (for partner assignments), the gear
// Karasu wears, and the dojo room. `day` is the day it was made for, so it reads as nothing
// done today once that day has passed.
export type FriendSummary = {
  day: string;
  rank: Belt;
  streak: number;
  xpToday: number;
  lessonsToday: number;
  kataToday: boolean;
  gear: string[];
  room: DojoRoom;
};

const isGame = (c: Completion) => c.lesson.startsWith('game:');
const isLesson = (c: Completion) => !isGame(c) && !c.lesson.startsWith('exam:') && !c.lesson.startsWith('duel:');

// The learner's summary. `days` gives the day of each finished lesson or game, and the streak
// and moons are worked out outside the engine (they need the device's timezone).
export function friendSummary(
  progress: Progress,
  { days, today, streak, moons }: { days: readonly string[]; today: string; streak: number; moons: number },
): FriendSummary {
  const todays = progress.completed.filter((_, i) => days[i] === today);
  const lessons = todays.filter(isLesson);
  return {
    day: today,
    rank: overallRank(progress),
    streak,
    xpToday: lessons.reduce((sum, c) => sum + (c.score ?? 0), 0),
    lessonsToday: lessons.length,
    kataToday: todays.some((c) => c.lesson === kataId(today)),
    gear: [...progress.settings.gear],
    room: dojoRoom(progress, { streak, moons }),
  };
}

// A friend's training today, going by their summary: nothing, if it was made on another day.
export function friendToday(summary: FriendSummary, today: string): { xp: number; lessons: number; kata: boolean } {
  if (summary.day !== today) return { xp: 0, lessons: 0, kata: false };
  return { xp: summary.xpToday, lessons: summary.lessonsToday, kata: summary.kataToday };
}

// Checking a summary from another phone. `unknown` could be anything, so every part is
// narrowed before it's trusted: anything wrong at the top level rejects it, and odd entries in
// lists are dropped.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isBelt(value: unknown): value is Belt {
  return typeof value === 'string' && (BELTS as readonly string[]).includes(value);
}

function isDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function short(value: unknown, max: number): string | null {
  return typeof value === 'string' ? [...value].slice(0, max).join('') : null;
}

function readPlaque(value: unknown): RoomPlaque | null {
  if (!isObject(value)) return null;
  const { script, row, kana, belt } = value;
  if (script !== 'hiragana' && script !== 'katakana') return null;
  if (typeof row !== 'string' || !(ROWS as readonly string[]).includes(row) || !isBelt(belt)) return null;
  const text = short(kana, PLAQUE_KANA_MAX);
  if (text === null) return null;
  return { script: script as Script, row: row as RowId, kana: text, belt };
}

const RACK_GAMES: readonly RackGame[] = ['rain', 'dungeon', 'taiko', 'memory'];

function readRack(value: unknown): RackRecord[] {
  const saved = Array.isArray(value) ? value.filter(isObject) : [];
  // Always the four games, in order; a missing or odd record is an empty slot.
  return RACK_GAMES.map((game) => {
    const record = saved.find((r) => r.game === game);
    return { game, value: record && isCount(record.value) ? record.value : null };
  });
}

function readRoom(value: unknown): DojoRoom | null {
  if (!isObject(value)) return null;
  const { plaques, rowCount, scroll, scrollsWon, rack, bonsai, lanterns } = value;
  if (!Array.isArray(plaques) || !isCount(rowCount) || !isCount(scrollsWon) || !isCount(lanterns)) return null;
  if (!isCount(bonsai) || bonsai > 4) return null;
  let readScroll: DojoRoom['scroll'] = null;
  if (isObject(scroll) && Array.isArray(scroll.kana)) {
    const [a, b] = scroll.kana.map((k) => short(k, 2));
    const name = short(scroll.name, SCROLL_NAME_MAX);
    if (a && b && name !== null) readScroll = { kana: [a, b], name };
  }
  return {
    plaques: plaques.map(readPlaque).filter((p): p is RoomPlaque => p !== null),
    rowCount,
    scroll: readScroll,
    scrollsWon,
    rack: readRack(rack),
    bonsai: bonsai as BonsaiStage,
    lanterns,
  };
}

export function parseFriendSummary(value: unknown): FriendSummary | null {
  if (!isObject(value)) return null;
  const { day, rank, streak, xpToday, lessonsToday, kataToday, gear } = value;
  if (!isDay(day) || !isBelt(rank) || !isCount(streak) || !isCount(xpToday) || !isCount(lessonsToday)) return null;
  if (typeof kataToday !== 'boolean') return null;
  const room = readRoom(value.room);
  if (!room) return null;
  return {
    day,
    rank,
    streak,
    xpToday,
    lessonsToday,
    kataToday,
    gear: Array.isArray(gear) ? gear.filter((id): id is string => typeof id === 'string' && gearById(id) !== null) : [],
    room,
  };
}

// Someone you're linked to: a friend, or a request either way.
export type Link = {
  userId: string;
  name: string;
  // accepted: friends. incoming: they asked you. outgoing: you asked them.
  state: 'accepted' | 'incoming' | 'outgoing';
};

// Something another learner did that's worth telling you about: they asked to be your friend,
// or they accepted your request. What you did yourself isn't news.
export type FriendNews = { kind: 'request' | 'accepted'; userId: string; name: string };

// The news between two loads of the list, in the order of the newer one.
export function linkNews(before: readonly Link[], after: readonly Link[]): FriendNews[] {
  const was = new Map(before.map((l) => [l.userId, l.state]));
  return after.flatMap((l): FriendNews[] => {
    const then = was.get(l.userId);
    if (l.state === 'incoming' && then !== 'incoming') return [{ kind: 'request', userId: l.userId, name: l.name }];
    if (l.state === 'accepted' && then === 'outgoing') return [{ kind: 'accepted', userId: l.userId, name: l.name }];
    return [];
  });
}

// Requests waiting for your answer.
export function waitingRequests(links: readonly Link[]): number {
  return links.filter((l) => l.state === 'incoming').length;
}
