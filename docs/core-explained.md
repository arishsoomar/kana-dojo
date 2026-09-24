# src/core explained, line by line

A plain walkthrough of every file in `src/core/`, written as of story D2.
If the code changes after that, line numbers here may drift.

`src/core/` is the learning engine. None of it draws anything on screen, reads the clock,
makes random numbers by itself, or saves anything. It only takes data in and gives data back.
The screens, hooks and storage outside `src/core/` do the rest.

---

## How the files fit together

| File | What it's for |
|---|---|
| `kana.ts` | The 92 kana, their rows and spellings, and which ones look alike |
| `boxes.ts` | Box numbers, how long each box waits, belts, and "is it due?" |
| `answers.ts` | The learner's progress, and what one answer does to it |
| `unlock.ts` | Which rows the learner has opened |
| `random.ts` | Shuffling with a random source that tests can control |
| `choices.ts` | The four answer options for a question |
| `pick.ts` | Which kana to ask next |
| `question.ts` | A whole question (kana + options), normal or drill |
| `feedback.ts` | Belt changes and memory tips, for the feedback sheet |
| `lesson.ts` | Lesson length, and the summary at the end (XP, accuracy, speed) |
| `saved.ts` | Turning progress into text to save, and reading it back safely |
| `grid.ts` | The data behind the belt grid on the Kana tab |
| `details.ts` | The data behind a kana's detail sheet |

Every `.ts` file has a `.test.ts` file next to it. See the last section.

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
- **`import`**: uses something another file exported. `import type` brings in only a type.
- **`//`**: a comment. The computer ignores everything after it on that line. It's for people.
- **`null`**: a value that means "nothing here". `number | null` means "a number, or nothing".
- **`?`, `??`, `?.`**:
  - `a ?? b`: use `a`, unless `a` is missing (`undefined` or `null`); then use `b`.
  - `a?.b`: read `b` from `a`, but if `a` is missing, stop and give "missing" instead of crashing.
  - `condition ? A : B`: if the condition is true, use `A`, otherwise use `B`.
- **`!` after a value** (`list[i]!`): tells TypeScript "this is definitely not missing". It is only used where a comment explains why it's safe.
- **`...` (spread)**: copies all the items of a list, or all the fields of an object, into a new one. `[...list, x]` is a new list with everything from `list` and then `x`. `{ ...obj, a: 1 }` is a new object with every field of `obj`, and `a` set to 1.

---

## kana.ts: the 92 kana and facts about them

**Line 1**
```ts
export type Script = 'hiragana' | 'katakana';
```
A `Script` can only be the exact text `'hiragana'` or `'katakana'`. `|` means "or".

**Line 4**
```ts
export const ROWS = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'] as const;
```
The ten row names, in the order they unlock. `as const` tells TypeScript to remember these exact ten strings in this exact order.

**Line 6**
```ts
export type RowId = (typeof ROWS)[number];
```
`RowId` means "one of the strings in `ROWS`". `typeof ROWS` is the type of the list, and `[number]` means "any one item from it". The names are written once, on line 4.

**Lines 8–14**
```ts
export type Kana = {
  char: string;
  script: Script;
  row: RowId;
  romaji: readonly [string, ...string[]];
};
```
The shape of one kana:
- `char`: the character, like `'し'`.
- `script`: `'hiragana'` or `'katakana'`.
- `row`: which row it's in, like `'sa'`.
- `romaji`: its spellings. `[string, ...string[]]` means "one string, then any number more". So there is always at least one. The first is the standard spelling; the others are also accepted. `readonly` means nobody can change the list.

**Line 17**
```ts
const TABLE: readonly [RowId, string, string, string, ...string[]][] = [
```
A list named `TABLE`, only used in this file. Each line in it has: a row name, the hiragana, the katakana, the first spelling, then any extra spellings.

**Lines 18–27**: the data. 46 lines, one per sound. `['sa', 'し', 'シ', 'shi', 'si']` means row `sa`, hiragana し, katakana シ, spellings `shi` and `si`.

**Lines 30–36**
```ts
export const KANA: readonly Kana[] = TABLE.flatMap(([row, hiragana, katakana, first, ...rest]) => {
  const romaji: Kana['romaji'] = [first, ...rest];
  return [
    { char: hiragana, script: 'hiragana', row, romaji },
    { char: katakana, script: 'katakana', row, romaji },
  ];
});
```
- Builds `KANA`, the list of all 92 kana, from `TABLE`.
- `.flatMap(...)` goes through `TABLE` one line at a time, runs the function for each line, and joins all the results into one list.
- `([row, hiragana, katakana, first, ...rest])` splits one table line into named parts. `...rest` collects everything left over (extra spellings) into a list.
- Line 31 puts the spellings back together: `[first, ...rest]`. `Kana['romaji']` means "the type of the `romaji` field of `Kana`".
- Each table line becomes **two** kana: one hiragana, one katakana, with the same row and spellings. 46 × 2 = 92.
- `row,` on its own is short for `row: row`.

**Lines 38–41**
```ts
export function matchesRomaji(kana: Kana, input: string): boolean {
  const answer = input.trim().toLowerCase();
  return kana.romaji.includes(answer);
}
```
- Checks whether typed text is a correct spelling of a kana.
- `.trim()` removes spaces at the start and end. `.toLowerCase()` makes capital letters small. `' Shi '` becomes `'shi'`.
- `.includes(answer)` is `true` if `answer` is in the kana's list of spellings.

**Lines 44–51**: `LOOKALIKES`, a list of groups of kana that look similar, like `['シ', 'ツ']`.

**Lines 53–57**
```ts
export function lookalikesOf(char: string): string[] {
  return LOOKALIKES.filter((group) => group.includes(char)).flatMap((group) =>
    group.filter((other) => other !== char),
  );
}
```
- Returns the kana that look like `char`.
- `.filter(...)` keeps only the groups that contain `char`.
- `.flatMap(...)` then takes each kept group, removes `char` itself (`!==` means "is not equal to"), and joins the results.
- `lookalikesOf('ね')` returns `['わ', 'れ']`. A kana in no group gets `[]`.

---

## boxes.ts: boxes, waiting times, belts, "is it due"

**Lines 1–4**: `SECOND`, `MINUTE`, `HOUR`, `DAY` in milliseconds. 1000 milliseconds is one second. `*` means multiply.

**Lines 7–16**
```ts
const INTERVALS: readonly number[] = [0, 30 * SECOND, 3 * MINUTE, ..., 21 * DAY];
```
How long a kana in each box waits before it is asked again. The position is the box number: `INTERVALS[0]` is 0, `INTERVALS[7]` is 21 days.

**Line 18**
```ts
export const MAX_BOX = INTERVALS.length - 1;
```
`.length` is how many items the list has (8). So `MAX_BOX` is 7.

**Lines 20–24**
```ts
export function intervalFor(box: number): number {
  const clamped = Math.min(Math.max(box, 0), MAX_BOX);
  return INTERVALS[clamped]!;
}
```
- Returns the waiting time for a box.
- `Math.max(box, 0)` turns anything below 0 into 0. `Math.min(..., MAX_BOX)` turns anything above 7 into 7.
- The `!` is safe because `clamped` is always 0 to 7.

**Line 27**: `BELTS`, the four belts, lowest first.

**Line 29**: `Belt` is one of `'white'`, `'green'`, `'brown'`, `'black'`, built from `BELTS`.

**Lines 31–36**
```ts
export function tierOf(box: number): Belt {
  if (box >= 7) return 'black';
  if (box >= 5) return 'brown';
  if (box >= 3) return 'green';
  return 'white';
}
```
Turns a box number into a belt. It checks from the top down and stops at the first match. `return` ends the function. Boxes 0–2 reach the last line: white.

**Lines 39–43**: `KanaProgress`, the learner's progress on one kana: its `box`, and `dueAt`, the time (in milliseconds, like `Date.now()`) it should next be asked.

**Lines 45–47**
```ts
export function isDue(progress: KanaProgress, now: number): boolean {
  return now >= progress.dueAt;
}
```
`true` if the current time is at or after the due time. The time is given to the function as `now`; it never reads the clock itself.

---

## answers.ts: the learner's progress, and what one answer does to it

**Line 1**: imports from `boxes.ts`.

**Lines 3–6**: `Confusion`, one mistake: the kana that was `shown`, and the kana `guessed` instead.

**Lines 9–13**
```ts
export type KanaStats = {
  seen: number;
  correct: number;
  recentMs: readonly number[];
};
```
A kana's answer history: how many times it was answered, how many of those were correct, and how long the most recent correct answers took (in milliseconds, oldest first).

**Lines 15–19**
```ts
export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
  stats: Readonly<Record<string, KanaStats>>;
};
```
Everything the learner has done:
- `kana`: for each character, its box and due time. `Record<string, KanaProgress>` means "an object whose field names are strings (characters) and whose values are `KanaProgress`". Example: `{ シ: { box: 2, dueAt: 5000 } }`.
- `confusions`: every mistake, in order.
- `stats`: for each character, its answer history.
- `Readonly` and `readonly` mean none of these can be changed in place.

**Line 22**: `EMPTY_PROGRESS`, the progress of someone who hasn't answered anything.

**Lines 24–29**: `Answer`, one answer: the kana shown (`char`), the kana picked (`guess`), how many milliseconds it took (`ms`), and when it happened (`now`).

**Line 32**: `FAST_MS = 4000`. An answer must take less than 4 seconds to move a kana up a box.

**Lines 34–39**
```ts
function afterCorrect(current: KanaProgress, answer: Answer): KanaProgress {
  if (!isDue(current, answer.now)) return current;
  const box = answer.ms < FAST_MS ? Math.min(current.box + 1, MAX_BOX) : current.box;
  return { box, dueAt: answer.now + intervalFor(box) };
}
```
- The new box and due time after a **correct** answer. Not exported, so only this file uses it.
- `!` in front means "not". If the kana is not due, nothing changes.
- If it took under 4 seconds, the box goes up by 1 (but not past 7). Otherwise the box stays.
- Either way, it's due again after that box's waiting time.

**Line 42**: `WRONG_DROP = 2`.

**Lines 44–46**
```ts
function afterWrong(current: KanaProgress, answer: Answer): KanaProgress {
  return { box: Math.max(current.box - WRONG_DROP, 0), dueAt: answer.now };
}
```
After a **wrong** answer: down 2 boxes (not below 0), and due right away. There is no "is it due" check, so a wrong answer always counts.

**Line 49**: `NEW_KANA = { box: 0, dueAt: 0 }`, used for a kana with no progress yet. Time 0 is long ago, so it is always due.

**Line 51**: `NEW_STATS`, stats for a kana never answered: all zero.

**Line 54**: `RECENT_TIMES = 10`, how many recent correct times to keep.

**Lines 56–62**
```ts
function afterAnswer(stats: KanaStats, correct: boolean, ms: number): KanaStats {
  return {
    seen: stats.seen + 1,
    correct: stats.correct + (correct ? 1 : 0),
    recentMs: correct ? [...stats.recentMs, ms].slice(-RECENT_TIMES) : stats.recentMs,
  };
}
```
- New stats after any answer.
- `seen` always goes up by 1. `correct` goes up by 1 only if the answer was right.
- If right, the time is added to the end of `recentMs`. `.slice(-RECENT_TIMES)` keeps only the last 10 items. If wrong, the times stay the same.

**Lines 64–86**
```ts
export function recordAnswer(progress: Progress, answer: Answer): Progress {
```
The main function. It takes all the progress and one answer, and returns **new** progress. The old progress is never changed.

```ts
  const current = progress.kana[answer.char] ?? NEW_KANA;
  const correct = answer.guess === answer.char;
```
Looks up the shown kana's progress (or `NEW_KANA` if there is none). The answer is correct if the picked kana is the shown kana. `===` means "is exactly equal to".

```ts
  const stats = {
    ...progress.stats,
    [answer.char]: afterAnswer(progress.stats[answer.char] ?? NEW_STATS, correct, answer.ms),
  };
```
A new `stats` object: every kana's stats copied over, with the shown kana's stats replaced by the updated ones. `[answer.char]:` with square brackets means "use the **value** of `answer.char` as the field name". If it's `'シ'`, the field is `シ`.

```ts
  if (correct) {
    return {
      ...progress,
      kana: { ...progress.kana, [answer.char]: afterCorrect(current, answer) },
      stats,
    };
  }
```
If correct: a new progress object. `...progress` copies every field. Then `kana` is replaced by a copy with the shown kana updated, and `stats` is replaced by the new stats. `stats,` alone is short for `stats: stats`.

```ts
  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    stats,
    confusions: [...progress.confusions, { shown: answer.char, guessed: answer.guess }],
  };
}
```
If the code gets here, the answer was wrong. Same as above, but using `afterWrong`, and `confusions` becomes a new list: every old mistake, then this one at the end.

---

## unlock.ts: which kana the learner is allowed to see

**Line 6**: `UNLOCK_SHARE = 0.8`, meaning 80%.

**Lines 8–11**
```ts
function isGreenOrBetter(progress: Progress, kana: Kana): boolean {
  const box = progress.kana[kana.char]?.box ?? 0;
  return tierOf(box) !== 'white';
}
```
`true` if the kana's belt is green, brown or black. If the kana has no progress, `?.box` gives "missing" and `?? 0` turns that into box 0.

**Lines 13–25**
```ts
export function unlockedKana(progress: Progress, script: Script): Kana[] {
  const unlocked: Kana[] = [];
  for (const row of ROWS) {
    const rowKana = KANA.filter((k) => k.script === script && k.row === row);
    unlocked.push(...rowKana);
    const green = rowKana.filter((k) => isGreenOrBetter(progress, k)).length;
    if (green / rowKana.length < UNLOCK_SHARE) break;
  }
  return unlocked;
}
```
- Starts with an empty list.
- `for (const row of ROWS)` runs the block once for each row, in order.
- Line 17 gets that row's kana in the chosen script. `&&` means "and".
- Line 18 adds them to the list. `.push` adds items to the end. `...rowKana` adds each kana separately. Changing `unlocked` is fine because this function created it.
- Line 20 counts how many of the row are green or better.
- Line 21: if fewer than 80% are, `break` stops the loop, so no more rows are added.
- The result is every row up to and including the first one that isn't 80% green.

---

## random.ts: randomness that tests can control

**Line 3**
```ts
export type Rng = () => number;
```
A function that takes nothing and returns a number from 0 up to (not including) 1. The app passes `Math.random`. Tests pass something like `() => 0.5`, which always returns 0.5, so results are the same every time.

**Lines 6–14**
```ts
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
```
- `<T>` stands for "any type". Give it a list of kana, and `T` is `Kana`.
- Line 7 makes a copy. Only the copy is changed.
- Line 8 is a counting loop: start `i` at the last position, keep going while `i > 0`, and subtract 1 each time (`i--`).
- Line 9 picks a random whole number `j` from 0 to `i`. `Math.floor` removes the decimal part.
- Line 11 swaps the items at positions `i` and `j`.
- The result is the same items in a random order.

---

## choices.ts: the four answer buttons

**Line 4**: `CHOICE_COUNT = 4`.

**Lines 8–24**
```ts
export function makeChoices(answer: Kana, pool: readonly Kana[], rng: Rng): Kana[] {
```
Returns 4 kana: the correct one and 3 wrong options taken from `pool`.

```ts
  const lookalikes = lookalikesOf(answer.char);
  const isLookalike = (k: Kana) => lookalikes.includes(k.char);
  const candidates = [...pool.filter(isLookalike), ...shuffle(pool.filter((k) => !isLookalike(k)), rng)];
```
- `isLookalike` is a small function: `true` if a kana looks like the answer.
- `candidates` is one list: the lookalikes from the pool first, then everything else from the pool in random order. Lookalikes come first so they get picked first.

```ts
  const chosen: Kana[] = [answer];
  const usedRomaji = new Set(answer.romaji);
```
The choices start with just the answer. A `Set` holds each value once and can quickly answer "is this in here?". It starts with the answer's spellings.

```ts
  for (const candidate of candidates) {
    if (chosen.length === CHOICE_COUNT) break;
    if (candidate.romaji.some((r) => usedRomaji.has(r))) continue;
    chosen.push(candidate);
    candidate.romaji.forEach((r) => usedRomaji.add(r));
  }
```
- Go through the candidates in order.
- Stop once there are 4.
- `.some(...)` is `true` if at least one spelling is already used. If so, `continue` skips this candidate. This stops two buttons from showing the same spelling (like し and シ, both "shi"), and skips the answer itself.
- Otherwise add the candidate, and mark its spellings as used. `.forEach` runs a function once for each item.

```ts
  return shuffle(chosen, rng);
```
The 4 choices in random order, so the answer isn't always first.

---

## pick.ts: choosing which kana to ask next

**Line 7**: `DUE_WEIGHT = 10`.

**Lines 10–13**
```ts
function weightOf(progress: KanaProgress, now: number): number {
  const lowBoxWeight = MAX_BOX + 1 - progress.box;
  return isDue(progress, now) ? lowBoxWeight * DUE_WEIGHT : lowBoxWeight;
}
```
Each kana gets a **weight**. Bigger means more likely to be picked. `8 - box`: box 0 gives 8, box 7 gives 1. Due kana are multiplied by 10.

**Lines 16–32**
```ts
export function pickNext(progress: Progress, candidates: readonly Kana[], now: number, rng: Rng): Kana {
  if (candidates.length === 0) throw new Error('pickNext needs at least one candidate');
```
If there's nothing to pick from, `throw` stops with an error message.

```ts
  const weighted = candidates.map((kana) => ({
    kana,
    weight: weightOf(progress.kana[kana.char] ?? NEW_KANA, now),
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
```
- `.map` makes a new list: one `{ kana, weight }` object for each candidate. The round brackets around `{ ... }` make it an object, not a block of steps.
- `.reduce` walks the list keeping a running result. It starts at `0` and adds each weight. `total` is all the weights added up.

```ts
  let remaining = rng() * total;
  for (const { kana, weight } of weighted) {
    remaining -= weight;
    if (remaining < 0) return kana;
  }
```
- Pick a random number from 0 to just under `total`.
- Go through the kana, subtracting each weight (`-=` means "subtract and store"). The first kana that takes `remaining` below 0 is picked.
- Example: weights `[80, 20]`, total 100. A random number under 80 picks the first kana; 80 or more picks the second. So they are picked 80% and 20% of the time.

```ts
  return weighted[weighted.length - 1]!.kana;
```
Normally never reached. Decimal numbers can have tiny rounding errors, so this makes sure something is always returned.

---

## question.ts: a whole question

**Lines 9–12**: `Question`, one kana to ask and its answer options.

**Lines 15–19**
```ts
export function makeQuestion(progress: Progress, script: Script, now: number, rng: Rng): Question {
  const unlocked = unlockedKana(progress, script);
  const kana = pickNext(progress, unlocked, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
```
A normal lesson question: get the unlocked kana, pick one to ask, and build its options from the unlocked kana. `kana,` is short for `kana: kana`.

**Line 22**: `DRILL_FOCUS_SHARE = 0.5`, meaning half.

**Lines 26–33**
```ts
export function makeDrillQuestion(progress: Progress, focus: Kana, now: number, rng: Rng): Question {
  const unlocked = unlockedKana(progress, focus.script);
  const related = new Set([...mixUpsOf(progress, focus.char).map((m) => m.char), ...lookalikesOf(focus.char)]);
  const partners = unlocked.filter((k) => related.has(k.char));
  const kana = partners.length === 0 || rng() < DRILL_FOCUS_SHARE ? focus : pickNext(progress, partners, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
```
A question for drilling one kana (`focus`):
- `unlocked`: the unlocked kana in the focus kana's script.
- `related`: a `Set` of the kana it has been mixed up with, plus the kana that look like it.
- `partners`: the related kana that are unlocked.
- Line 31: `||` means "or". If there are no partners, **or** the random number is below 0.5, ask the focus kana. Otherwise pick one of the partners. So about half the questions are the focus kana.
- The options come from all unlocked kana.

---

## feedback.ts: belt changes and memory tips

**Line 5**: `BeltChange`, the belt before and after.

**Lines 7–9**: `beltOf`, the belt of one kana in some progress (or white if it has no progress).

**Lines 12–16**
```ts
export function beltChange(before: Progress, after: Progress, char: string): BeltChange | null {
  const from = beltOf(before, char);
  const to = beltOf(after, char);
  return from === to ? null : { from, to };
}
```
Compares a kana's belt before and after an answer. If it's the same, `null`. Otherwise `{ from, to }`.

**Lines 19–28**: `PAIR_TIPS`, a list of written tips. Each has a `pair` of two kana and a `tip` saying how to tell them apart.

**Lines 30–32**
```ts
function pairTip(a: string, b: string): string | null {
  return PAIR_TIPS.find(({ pair }) => pair.includes(a) && pair.includes(b))?.tip ?? null;
}
```
- `.find(...)` returns the first item that passes the check, or "missing" if none do.
- The check: the pair contains both `a` and `b`. `({ pair })` takes the `pair` field out of each item.
- `?.tip` reads the tip if something was found. `?? null` turns "missing" into `null`.

**Lines 35–41**
```ts
export function pairTipFor(char: string, others: readonly string[]): string | null {
  for (const other of others) {
    const tip = pairTip(char, other);
    if (tip) return tip;
  }
  return null;
}
```
Tries each kana in `others` in order and returns the first written tip that pairs it with `char`. `null` if none. The detail sheet passes a kana's most common mix-ups first, then its lookalikes.

**Lines 44–48**
```ts
export function tipFor(shown: Kana, guessed: Kana): string {
  const match = pairTip(shown.char, guessed.char);
  if (match) return match;
  return `${shown.char} is "${shown.romaji[0]}". ${guessed.char} is "${guessed.romaji[0]}".`;
}
```
The tip on the wrong-answer sheet. If a written tip exists for the two kana, use it. Otherwise build a line like `う is "u". あ is "a".`. Text in backticks with `${...}` puts values into the text.

---

## lesson.ts: lesson length and the end-of-lesson summary

**Line 4**: `LESSON_LENGTH = 10` questions.

**Lines 6–7**: 10 XP per correct answer, and 5 more if it was fast.

**Lines 9–13**: `LessonAnswer`, one answer during a lesson: which kana, right or wrong, and how long.

**Lines 15–20**: `LessonSummary`, what the completion screen shows: XP, accuracy (0 to 1), strike speed in milliseconds (or `null` if nothing was right), and the kana that reached a new belt.

**Lines 23–29**
```ts
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
```
- The middle value of a list of numbers.
- An empty list gives `null`.
- Line 25 sorts a copy from smallest to largest. `(a, b) => a - b` tells `.sort` to compare as numbers.
- Line 26 finds the middle position. `Math.floor` rounds down.
- `%` gives the remainder after dividing. `length % 2 === 1` means the length is odd. Odd: take the middle item. Even: average the two middle items.
- Example: `[3000, 900, 1200]` sorts to `[900, 1200, 3000]`, and the median is 1200.

**Lines 31–33**: `beltIndex`, a kana's belt as a number (white 0, green 1, brown 2, black 3), using its position in `BELTS`. Numbers can be compared with `>`; belt names can't.

**Lines 36–51**
```ts
export function summarizeLesson(before: Progress, after: Progress, answers: readonly LessonAnswer[]): LessonSummary {
```
Takes progress at the start and end of the lesson, and every answer given.

```ts
  const correct = answers.filter((a) => a.correct);
  const xp = correct.reduce((sum, a) => sum + XP_PER_CORRECT + (a.ms < FAST_MS ? XP_FAST_BONUS : 0), 0);
```
Keeps the correct answers. XP adds 10 for each, plus 5 for each that took under 4 seconds.

```ts
  const answeredChars = [...new Set(answers.map((a) => a.char))];
  const promotions = answeredChars
    .filter((char) => beltIndex(after, char) > beltIndex(before, char))
    .map((char) => ({ char, belt: tierOf((after.kana[char] ?? NEW_KANA).box) }));
```
- `answeredChars`: each kana answered, once. Putting them in a `Set` drops repeats; `[...set]` turns it back into a list.
- `promotions`: the kana whose belt number is higher at the end than at the start, each with its new belt. Kana that dropped a belt are not included.

```ts
  return {
    xp,
    accuracy: answers.length === 0 ? 0 : correct.length / answers.length,
    strikeSpeedMs: median(correct.map((a) => a.ms)),
    promotions,
  };
```
Accuracy is correct answers divided by all answers. Strike speed is the median time of the correct answers only.

---

## saved.ts: saving progress as text, and reading it back safely

**Lines 6–7**
```ts
const SAVE_VERSION = 2;
const READABLE_VERSIONS: readonly unknown[] = [1, 2];
```
Each save is marked with a version number. Version 1 was before stats existed. This code writes version 2 and can read versions 1 and 2.

**Line 9**: `EMPTY`, the same as `EMPTY_PROGRESS`.

**Lines 12–14**
```ts
export function serializeProgress(progress: Progress): string {
  return JSON.stringify({ version: SAVE_VERSION, progress });
}
```
Turns progress into text. `JSON.stringify` writes an object as text, like `{"version":2,"progress":{...}}`.

**Lines 18–35**
```ts
export function parseProgress(text: string | null): Progress {
  if (text === null) return EMPTY;
```
Reads text written by `serializeProgress`. `null` means nothing was saved yet (first launch), so start empty.

```ts
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return EMPTY;
  }
```
- `JSON.parse` turns text back into an object. If the text is broken, it throws an error.
- `try { ... } catch { ... }` means: run the first block; if it throws an error, run the second block instead of crashing. So broken text gives empty progress.
- `unknown` is TypeScript's type for "could be anything". Nothing can be read from it until it has been checked.

```ts
  if (!isObject(data) || !READABLE_VERSIONS.includes(data.version) || !isObject(data.progress)) return EMPTY;
```
If the data isn't an object, or has a version this code can't read, or has no `progress` object, start empty. `||` means "or".

```ts
  const { kana, confusions, stats } = data.progress;
  return {
    kana: isObject(kana) ? validEntries(kana, isKanaProgress) : {},
    confusions: Array.isArray(confusions) ? confusions.filter(isConfusion) : [],
    stats: isObject(stats) ? validEntries(stats, isKanaStats) : {},
  };
}
```
- Takes the three parts out of the saved progress.
- For each part: if it's the right kind of thing, keep only the valid entries inside it. Otherwise use an empty one.
- A version 1 save has no `stats`, so `stats` is "missing", `isObject` is `false`, and stats become `{}`. That is how old saves are upgraded.

**Lines 38–44**
```ts
function validEntries<T>(saved: Record<string, unknown>, isValid: (value: unknown) => value is T): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [char, value] of Object.entries(saved)) {
    if (isValid(value)) result[char] = value;
  }
  return result;
}
```
- Keeps the fields whose value passes the `isValid` check.
- `Object.entries(saved)` turns an object into a list of `[name, value]` pairs.
- `isValid` is a function passed in. `value is T` means "if this returns `true`, TypeScript may treat `value` as a `T`".

**Lines 47–49**: `isObject`, `true` for a real object (not `null`, not a list). `typeof value === 'object'` asks what kind of value it is.

**Lines 51–60**: `isKanaProgress`, `true` if the value has a whole-number `box` from 0 to 7 and a number `dueAt`. `Number.isInteger` checks for a whole number.

**Lines 62–64**: `isCount`, `true` for a whole number of 0 or more.

**Lines 66–74**: `isKanaStats`, `true` if `seen` and `correct` are counts and `recentMs` is a list of numbers. `.every(...)` is `true` only if every item passes.

**Lines 76–78**: `isConfusion`, `true` if both `shown` and `guessed` are strings.

---

## grid.ts: the data behind the belt grid

**Lines 6–22**: the shapes:
- `GridCell`: one kana, its belt, and whether it's locked.
- `GridRow`: a row name and its cells.
- `MasteryGrid`: all the rows, the total number of kana, how many are past white belt, and how many are at each belt. `Record<Belt, number>` means an object with one number for each belt.

**Lines 25–46**
```ts
export function masteryGrid(progress: Progress, script: Script): MasteryGrid {
  const unlocked = new Set(unlockedKana(progress, script));
```
Puts the unlocked kana in a `Set`, so checking "is this one unlocked?" is quick.

```ts
  const rows = ROWS.map((row) => ({
    row,
    cells: KANA.filter((k) => k.script === script && k.row === row).map((kana) => ({
      kana,
      belt: tierOf((progress.kana[kana.char] ?? NEW_KANA).box),
      locked: !unlocked.has(kana),
    })),
  }));
```
For each row: find its kana in this script, and turn each into a cell with its belt and whether it's locked (`!` means "not": locked if not unlocked).

```ts
  const cells = rows.flatMap((r) => r.cells);
  const counts = Object.fromEntries(BELTS.map((belt) => [belt, cells.filter((c) => c.belt === belt).length]));
```
- `cells`: every cell from every row in one list.
- `counts`: for each belt, how many cells have it. `Object.fromEntries` turns a list of `[name, value]` pairs into an object: `{ white: 42, green: 2, ... }`.

```ts
  return {
    rows,
    total: cells.length,
    pastWhite: cells.filter((c) => c.belt !== 'white').length,
    counts: counts as Record<Belt, number>,
  };
```
`as Record<Belt, number>` tells TypeScript what `counts` is. TypeScript can't work it out from `Object.fromEntries`. The comment in the file says why it's safe: it was built from every belt.

---

## details.ts: the data behind a kana's detail sheet

**Line 6**: `MixUp`, another kana and how many times the two were confused.

**Lines 8–14**: `KanaDetails`: belt, accuracy (or `null` if never answered), strike speed (or `null`), how long until it's due (0 means now), and its mix-ups, most frequent first.

**Lines 17–28**
```ts
export function kanaDetails(progress: Progress, kana: Kana, now: number): KanaDetails {
  const box = progress.kana[kana.char] ?? NEW_KANA;
  const stats = progress.stats[kana.char];
  return {
    belt: tierOf(box.box),
    accuracy: stats && stats.seen > 0 ? stats.correct / stats.seen : null,
    strikeSpeedMs: stats ? median(stats.recentMs) : null,
    dueInMs: Math.max(box.dueAt - now, 0),
    mixUps: mixUpsOf(progress, kana.char),
  };
}
```
- `stats` might be missing (never answered).
- Accuracy: if there are stats and at least one answer, correct divided by seen. Otherwise `null`.
- Strike speed: the median of the recent correct times, or `null`.
- `dueInMs`: due time minus now. `Math.max(..., 0)` turns anything already past into 0.

**Lines 31–38**
```ts
export function mixUpsOf(progress: Progress, char: string): MixUp[] {
  const counts = new Map<string, number>();
  for (const { shown, guessed } of progress.confusions) {
    const other = shown === char ? guessed : guessed === char ? shown : null;
    if (other) counts.set(other, (counts.get(other) ?? 0) + 1);
  }
  return [...counts].map(([other, count]) => ({ char: other, count })).sort((a, b) => b.count - a.count);
}
```
- A `Map` stores values under keys, like an object, with `.get(key)` and `.set(key, value)`.
- For each mistake: if `char` was shown, the other kana is what was guessed. If `char` was guessed, the other kana is what was shown. Otherwise the mistake doesn't involve `char` (`null`).
- Line 35 adds 1 to that other kana's count (starting from 0).
- Line 37 turns the `Map` into a list of `{ char, count }` and sorts it, highest count first (`b.count - a.count`).

**Lines 40–42**: `MINUTE`, `HOUR`, `DAY` in milliseconds.

**Lines 45–50**
```ts
export function formatWait(ms: number): string {
  if (ms <= 0) return 'Now';
  if (ms < HOUR) return `${Math.ceil(ms / MINUTE)} min`;
  if (ms < DAY) return plural(Math.ceil(ms / HOUR), 'hour');
  return plural(Math.ceil(ms / DAY), 'day');
}
```
Turns a wait into short text: `'Now'`, `'20 min'`, `'6 hours'`, `'2 days'`. `Math.ceil` rounds **up**, so 30 seconds shows as "1 min", never "0 min".

**Lines 52–54**: `plural` adds an "s" unless the count is 1: `1 day`, `2 days`.

---

## The test files

Every code file has a test file next to it (`kana.test.ts`, `boxes.test.ts`, and so on). They all use the same pieces:

- **`describe('name', () => { ... })`** puts related tests under one heading.
- **`it('what should be true', () => { ... })`** is one test. If every check inside passes, the test passes.
- **`expect(value)`** followed by a check:
  - `.toBe(x)`: exactly `x`. For numbers, strings, `true`/`false`, `null`.
  - `.toEqual(x)`: same contents as `x`. For lists and objects.
  - `.toHaveLength(n)`: the list has `n` items.
  - `.toContain(x)`: the list or text has `x` in it.
  - `.toBeGreaterThan(n)`: bigger than `n`.
  - `.toBeCloseTo(x)`: equal to `x` apart from tiny rounding differences. Used for fractions like 2/3.
  - `.toBeNull()`: is `null`.
- **Helper functions** at the top of a file (`kana('し')`, `progressWith(2)`, `withBox([...], 3)`) build test data so each test doesn't repeat the same setup.
- **Fixed numbers for time and randomness**: `NOW = 1_000_000` is a made-up time; `() => 0.5` is a made-up random source. The `_` in numbers is ignored and only makes them easier to read. Because these never change, each test gives the same result every time.
- `npm test` runs every `.test.ts` file and prints which tests passed and which failed.

What each file checks:
- **kana.test.ts**: 46 + 46 kana, no duplicates; spellings accepted, including alternates, capitals and spaces; rows in order and the right size; lookalikes found both ways.
- **boxes.test.ts**: each box's belt and waiting time; "due" is true at or after the due time.
- **answers.test.ts**: every rule of `recordAnswer` (up a box, capped at 7, not due, slow, wrong, floor at 0, mistakes logged, new kana, input never changed), and the stats it keeps.
- **unlock.test.ts**: only the あ row at first; the next row opens at 4 of 5 green but not 3 of 5; scripts are separate.
- **random.test.ts**: shuffle keeps every item, is repeatable, and doesn't change the original.
- **choices.test.ts**: 4 choices including the answer, lookalikes included, no repeated spellings.
- **pick.test.ts**: runs `pickNext` 100 times with random numbers 0.00 to 0.99 and counts picks; due and low-box kana win most often; only candidates are picked.
- **question.test.ts**: normal questions ask unlocked kana in the right script; drill questions ask the focus kana or a mix-up partner.
- **feedback.test.ts**: belt changes up, down and none; tips for pairs, the fallback line, and `pairTipFor`.
- **lesson.test.ts**: lesson length, `median`, and the lesson summary (XP, accuracy, strike speed, promotions).
- **saved.test.ts**: save then load gives the same progress; first launch, broken text and unknown versions start fresh; a version 1 save is upgraded; damaged entries are dropped.
- **grid.test.ts**: every row in order, locks for a new learner, belts and counts, scripts separate.
- **details.test.ts**: belt, accuracy, speed and wait for a kana; mix-ups counted both ways; a never-answered kana; `formatWait` wording.
