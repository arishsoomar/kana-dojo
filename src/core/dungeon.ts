import type { Script } from './kana';
import type { Rng } from './random';

// The Yokai dungeon: a run down floor after floor of yokai. Each yokai shows a kana, and a
// right answer is a strike. Too slow or wrong, and it attacks. Between floors the learner
// takes one of three charms. This file holds only the rules; which kana each yokai shows
// comes from the learner's own kana, chosen by the screen with pickNext.

export const MAX_HEARTS = 5;
export const DUNGEON_MIN_KANA = 5; // met kana needed in a script before its dungeon opens
export const CLEAN_MS = 1500; // a right answer quicker than this is a clean strike
export const HINTS_PER_FLOOR = 3; // with the hint scroll

// Where a script's deepest floor is saved, as a finished game with the floor as its score.
export function dungeonId(script: Script): string {
  return `game:dungeon:${script}`;
}

export type Charm = 'lantern' | 'tea' | 'hint' | 'bokken' | 'omamori';
export type Rarity = 'common' | 'rare' | 'epic';

export const CHARMS: Readonly<Record<Charm, { name: string; rarity: Rarity; about: string }>> = {
  lantern: { name: 'Paper lantern', rarity: 'common', about: 'Enemies attack 20% slower.' },
  tea: { name: 'Healing tea', rarity: 'common', about: 'Get 2 hearts back.' },
  hint: { name: 'Hint scroll', rarity: 'rare', about: 'Reveal the first letter of an answer, three times per floor.' },
  bokken: { name: 'Sharp bokken', rarity: 'rare', about: 'Clean strikes hit twice as hard.' },
  omamori: { name: 'Lucky omamori', rarity: 'epic', about: "Your first mistake on each floor doesn't cost a heart." },
};

// How often each rarity is offered, compared with the others.
const RARITY_WEIGHT: Readonly<Record<Rarity, number>> = { common: 3, rare: 2, epic: 1 };

// The kinds of yokai, for their names above the HP bar ("oni", "kappa").
const YOKAI_NAMES = ['oni', 'kappa', 'tengu', 'kitsune', 'tanuki', 'nue', 'baku', 'kodama'] as const;

export type Enemy = { name: string; hp: number; maxHp: number };

export type Run = {
  floor: number;
  hearts: number;
  charms: Charm[]; // kept charms (healing tea is used at once, so it isn't kept)
  enemiesLeft: number; // on this floor, counting the one being fought
  enemy: Enemy;
  hintsLeft: number; // on this floor
  shieldReady: boolean; // the omamori hasn't taken this floor's first mistake yet
  over: boolean;
};

// What a floor holds: 3 yokai on floor 1 and one more each floor, up to 6; each with 1 HP,
// and one more every 3 floors, up to 3.
export function floorPlan(floor: number): { enemies: number; hp: number } {
  return { enemies: Math.min(2 + floor, 6), hp: Math.min(1 + Math.floor((floor - 1) / 3), 3) };
}

// How long a yokai waits before it attacks: 5 seconds on floor 1, 8% less each floor, never
// under 2 seconds. The paper lantern makes it 20% longer.
export function attackMs(floor: number, charms: readonly Charm[]): number {
  const wait = Math.max(5000 * 0.92 ** (floor - 1), 2000);
  return Math.round(wait * (charms.includes('lantern') ? 1.2 : 1));
}

function newEnemy(floor: number, rng: Rng): Enemy {
  const { hp } = floorPlan(floor);
  // Safe: the index is within the list.
  return { name: YOKAI_NAMES[Math.floor(rng() * YOKAI_NAMES.length)]!, hp, maxHp: hp };
}

// A floor's starting state, for a run arriving on it.
function enterFloor(run: Run, floor: number, rng: Rng): Run {
  return {
    ...run,
    floor,
    enemiesLeft: floorPlan(floor).enemies,
    enemy: newEnemy(floor, rng),
    hintsLeft: run.charms.includes('hint') ? HINTS_PER_FLOOR : 0,
    shieldReady: run.charms.includes('omamori'),
  };
}

export function startRun(rng: Rng): Run {
  const empty: Run = {
    floor: 1,
    hearts: MAX_HEARTS,
    charms: [],
    enemiesLeft: 0,
    enemy: { name: '', hp: 0, maxHp: 0 },
    hintsLeft: 0,
    shieldReady: false,
    over: false,
  };
  return enterFloor(empty, 1, rng);
}

// What an answer did: a strike on the yokai, or the yokai's attack on the learner.
export type Blow =
  | { kind: 'strike'; clean: boolean; damage: number; defeated: boolean; floorCleared: boolean }
  | { kind: 'hurt'; shielded: boolean; over: boolean };

// An answer, or null when the yokai attacked before one was given.
export function answerRun(run: Run, answer: { correct: boolean; ms: number } | null, rng: Rng): { run: Run; blow: Blow } {
  if (run.over) return { run, blow: { kind: 'hurt', shielded: false, over: true } };

  if (answer?.correct) {
    const clean = answer.ms < CLEAN_MS;
    const damage = clean && run.charms.includes('bokken') ? 2 : 1;
    const hp = Math.max(run.enemy.hp - damage, 0);
    if (hp > 0) {
      return { run: { ...run, enemy: { ...run.enemy, hp } }, blow: { kind: 'strike', clean, damage, defeated: false, floorCleared: false } };
    }
    const enemiesLeft = run.enemiesLeft - 1;
    const floorCleared = enemiesLeft === 0;
    const enemy = floorCleared ? { ...run.enemy, hp: 0 } : newEnemy(run.floor, rng);
    return { run: { ...run, enemiesLeft, enemy }, blow: { kind: 'strike', clean, damage, defeated: true, floorCleared } };
  }

  // Wrong, or too slow: the yokai attacks, unless the omamori takes it.
  if (run.shieldReady) return { run: { ...run, shieldReady: false }, blow: { kind: 'hurt', shielded: true, over: false } };
  const hearts = run.hearts - 1;
  const over = hearts <= 0;
  return { run: { ...run, hearts, over }, blow: { kind: 'hurt', shielded: false, over } };
}

// Up to three charms to choose from after a floor, all different: any not already kept (and
// healing tea, which can be taken again), rarer ones less often.
export function charmChoices(run: Run, rng: Rng): Charm[] {
  let left = (Object.keys(CHARMS) as Charm[]).filter((c) => c === 'tea' || !run.charms.includes(c));
  const chosen: Charm[] = [];
  while (chosen.length < 3 && left.length > 0) {
    const total = left.reduce((sum, c) => sum + RARITY_WEIGHT[CHARMS[c].rarity], 0);
    let at = rng() * total;
    // Safe: the list isn't empty; the fallback covers rounding at the very end.
    let pick = left[left.length - 1]!;
    for (const c of left) {
      at -= RARITY_WEIGHT[CHARMS[c].rarity];
      if (at < 0) {
        pick = c;
        break;
      }
    }
    chosen.push(pick);
    left = left.filter((c) => c !== pick);
  }
  return chosen;
}

// Takes a charm and goes down to the next floor. Healing tea is drunk at once.
export function takeCharm(run: Run, charm: Charm, rng: Rng): Run {
  const taken =
    charm === 'tea' ? { ...run, hearts: Math.min(run.hearts + 2, MAX_HEARTS) } : { ...run, charms: [...run.charms, charm] };
  return enterFloor(taken, run.floor + 1, rng);
}

// Uses one of this floor's hints, if there are any left.
export function spendHint(run: Run): Run {
  return run.hintsLeft > 0 ? { ...run, hintsLeft: run.hintsLeft - 1 } : run;
}
