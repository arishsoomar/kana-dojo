# src/core explained, line by line

A plain walkthrough of every file in `src/core/`, written as of story B4.
If the code changes after that, line numbers here may drift.

---

## Words used everywhere

- **Value**: a piece of data. `5` is a value, `'あ'` is a value, `true` is a value.
- **String**: text, written in quotes: `'shi'`.
- **Number**: a number: `4000`.
- **Boolean**: either `true` or `false`.
- **List (array)**: several values in order, in square brackets: `['a', 'ka', 'sa']`. Positions are counted from 0, so `'a'` is at position 0.
- **Object**: values stored under names, in curly braces: `{ box: 2, dueAt: 5000 }`. `box` and `dueAt` are **fields**. You read one with a dot: `progress.box`.
- **`const name = ...`**: gives a value a name. The name can't be pointed at a different value later.
- **`let name = ...`**: same, except the name *can* be given a new value later.
- **Function**: a named set of steps. It takes **parameters** (inputs) and **returns** a value (output).
- **`type`**: a description of what shape some data must have. TypeScript checks it and then deletes it. It does not exist when the app runs.
- **`export`**: lets other files use this thing.
- **`import`**: uses something another file exported.
- **`//`**: a comment. The computer ignores everything after it on that line. It's for people.

---

## kana.ts: the 92 kana and facts about them

**Line 1**
```ts
export type Script = 'hiragana' | 'katakana';
```
Makes a type called `Script`. A `Script` can only be the exact text `'hiragana'` or the exact text `'katakana'`. `|` means "or". Anything else is an error.

**Line 3**: a comment.

**Line 4**
```ts
export const ROWS = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'] as const;
```
- A list of the ten row names, in the order they unlock, named `ROWS`.
- `as const` tells TypeScript to remember these exact ten strings in this exact order. Without it, TypeScript would only remember "a list of strings".

**Line 6**
```ts
export type RowId = (typeof ROWS)[number];
```
- Makes a type `RowId`.
- `typeof ROWS` means "the type of the `ROWS` list".
- `[number]` means "any one item from that list".
- So `RowId` means: one of `'a'`, `'ka'`, … `'wa'`. The names are written once (line 4), and this type is built from them.

**Lines 8–14**
```ts
export type Kana = {
  char: string;
  script: Script;
  row: RowId;
  romaji: readonly string[];
};
```
The shape of one kana. It must have four fields:
- `char`: the character itself, like `'し'`.
- `script`: `'hiragana'` or `'katakana'`.
- `row`: which row it's in, like `'sa'`.
- `romaji`: a list of spellings. `string[]` means "list of strings". `readonly` means nobody can change the list.

**Line 12**: a comment saying the first spelling is the main one and the rest are also accepted.

**Line 16**: a comment explaining what each line of the table below holds.

**Line 17**
```ts
const TABLE: readonly [RowId, string, string, ...string[]][] = [
```
- Makes a list named `TABLE`. No `export`, so only this file can use it.
- The part after `:` is its type. `[RowId, string, string, ...string[]]` describes **one line**: position 0 is a row name, position 1 is a string (hiragana), position 2 is a string (katakana), and `...string[]` means "then one or more strings" (the romaji).
- The `[]` at the end means "a list of those lines".

**Lines 18–27**: the data. 46 lines, one per sound. For example `['sa', 'し', 'シ', 'shi', 'si']` means: row `sa`, hiragana し, katakana シ, spellings `shi` and `si`.

**Line 28**: `];` closes the list.

**Lines 30–33**
```ts
export const KANA: readonly Kana[] = TABLE.flatMap(([row, hiragana, katakana, ...romaji]) => [
  { char: hiragana, script: 'hiragana', row, romaji },
  { char: katakana, script: 'katakana', row, romaji },
]);
```
- Makes `KANA`, a list of `Kana` objects, built from `TABLE`.
- `.flatMap(...)` goes through `TABLE` one line at a time. For each line it runs the function inside, which returns a small list. Then it joins all the small lists into one big list.
- `([row, hiragana, katakana, ...romaji]) =>` is the function. It takes one table line and splits it into named parts: position 0 becomes `row`, position 1 becomes `hiragana`, position 2 becomes `katakana`, and `...romaji` collects **everything left** into a list.
- The function returns **two** objects: one for the hiragana, one for the katakana. Both get the same `row` and `romaji`.
- `row,` on its own is short for `row: row`. Same for `romaji,`.
- 46 lines × 2 objects = 92 kana.

**Lines 35–38**
```ts
export function matchesRomaji(kana: Kana, input: string): boolean {
  const answer = input.trim().toLowerCase();
  return kana.romaji.includes(answer);
}
```
- A function named `matchesRomaji`. It takes a `Kana` and the text the learner typed. It returns `true` or `false`.
- `input.trim()` makes a copy of the text with spaces removed from the start and end.
- `.toLowerCase()` makes a copy with all capital letters made small.
- The result is named `answer`. Example: `' Shi '` becomes `'shi'`.
- `kana.romaji.includes(answer)` checks whether `answer` is in the kana's list of spellings. If yes, `true`. If no, `false`. `return` gives that back to whoever called the function.

**Line 40**: a comment.

**Lines 41–48**
```ts
export const LOOKALIKES: readonly (readonly string[])[] = [
  ['シ', 'ツ'],
  ...
];
```
- A list of groups. Each group is a list of kana that look similar.
- The type means "a list of (lists of strings)", and neither the inner lists nor the outer list can be changed.

**Lines 50–54**
```ts
export function lookalikesOf(char: string): string[] {
  return LOOKALIKES.filter((group) => group.includes(char)).flatMap((group) =>
    group.filter((other) => other !== char),
  );
}
```
- Takes one character. Returns a list of the characters that look like it.
- `LOOKALIKES.filter(...)` goes through every group and keeps only groups where `group.includes(char)` is `true`, meaning the group contains our character.
- `.flatMap(...)` then goes through the kept groups. For each group, `group.filter((other) => other !== char)` keeps every character that is **not** our character. `!==` means "is not equal to".
- `flatMap` joins the results into one list.
- Example: `lookalikesOf('ね')` keeps the group `['わ', 'ね', 'れ']`, removes `'ね'`, and returns `['わ', 'れ']`.
- If no group contains the character, nothing is kept, and the result is `[]`, an empty list.

---

## boxes.ts: boxes, waiting times, belts, "is it due"

**Lines 1–4**
```ts
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
```
Time is measured in **milliseconds**. 1000 milliseconds is one second. `*` means multiply. So `MINUTE` is 60000, `HOUR` is 3600000, `DAY` is 86400000. None are exported, so only this file uses them.

**Line 6**: a comment.

**Lines 7–16**
```ts
const INTERVALS: readonly number[] = [ 0, 30 * SECOND, 3 * MINUTE, ... 21 * DAY ];
```
A list of 8 numbers. The position in the list is the box number. `INTERVALS[0]` is `0`, `INTERVALS[1]` is 30 seconds, and so on up to `INTERVALS[7]`, which is 21 days. Each one is how long a kana in that box waits before it is asked again.

**Line 18**
```ts
export const MAX_BOX = INTERVALS.length - 1;
```
`.length` is how many items a list has: 8. Minus 1 gives 7. So `MAX_BOX` is 7, the highest box number.

**Lines 20–24**
```ts
export function intervalFor(box: number): number {
  const clamped = Math.min(Math.max(box, 0), MAX_BOX);
  return INTERVALS[clamped]!;
}
```
- Takes a box number, returns its waiting time.
- `Math.max(box, 0)` returns whichever is bigger, `box` or `0`. So anything below 0 becomes 0.
- `Math.min(..., MAX_BOX)` returns whichever is smaller. So anything above 7 becomes 7.
- `clamped` is now always between 0 and 7.
- `INTERVALS[clamped]` reads the item at that position.
- The `!` tells TypeScript "this is definitely not missing". TypeScript normally assumes reading from a list might give nothing. The comment on line 22 says why it's safe here.

**Line 26**: a comment.

**Line 27**
```ts
export const BELTS = ['white', 'green', 'brown', 'black'] as const;
```
The four belts, lowest first. `as const` works the same as on line 4 of `kana.ts`.

**Line 29**
```ts
export type Belt = (typeof BELTS)[number];
```
A `Belt` is one of `'white'`, `'green'`, `'brown'`, `'black'`. Built from `BELTS` the same way `RowId` is built from `ROWS`.

**Lines 31–36**
```ts
export function tierOf(box: number): Belt {
  if (box >= 7) return 'black';
  if (box >= 5) return 'brown';
  if (box >= 3) return 'green';
  return 'white';
}
```
- Takes a box number, returns a belt.
- `if (condition) return ...` means: if the condition is true, give back this value and stop the function right there.
- `>=` means "greater than or equal to".
- It checks from the top down. Box 7: `'black'`. Box 5 or 6: fails the first check, passes the second, `'brown'`. Box 3 or 4: `'green'`.
- If none passed (boxes 0, 1, 2), the last line runs: `'white'`.

**Lines 38–43**
```ts
export type KanaProgress = {
  box: number;
  dueAt: number;
};
```
The shape of the learner's progress on one kana:
- `box`: which box it's in.
- `dueAt`: the time it should next be asked, in milliseconds. This is the same kind of number `Date.now()` gives: milliseconds since 1 January 1970.

**Lines 45–47**
```ts
export function isDue(progress: KanaProgress, now: number): boolean {
  return now >= progress.dueAt;
}
```
- Takes a kana's progress and the current time.
- Returns `true` if the current time is equal to or later than the due time. Otherwise `false`.
- The current time is **given to** the function as `now`. The function never reads the clock itself.

---

## answers.ts: what happens when the learner answers

**Line 1**
```ts
import { intervalFor, isDue, MAX_BOX, type KanaProgress } from './boxes';
```
Brings in three things from `boxes.ts`. `type KanaProgress` brings in a type; the word `type` marks it as a type so it's removed when the app runs. `'./boxes'` means "the file `boxes.ts` in this same folder".

**Lines 3–6**
```ts
export type Confusion = { shown: string; guessed: string; };
```
The shape of one mistake: the kana that was shown, and the kana the learner picked instead.

**Lines 8–11**
```ts
export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
};
```
All of the learner's progress:
- `kana`: an object where each field name is a character and each value is that kana's `KanaProgress`. Example: `{ シ: { box: 2, dueAt: 5000 } }`. `Record<string, KanaProgress>` means "an object whose field names are strings and whose values are `KanaProgress`". `Readonly<...>` means its fields can't be changed.
- `confusions`: a list of every mistake. Can't be changed.

**Lines 13–18**
```ts
export type Answer = { char: string; guess: string; ms: number; now: number; };
```
The shape of one answer: the kana shown, the kana picked, how many milliseconds the learner took, and the time they answered.

**Lines 20–21**
```ts
const FAST_MS = 4000;
```
4000 milliseconds = 4 seconds. An answer must be faster than this to move up a box.

**Lines 23–28**
```ts
function afterCorrect(current: KanaProgress, answer: Answer): KanaProgress {
  if (!isDue(current, answer.now)) return current;

  const box = answer.ms < FAST_MS ? Math.min(current.box + 1, MAX_BOX) : current.box;
  return { box, dueAt: answer.now + intervalFor(box) };
}
```
- Works out a kana's new progress after a **correct** answer. No `export`, so only this file uses it.
- Line 24: `!` in front means "not". If the kana is **not** due, return `current` unchanged and stop.
- Line 26: `condition ? A : B` means "if the condition is true, use A, otherwise use B".
  - Condition: `answer.ms < FAST_MS`, meaning "did they answer in under 4 seconds?" `<` means "less than".
  - If yes: `current.box + 1`, but `Math.min(..., MAX_BOX)` stops it going above 7.
  - If no: `current.box`, unchanged.
  - The result is named `box`.
- Line 27: returns a **new** object. `box` is short for `box: box`. `dueAt` is the answer time plus the waiting time for the new box.

**Lines 30–31**
```ts
const WRONG_DROP = 2;
```
A wrong answer moves the kana down 2 boxes.

**Lines 33–35**
```ts
function afterWrong(current: KanaProgress, answer: Answer): KanaProgress {
  return { box: Math.max(current.box - WRONG_DROP, 0), dueAt: answer.now };
}
```
- Works out new progress after a **wrong** answer.
- `current.box - WRONG_DROP` is the box minus 2. `Math.max(..., 0)` stops it going below 0.
- `dueAt: answer.now` makes it due right away.
- There is no due check here, so a wrong answer always counts.

**Lines 37–38**
```ts
export const NEW_KANA: KanaProgress = { box: 0, dueAt: 0 };
```
The progress used for a kana the learner has never answered. Box 0, due at time 0. Time 0 is in the past, so it is always due.

**Lines 40–56**
```ts
export function recordAnswer(progress: Progress, answer: Answer): Progress {
```
The main function. Takes all the progress and one answer. Returns **new** progress.

```ts
  const current = progress.kana[answer.char] ?? NEW_KANA;
```
Looks up the shown kana's progress. `??` means "if the left side is missing, use the right side instead". So if there's no progress for this kana yet, `current` is `NEW_KANA`.

```ts
  const correct = answer.guess === answer.char;
```
`===` means "is exactly equal to". The answer is correct if the picked kana is the shown kana. `correct` is `true` or `false`.

```ts
  if (correct) {
    return {
      ...progress,
      kana: { ...progress.kana, [answer.char]: afterCorrect(current, answer) },
    };
  }
```
If correct, return a new object:
- `...progress` copies every field from `progress` into the new object.
- `kana: {...}` then replaces the `kana` field with a new object:
  - `...progress.kana` copies every kana's progress into it.
  - `[answer.char]: afterCorrect(current, answer)` replaces the entry for the shown kana with its new progress. The square brackets mean "use the **value** of `answer.char` as the field name". If `answer.char` is `'シ'`, the field is named `シ`.
- The old `progress` object is not changed at all.

```ts
  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    confusions: [...progress.confusions, { shown: answer.char, guessed: answer.guess }],
  };
}
```
If the code gets here, the answer was wrong (the correct case already returned). Same as above, but:
- uses `afterWrong`.
- replaces `confusions` with a new list: `...progress.confusions` copies every old mistake into the new list, then the new mistake is added at the end.

---

## unlock.ts: which kana the learner is allowed to see

**Lines 1–3**: imports. `import type { Progress }` brings in only a type.

**Line 6**
```ts
const UNLOCK_SHARE = 0.8;
```
0.8 means 80%.

**Lines 8–11**
```ts
function isGreenOrBetter(progress: Progress, kana: Kana): boolean {
  const box = progress.kana[kana.char]?.box ?? 0;
  return tierOf(box) !== 'white';
}
```
- Returns `true` if this kana's belt is green, brown or black.
- `progress.kana[kana.char]` looks up the kana's progress. It might be missing.
- `?.box` means: if the thing on the left is missing, stop and give "missing". Otherwise read `.box`.
- `?? 0`: if the result is missing, use 0.
- `tierOf(box) !== 'white'` is `true` for any belt except white.

**Lines 13–25**
```ts
export function unlockedKana(progress: Progress, script: Script): Kana[] {
  const unlocked: Kana[] = [];
```
Takes the progress and a script. Returns a list of kana. Starts with an empty list named `unlocked`.

```ts
  for (const row of ROWS) {
```
`for (const row of ROWS)` runs the block below once for each item in `ROWS`: first with `row` as `'a'`, then `'ka'`, and so on.

```ts
    const rowKana = KANA.filter((k) => k.script === script && k.row === row);
```
Keeps only the kana whose script matches **and** whose row matches. `&&` means "and": both must be true. For row `'a'` and hiragana, that gives あいうえお.

```ts
    unlocked.push(...rowKana);
```
`.push` adds items to the end of a list. `...rowKana` adds each kana separately, not the list as one item. Changing `unlocked` is fine because this function created it on line 14. The rule about not changing things applies to the inputs (`progress`).

```ts
    const green = rowKana.filter((k) => isGreenOrBetter(progress, k)).length;
```
Keeps the row's kana that are green or better, and counts them with `.length`.

```ts
    if (green / rowKana.length < UNLOCK_SHARE) break;
  }
```
`/` means divide. `green / rowKana.length` is the fraction that are green. 4 out of 5 is 0.8. If it's less than 0.8, `break` ends the loop right away, so no more rows get added. Otherwise the loop moves on to the next row.

```ts
  return unlocked;
}
```
Returns the list.

---

## random.ts: randomness that tests can control

**Lines 1–3**
```ts
export type Rng = () => number;
```
`Rng` is the type of "a function that takes nothing and returns a number". `Math.random` is such a function: it returns a number from 0 up to, but never reaching, 1. In the app, `Math.random` is passed in. In tests, a function like `() => 0.5` (always returns 0.5) is passed in.

**Line 6**
```ts
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
```
- `<T>` is a placeholder for "any type". If you give it a list of `Kana`, `T` is `Kana`. If you give it a list of strings, `T` is `string`.
- Takes a list of `T` and an `Rng`. Returns a list of `T`.

**Line 7**
```ts
  const result = [...items];
```
Makes a new list with the same items. From here on, only `result` is changed, never `items`.

**Line 8**
```ts
  for (let i = result.length - 1; i > 0; i--) {
```
A counting loop. Three parts, separated by `;`:
- `let i = result.length - 1`: start `i` at the last position. For 4 items, that's 3.
- `i > 0`: keep going while `i` is more than 0.
- `i--`: after each run, subtract 1 from `i`.

So for 4 items the loop runs with `i` = 3, 2, 1.

**Line 9**
```ts
    const j = Math.floor(rng() * (i + 1));
```
- `rng()` gives a number from 0 to just under 1.
- Times `(i + 1)` gives a number from 0 to just under `i + 1`.
- `Math.floor` removes the decimal part: 2.7 becomes 2.
- `j` is a whole number from 0 to `i`.

**Line 11**
```ts
    [result[i], result[j]] = [result[j]!, result[i]!];
```
Swaps the items at positions `i` and `j`. The right side makes a two-item list of (item at `j`, item at `i`), then the left side stores them back in swapped order. The `!` marks are the same as in `intervalFor`: they tell TypeScript these positions definitely exist.

**Line 13**: returns the shuffled copy.

---

## choices.ts: the four answer buttons

**Line 4**
```ts
const CHOICE_COUNT = 4;
```

**Line 8**
```ts
export function makeChoices(answer: Kana, pool: readonly Kana[], rng: Rng): Kana[] {
```
Takes the correct kana, a list to pick wrong options from (`pool`), and an `Rng`. Returns 4 kana.

**Line 9**
```ts
  const lookalikes = lookalikesOf(answer.char);
```
Gets the list of characters that look like the answer.

**Line 10**
```ts
  const isLookalike = (k: Kana) => lookalikes.includes(k.char);
```
A small function stored under a name. It takes a kana and returns `true` if that kana's character is in `lookalikes`.

**Line 11**
```ts
  const candidates = [...pool.filter(isLookalike), ...shuffle(pool.filter((k) => !isLookalike(k)), rng)];
```
Builds one list from two parts:
1. `pool.filter(isLookalike)`: the lookalikes that are in the pool.
2. `shuffle(pool.filter((k) => !isLookalike(k)), rng)`: everything else in the pool, in random order.

The `...` in front of each part puts its items into the new list one by one. Lookalikes come first, so they get picked first.

**Line 13**
```ts
  const chosen: Kana[] = [answer];
```
A new list that starts with just the answer.

**Line 14**
```ts
  const usedRomaji = new Set(answer.romaji);
```
A `Set` is a collection that holds each value only once and can quickly answer "is this value in here?". It starts with the answer's spellings, for example `shi` and `si`.

**Line 16**
```ts
  for (const candidate of candidates) {
```
Runs the block once for each candidate, in order.

**Line 17**
```ts
    if (chosen.length === CHOICE_COUNT) break;
```
If there are already 4 choices, stop the loop.

**Line 18**
```ts
    if (candidate.romaji.some((r) => usedRomaji.has(r))) continue;
```
`.some(...)` returns `true` if **at least one** item passes the check. `usedRomaji.has(r)` checks whether spelling `r` is already used. If any of this candidate's spellings is already used, `continue` skips the rest of this run and moves to the next candidate. This skips things like シ when the answer is し (both `shi`), and skips the answer itself if it's in the pool.

**Line 19**
```ts
    chosen.push(candidate);
```
Adds the candidate to the choices.

**Line 20**
```ts
    candidate.romaji.forEach((r) => usedRomaji.add(r));
```
`.forEach` runs a function once for each item. This adds each of the candidate's spellings to `usedRomaji`, so no later candidate can reuse them.

**Line 23**
```ts
  return shuffle(chosen, rng);
```
Returns the 4 choices in random order, so the answer isn't always first.

---

## pick.ts: choosing which kana to ask next

**Lines 1–4**: imports.

**Line 7**
```ts
const DUE_WEIGHT = 10;
```

**Lines 10–13**
```ts
function weightOf(progress: KanaProgress, now: number): number {
  const lowBoxWeight = MAX_BOX + 1 - progress.box;
  return isDue(progress, now) ? lowBoxWeight * DUE_WEIGHT : lowBoxWeight;
}
```
- Gives each kana a number called its **weight**. Bigger weight means more likely to be picked.
- `MAX_BOX + 1 - progress.box` is `8 - box`. Box 0 gives 8, box 7 gives 1. Lower boxes get bigger weights.
- If the kana is due, the weight is multiplied by 10. If not, it stays as is.

**Line 16**
```ts
export function pickNext(progress: Progress, candidates: readonly Kana[], now: number, rng: Rng): Kana {
```
Takes the progress, the kana to choose from, the time, and an `Rng`. Returns one kana.

**Line 17**
```ts
  if (candidates.length === 0) throw new Error('pickNext needs at least one candidate');
```
If the list is empty, `throw` stops everything with an error message. There's nothing to pick.

**Lines 19–22**
```ts
  const weighted = candidates.map((kana) => ({
    kana,
    weight: weightOf(progress.kana[kana.char] ?? NEW_KANA, now),
  }));
```
- `.map` makes a new list with one new item for each candidate.
- Each new item is an object with two fields: the kana, and its weight.
- The round brackets around `{ ... }` are needed so the curly braces are read as an object and not as the start of a block of steps.
- A kana with no progress uses `NEW_KANA`.

**Line 23**
```ts
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
```
- `.reduce` goes through the list, keeping a running result.
- It starts at `0` (the last argument).
- For each item it runs `sum + w.weight`: add this item's weight to the running result.
- `total` is all the weights added together.

**Line 25**
```ts
  let remaining = rng() * total;
```
Picks a random number from 0 to just under `total`. `let` because it changes on the next lines.

**Lines 26–29**
```ts
  for (const { kana, weight } of weighted) {
    remaining -= weight;
    if (remaining < 0) return kana;
  }
```
- Goes through each item. `{ kana, weight }` takes the two fields out of the item and names them.
- `remaining -= weight` means `remaining = remaining - weight`.
- As soon as `remaining` goes below 0, return that kana.
- Example: weights `[80, 20]`, total 100.
  - Random number 50: 50 − 80 = −30, below 0, so the first kana is picked.
  - Random number 90: 90 − 80 = 10, not below 0, keep going. 10 − 20 = −10, so the second kana is picked.
  - The first kana is picked for any number from 0 to 79.99, the second for 80 to 99.99. That's 80% and 20%, matching the weights.

**Line 31**
```ts
  return weighted[weighted.length - 1]!.kana;
```
Returns the last kana. Normally the loop always returns first. Computers store decimal numbers with tiny rounding errors, so in rare cases `remaining` could end at exactly 0 instead of below it. This line makes sure the function still returns something.

---

## The test files

All test files (`kana.test.ts`, `boxes.test.ts`, `answers.test.ts`, `unlock.test.ts`, `random.test.ts`, `choices.test.ts`, `pick.test.ts`) use the same pieces:

- **`describe('name', () => { ... })`** puts related tests under one heading. It only changes how results are printed.
- **`it('what should be true', () => { ... })`** is one test. Jest runs the steps inside. If every check passes, the test passes.
- **`expect(value)`** followed by a check:
  - `.toBe(x)`: the value is exactly `x`. Used for numbers, strings, `true`/`false`.
  - `.toEqual(x)`: the value has the same contents as `x`. Used for lists and objects.
  - `.toHaveLength(n)`: the list has `n` items.
  - `.toContain(x)`: the list has `x` somewhere in it.
  - `.toBeGreaterThan(n)`: the number is bigger than `n`.
- **Helper functions** at the top of a file (`kana('し')`, `progressWith(2)`, `withBox([...], 3)`) build test data so each test doesn't repeat the same setup.
- **Fixed numbers for time and randomness**: `NOW = 1_000_000` is a made-up time, and `() => 0.5` is a made-up random source. The `_` in numbers is ignored by the computer and only makes them easier to read. Because these never change, each test gives the same result every time.
- `npm test` runs every file ending in `.test.ts` and prints which tests passed and which failed.

What each file checks:
- **kana.test.ts**: 46 + 46 kana, no duplicates; spellings accepted, including alternates, capitals and spaces; rows in the right order and the right size; lookalikes found in both directions.
- **boxes.test.ts**: each box gives the right belt and the right waiting time; "due" is `true` at or after the due time.
- **answers.test.ts**: every rule of `recordAnswer`: up a box, capped at 7, not due, slow, wrong, floor at 0, mistakes logged, new kana, and the input never changed.
- **unlock.test.ts**: only the あ row at first; the next row opens at 4 of 5 green but not 3 of 5; scripts are separate.
- **random.test.ts**: shuffle keeps every item, gives the same order for the same random numbers, and doesn't change the original.
- **choices.test.ts**: 4 choices including the answer, lookalikes included, no repeated spellings.
- **pick.test.ts**: runs `pickNext` 100 times with random numbers 0.00, 0.01 … 0.99 and counts the picks. Due kana and low boxes win most of the time, and only candidates are ever picked.
