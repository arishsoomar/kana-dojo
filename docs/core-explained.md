# src/core explained, line by line

A plain walkthrough of every file in `src/core/`, written as of story I4.
If the code changes after that, line numbers here may drift.

`src/core/` is the learning engine. None of it draws anything on screen, reads the clock,
makes random numbers by itself, or saves anything. It only takes data in and gives data back.
The screens, hooks and storage outside `src/core/` do the rest: they read the clock
(`Date.now()`), make random numbers (`Math.random`), and pass them in.

---

## How the files fit together

Files are listed roughly in the order they build on each other.

| File | What it's for |
|---|---|
| `pairs.ts` | The named lookalike pairs: each pair's name and tip |
| `kana.ts` | The 92 kana, their rows and spellings, and which ones look alike |
| `boxes.ts` | Box numbers (levels), how long each box waits, belts, and "is it due?" |
| `goal.ts` | The daily goal choices, and counting lessons on a day |
| `answers.ts` | The learner's progress, and what one answer does to it |
| `unlock.ts` | Which rows are open, and which kana the learner has met |
| `belts.ts` | The belt a whole row qualifies for |
| `random.ts` | Shuffling with a random source that tests can control |
| `choices.ts` | The four answer tiles for a question |
| `pick.ts` | Which kana to ask next |
| `details.ts` | The data behind a kana's detail sheet, and its mix-ups |
| `question.ts` | A whole question (kana + tiles): practice or drill |
| `exam.ts` | Belt exams: which are due, which were passed, and the questions |
| `path.ts` | The plaques on the Learn screen, and plaque questions |
| `rank.ts` | The learner's overall rank (Karasu's form) |
| `duel.ts` | Duels: weak pairs, duel rules and scores, and the scroll collection |
| `tips.ts` | A memory tip for every kana |
| `feedback.ts` | Belt changes and tips for the wrong-answer sheet |
| `lesson.ts` | Lesson length, and the summary at the end (XP, accuracy, speed) |
| `saved.ts` | Turning progress into text to save, and reading it back safely |
| `merge.ts` | Combining two copies of progress (phone and cloud) |
| `grid.ts` | The data behind the belt grid on the Kana tab |
| `profile.ts` | The numbers on the Profile tab |
| `streak.ts` | The streak, rest days, and the week strip |
| `placement.ts` | The placement test for learners who already know some hiragana |
| `rain.ts` | The Kana Rain game |

Every file has a `.test.ts` file next to it, except `belts.ts`, whose one function is tested in `path.test.ts`. See the last section.

### The big picture: what happens when you answer

1. The lesson hook asks `path.ts` or `question.ts` for a question. They use `unlock.ts`
   (which kana are allowed), `pick.ts` (which one to ask) and `choices.ts` (the four tiles).
2. You tap a tile. The hook calls `recordAnswer` in `answers.ts`, which returns new
   progress: the kana's box moves up or down, its stats update, and a mistake is logged.
3. The hook saves the new progress (`saved.ts` turns it into text) and, if you're signed
   in, the cloud sync merges it with the account's copy (`merge.ts`).
4. At the end, `lesson.ts` builds the summary, and `completeLesson` records the lesson.
5. Everything else on screen (belts, the grid, the path, the rank, the streak, the
   profile) is worked out fresh from that saved progress each time it's shown.

---

## Words used everywhere

- **Value**: a piece of data. `5` is a value, `'あ'` is a value, `true` is a value.
- **String**: text, written in quotes: `'shi'`.
- **Number**: a number: `4000`. `60_000` is the same as `60000`; the `_` only makes it easier to read.
- **Boolean**: either `true` or `false`.
- **List (array)**: several values in order, in square brackets: `['a', 'ka', 'sa']`. Positions are counted from 0, so `'a'` is at position 0.
- **Object**: values stored under names, in curly braces: `{ box: 2, dueAt: 5000 }`. `box` and `dueAt` are **fields**. You read one with a dot: `progress.box`.
- **`const name = ...`**: gives a value a name. The name can't be pointed at a different value later.
- **`let name = ...`**: same, except the name *can* be given a new value later.
- **Function**: a named set of steps. It takes **parameters** (inputs) and **returns** a value (output).
- **`(x) => x + 1`**: a short way to write a function with no name. This one takes `x` and returns `x + 1`.
- **`type`**: a description of what shape some data must have. TypeScript checks it and then deletes it. It does not exist when the app runs.
- **`export`**: lets other files use this thing.
- **`import`**: uses something another file exported. `import type` brings in only a type.
- **`//`**: a comment. The computer ignores everything after it on that line. It's for people.
- **`null`**: a value that means "nothing here". `number | null` means "a number, or nothing".
- **`undefined`**: what you get when you read something that isn't there, like a field an object doesn't have.
- **`?`, `??`, `?.`**:
  - `a ?? b`: use `a`, unless `a` is missing (`undefined` or `null`); then use `b`.
  - `a?.b`: read `b` from `a`, but if `a` is missing, stop and give "missing" instead of crashing.
  - `condition ? A : B`: if the condition is true, use `A`, otherwise use `B`.
  - `score?: number` inside a type: the field is optional. It may be left out.
- **`!` after a value** (`list[i]!`): tells TypeScript "this is definitely not missing". It is only used where a comment explains why it's safe.
- **`!` before a value** (`!done`): "not". `!true` is `false`.
- **`&&`** means "and", **`||`** means "or", **`===`** means "is exactly equal to", **`!==`** means "is not equal to".
- **`...` (spread)**: copies all the items of a list, or all the fields of an object, into a new one. `[...list, x]` is a new list with everything from `list` and then `x`. `{ ...obj, a: 1 }` is a new object with every field of `obj`, and `a` set to 1.
- **`Set`**: a collection that holds each value once. `set.has(x)` quickly answers "is `x` in here?". `new Set(list)` drops repeats from a list, and `[...set]` turns it back into a list.
- **`Map`**: stores values under keys, like an object, with `map.get(key)` and `map.set(key, value)`.
- **List tools** used all over:
  - `.filter(check)`: a new list with only the items that pass the check.
  - `.map(change)`: a new list with every item changed.
  - `.flatMap(change)`: like `.map`, but each item can turn into a list, and all those lists are joined into one.
  - `.find(check)`: the first item that passes, or `undefined`.
  - `.some(check)`: `true` if at least one item passes. `.every(check)`: `true` if all pass.
  - `.includes(x)`: `true` if `x` is in the list.
  - `.indexOf(x)`: the position of `x` in the list (`-1` if it isn't there).
  - `.reduce((total, item) => ..., start)`: walks the list keeping a running result, starting from `start`.
  - `.slice(a, b)`: a copy of the items from position `a` up to (not including) `b`.
  - `.sort(compare)`: puts the list in order. `compare(a, b)` returns a negative number if `a` goes first, positive if `b` goes first.
- **Timestamps**: times are numbers of milliseconds, like `Date.now()` gives. 1000 milliseconds is one second.

---

## kana.ts: the 92 kana and facts about them

**Line 1**: imports the named pairs from `pairs.ts`, which `lookalikesOf` uses at the bottom of this file.

**Line 3**
```ts
export type Script = 'hiragana' | 'katakana';
```
A `Script` can only be the exact text `'hiragana'` or `'katakana'`. `|` means "or".

**Line 6**
```ts
export const ROWS = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'] as const;
```
The ten row names, in the order they unlock. `as const` tells TypeScript to remember these exact ten strings in this exact order.

**Line 8**
```ts
export type RowId = (typeof ROWS)[number];
```
`RowId` means "one of the strings in `ROWS`". `typeof ROWS` is the type of the list, and `[number]` means "any one item from it". The names are written once, on line 6.

**Lines 10–16**
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

**Line 19**
```ts
const TABLE: readonly [RowId, string, string, string, ...string[]][] = [
```
A list named `TABLE`, only used in this file. Each line in it has: a row name, the hiragana, the katakana, the first spelling, then any extra spellings.

**Lines 20–29**: the data. 46 lines, one per sound. `['sa', 'し', 'シ', 'shi', 'si']` means row `sa`, hiragana し, katakana シ, spellings `shi` and `si`.

**Lines 32–38**
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
- `([row, hiragana, katakana, first, ...rest])` splits one table line into named parts. `...rest` collects everything left over (extra spellings) into a list.
- Line 33 puts the spellings back together: `[first, ...rest]`. `Kana['romaji']` means "the type of the `romaji` field of `Kana`".
- Each table line becomes **two** kana: one hiragana, one katakana, with the same row and spellings. 46 × 2 = 92.
- `row,` on its own is short for `row: row`.
- The order of `KANA` is the kana chart: あ い う え お, then か き く け こ, and so on. `choices.ts` uses that order to line up the answer tiles.

**Lines 40–43**
```ts
export function matchesRomaji(kana: Kana, input: string): boolean {
  const answer = input.trim().toLowerCase();
  return kana.romaji.includes(answer);
}
```
- Checks whether typed text is a correct spelling of a kana.
- `.trim()` removes spaces at the start and end. `.toLowerCase()` makes capital letters small. `' Shi '` becomes `'shi'`.

**Lines 45–50**
```ts
export function lookalikesOf(char: string): string[] {
  return NAMED_PAIRS.filter(({ kana }) => kana.includes(char)).flatMap(({ kana }) =>
    kana.filter((other) => other !== char),
  );
}
```
- Returns the kana that look like `char`: the other kana of every named pair it's in (see `pairs.ts`).
- `.filter(...)` keeps only the pairs that contain `char`.
- `.flatMap(...)` then takes each kept pair, removes `char` itself, and joins the results.
- `lookalikesOf('ね')` returns `['わ', 'れ']`, because ね is in two pairs. A kana in no pair, like や, gets `[]`.

---

## pairs.ts: the named lookalike pairs

**Lines 5–9**
```ts
export type NamedPair = {
  kana: readonly [string, string];
  name: string;
  tip: string;
};
```
One pair of kana that look alike: the two characters, a name for its duel and scroll (like "The shadow twins"), and a tip for telling them apart. `readonly [string, string]` means exactly two strings, which can't be changed.

**Lines 11–34**: `NAMED_PAIRS`, all 19 pairs: 11 hiragana, then 8 katakana. Every tip names both kana and one difference you can see, like `'お has a little dash off to the top right. あ has no dash.'`.

This list is used in three places:
- `lookalikesOf` in `kana.ts`: two kana count as lookalikes when they're a named pair. That decides which wrong-answer tiles are chosen first, and which kana a drill mixes in.
- `pairTip` in `feedback.ts`: the tip on the wrong-answer sheet when you mix up a pair.
- `duel.ts`: every duel and scroll is one of these pairs.

This file imports nothing. That matters: `kana.ts` imports it, and if it imported `kana.ts` back (directly or through another file), the two would each need the other to finish loading first.

**Lines 37–39**: `pairId`, a pair's id: its two kana joined, like `'シツ'`. It's used in the duel's address (`/duel?pair=シツ`) and in saved duel results.

**Lines 42–44**: `pairById`, the pair with that id, or `null`. The duel screen uses it to turn the address back into a pair.

---

## boxes.ts: boxes, waiting times, belts, "is it due"

Every kana has a **box** from 0 to 7. On screen we call it a level. The box decides the belt.

**Lines 1–4**: `SECOND`, `MINUTE`, `HOUR`, `DAY` in milliseconds. `*` means multiply.

**Lines 9–18**
```ts
const INTERVALS: readonly number[] = [
  0,
  0,
  0,
  20 * MINUTE,
  6 * HOUR,
  2 * DAY,
  7 * DAY,
  21 * DAY,
];
```
How long a kana waits after reaching each box before it is due again. The position is the box number: `INTERVALS[3]` is 20 minutes, `INTERVALS[7]` is 21 days.

Boxes 0, 1 and 2 (white belt) wait 0. That means a white-belt kana is always due, so it moves up with every quick right answer. Reaching green takes right answers, not time. From green up, the waits are what make a belt mean "you still knew it after a break".

**Line 20**
```ts
export const MAX_BOX = INTERVALS.length - 1;
```
`.length` is how many items the list has (8). So `MAX_BOX` is 7.

**Lines 22–26**
```ts
export function intervalFor(box: number): number {
  const clamped = Math.min(Math.max(box, 0), MAX_BOX);
  return INTERVALS[clamped]!;
}
```
- Returns the waiting time for a box.
- `Math.max(box, 0)` turns anything below 0 into 0. `Math.min(..., MAX_BOX)` turns anything above 7 into 7.
- The `!` is safe because `clamped` is always 0 to 7.

**Line 29**: `BELTS`, the four belts, lowest first: `'white'`, `'green'`, `'brown'`, `'black'`.

**Line 31**: `Belt` is one of those four names, built from `BELTS` the same way `RowId` is built from `ROWS`.

**Lines 33–38**
```ts
export function tierOf(box: number): Belt {
  if (box >= 7) return 'black';
  if (box >= 5) return 'brown';
  if (box >= 3) return 'green';
  return 'white';
}
```
Turns a box number into a belt. It checks from the top down and stops at the first match. `return` ends the function. Boxes 0–2 reach the last line: white.

**Lines 41–45**: `KanaProgress`, the learner's progress on one kana: its `box`, and `dueAt`, the time it's next due.

**Lines 47–49**
```ts
export function isDue(progress: KanaProgress, now: number): boolean {
  return now >= progress.dueAt;
}
```
`true` if the current time is at or after the due time. The time is given to the function as `now`; it never reads the clock itself.

---

## goal.ts: the daily goal

**Lines 5–10**
```ts
export const DAILY_GOALS = [
  { minutes: 5, lessons: 1, name: 'Casual' },
  ...
] as const;
```
The four daily goals. The learner picks one by minutes, but the app only ever counts lessons, never time. So "10 minutes" really means "2 lessons a day".

**Line 12**: `DEFAULT_DAILY_GOAL = 2` lessons.

**Lines 14–16**
```ts
export function isDailyGoal(value: unknown): value is number {
  return DAILY_GOALS.some((g) => g.lessons === value);
}
```
- `true` if `value` is one of the allowed lesson counts (1, 2, 3 or 4).
- `unknown` means "could be anything". It's used when reading a save, where the value hasn't been checked yet.
- `value is number` is a promise to TypeScript: "if this returns `true`, `value` is a number". After the check, TypeScript lets the code use it as one.

**Lines 18–20**: `setDailyGoal` returns new progress with `settings.dailyGoal` changed. Everything else is copied over with `...`.

**Lines 23–25**
```ts
export function lessonsOn(finishedDays: readonly string[], day: string): number {
  return finishedDays.filter((d) => d === day).length;
}
```
How many lessons were finished on one day. Days are written as `"2026-09-25"`. The hook turns each lesson's timestamp into a day first, because that needs the phone's timezone, and the engine never deals with timezones.

---

## answers.ts: the learner's progress, and what one answer does to it

**Lines 5–8**: `Confusion`, one mistake: the kana that was `shown`, and the kana `guessed` instead.

**Lines 11–15**
```ts
export type KanaStats = {
  seen: number;
  correct: number;
  recentMs: readonly number[];
};
```
A kana's answer history: how many times it was answered, how many of those were correct, and how long the most recent correct answers took (in milliseconds, oldest first).

**Lines 19–24**: `Completion`, one finished lesson, game, exam or duel: its name (`lesson`, like `'hiragana:a:0'` or `'rain'`), when it finished (`at`), for games, exams and duels a `score`, and for duels the opponent's score (`opponent`). `score?:` means it can be left out.

**Lines 27–32**: `Settings`, the learner's choices: whether they've been through the welcome (`onboarded`), their daily goal, which script the Learn screen shows, and whether kana are spoken aloud (`sound`).

**Lines 34–40**
```ts
export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
  stats: Readonly<Record<string, KanaStats>>;
  completed: readonly Completion[];
  settings: Settings;
};
```
Everything the app knows about the learner. This is what gets saved.
- `kana`: for each character, its box and due time. `Record<string, KanaProgress>` means "an object whose field names are strings (characters) and whose values are `KanaProgress`". Example: `{ シ: { box: 2, dueAt: 5000 } }`. A kana that has never been answered has no entry at all.
- `confusions`: every mistake, in order.
- `stats`: for each character, its answer history.
- `completed`: every finished lesson, game and exam.
- `settings`: the learner's choices.
- `Readonly` and `readonly` mean none of these can be changed in place. Every change makes a new object.

**Lines 43–49**: `EMPTY_PROGRESS`, the progress of someone who has just installed the app.

**Lines 51–56**: `Answer`, one answer: the kana shown (`char`), the kana picked (`guess`), how many milliseconds it took (`ms`), and when it happened (`now`). `guess` can be `null`, which means no answer was given (a kana that landed in Kana Rain).

**Line 59**: `FAST_MS = 4000`. An answer must take less than 4 seconds to move a kana up a box.

**Lines 61–68**
```ts
function afterCorrect(current: KanaProgress, answer: Answer): KanaProgress {
  if (tierOf(current.box) !== 'white' && !isDue(current, answer.now)) return current;

  const box = answer.ms < FAST_MS ? Math.min(current.box + 1, MAX_BOX) : current.box;
  return { box, dueAt: answer.now + intervalFor(box) };
}
```
- The new box and due time after a **correct** answer. Not exported, so only this file uses it.
- Line 64: if the kana is green or better **and** not due yet, nothing changes. This is "no free promotions": a green kana can't climb by being answered again and again in one sitting.
- White-belt kana skip that check, so every quick right answer counts. This also matters for older saves, which may have white-belt kana with a due time in the future (from when white belt had waits). Those still move up.
- Line 66: if it took under 4 seconds, the box goes up by 1 (but not past 7). Otherwise the box stays.
- Line 67: either way, it's due again after that box's waiting time.

**Line 71**: `WRONG_DROP = 2`.

**Lines 73–75**
```ts
function afterWrong(current: KanaProgress, answer: Answer): KanaProgress {
  return { box: Math.max(current.box - WRONG_DROP, 0), dueAt: answer.now };
}
```
After a **wrong** answer: down 2 boxes (not below 0), and due right away. There is no "is it due" check, so a wrong answer always counts.

**Line 78**: `NEW_KANA = { box: 0, dueAt: 0 }`, used for a kana with no progress yet. Time 0 is long ago, so it is always due.

**Line 80**: `NEW_STATS`, stats for a kana never answered: all zero.

**Line 83**: `RECENT_TIMES = 10`, how many recent correct times to keep.

**Lines 85–91**
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
- If right, the time is added to the end of `recentMs`. `.slice(-RECENT_TIMES)` keeps only the last 10 items (a negative number counts from the end). If wrong, the times stay the same.

**Lines 93–121**: `recordAnswer`, the main function. It takes all the progress and one answer, and returns **new** progress. The old progress is never changed.

```ts
  const current = progress.kana[answer.char] ?? NEW_KANA;
  const correct = answer.guess === answer.char;
```
Looks up the shown kana's progress (or `NEW_KANA` if there is none). The answer is correct if the picked kana is the shown kana.

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
If correct: a new progress object. `...progress` copies every field. Then `kana` is replaced by a copy with the shown kana updated, and `stats` by the new stats. `stats,` alone is short for `stats: stats`.

```ts
  const confusions =
    answer.guess === null
      ? progress.confusions
      : [...progress.confusions, { shown: answer.char, guessed: answer.guess }];
```
If the code gets here, the answer was wrong. If a kana was picked, the mistake is added to the end of the log. If nothing was picked (`null`), the log stays the same, because nothing was confused with anything.

```ts
  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    stats,
    confusions,
  };
```
Same as the correct case, but using `afterWrong`, and with the new mistake log.

**Lines 124–127**
```ts
export function completeLesson(progress: Progress, lesson: string, now: number, score?: number): Progress {
  const record: Completion = score === undefined ? { lesson, at: now } : { lesson, at: now, score };
  return { ...progress, completed: [...progress.completed, record] };
}
```
Adds a finished lesson to the end of `completed`. `score?:` in the parameters means the score can be left out. If it is, the record has no `score` field at all.

**Lines 130–133**
```ts
export function bestScore(progress: Progress, lesson: string): number | null {
  const scores = progress.completed.flatMap((c) => (c.lesson === lesson && c.score !== undefined ? [c.score] : []));
  return scores.length === 0 ? null : Math.max(...scores);
}
```
- The highest score for a game, or `null` if it has never been played.
- The `.flatMap` turns each matching record into `[score]` and every other record into `[]` (nothing). Joined together, that's a list of just the scores.
- `Math.max(...scores)` passes each score to `Math.max` separately and gives the largest.

**Lines 138–141**: `markDue` makes a kana due now without changing its box, stats or mistakes. `Math.min(current.dueAt, now)` keeps an earlier due time if it already had one. Kana Rain uses it for a kana that landed before the player had started typing it: that says nothing about whether they know it, so it isn't scored, but it should come up again soon.

**Lines 144–156**: `finishOnboarding` sets `onboarded` to `true`. `setScript` sets which script the Learn screen shows. `setSound` turns speaking kana on or off. All three copy everything else.

**Lines 159–166**: `isEmptyProgress`, `true` when nothing has been trained: no kana, stats, mistakes or finished lessons. Settings don't count. (Nothing in the app uses it any more since G4; only its tests do.)

---

## unlock.ts: which rows are open, and which kana the learner has met

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
- Line 17 gets that row's kana in the chosen script.
- Line 18 adds them to the list. `.push` adds items to the end. Changing `unlocked` is fine because this function created it.
- Line 20 counts how many of the row are green or better.
- Line 21: if fewer than 80% are, `break` stops the loop, so no more rows are added.
- The result is every row up to and including the first one that isn't 80% green. For a 5-kana row, that means 4 of 5 green opens the next row.

**Lines 28–32**
```ts
export function greenNeeded(progress: Progress, script: Script, row: RowId): number {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const green = rowKana.filter((k) => isGreenOrBetter(progress, k)).length;
  return Math.max(Math.ceil(rowKana.length * UNLOCK_SHARE) - green, 0);
}
```
- How many more kana in a row must turn green before the next row opens. Karasu's message on the Learn screen uses it.
- `Math.ceil` rounds **up**. 5 × 0.8 = 4, and 3 × 0.8 = 2.4 rounds up to 3. So a 3-kana row (like や) needs all 3.
- `Math.max(..., 0)` stops it going below 0 when more than enough are green.

**Lines 36–38**
```ts
export function metKana(progress: Progress, script: Script): Kana[] {
  return unlockedKana(progress, script).filter((k) => progress.kana[k.char] !== undefined);
}
```
- The open kana the learner has **met**: ones that have an entry in `progress.kana`. A kana gets an entry the first time it's answered, or when the placement test places it.
- When a new row opens, its kana have no entries yet, so they stay out of practice until a plaque teaches them.

---

## belts.ts: the belt a whole row qualifies for

**Lines 7–12**
```ts
export function rowBelt(progress: Progress, script: Script, row: RowId): Belt {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const lowest = Math.min(...rowKana.map((k) => BELTS.indexOf(tierOf((progress.kana[k.char] ?? NEW_KANA).box))));
  return BELTS[lowest]!;
}
```
- A row qualifies for the belt of its **weakest** kana. If four kana are green and one is white, the row qualifies for white.
- Line 9, from the inside out: each kana's box, turned into a belt (`tierOf`), turned into a number (`BELTS.indexOf`: white 0, green 1, brown 2, black 3). Numbers can be compared; belt names can't. `Math.min` finds the smallest.
- Line 11 turns that number back into a belt name.
- Qualifying isn't the same as having the belt. The belt is only **awarded** by passing an exam. See `exam.ts`.

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
- `<T>` stands for "any type". Give it a list of kana, and `T` is `Kana`. This is called a **generic**.
- Line 7 makes a copy. Only the copy is changed.
- Line 8 is a counting loop: start `i` at the last position, keep going while `i > 0`, and subtract 1 each time (`i--`).
- Line 9 picks a random whole number `j` from 0 to `i`. `Math.floor` removes the decimal part.
- Line 11 swaps the items at positions `i` and `j`.
- The result is the same items in a random order.

---

## choices.ts: the four answer tiles

**Line 4**: `CHOICE_COUNT = 4`.

**Lines 9–25**: `makeChoices` returns 4 kana: the correct one and 3 wrong options taken from `pool`.

```ts
  const lookalikes = lookalikesOf(answer.char);
  const isLookalike = (k: Kana) => lookalikes.includes(k.char);
  const candidates = [...pool.filter(isLookalike), ...shuffle(pool.filter((k) => !isLookalike(k)), rng)];
```
- `isLookalike` is a small function: `true` if a kana looks like the answer.
- `candidates` is one list: the lookalikes from the pool first, then everything else from the pool in random order. Lookalikes come first so they get picked first. That makes the question harder in a useful way.

```ts
  const chosen: Kana[] = [answer];
  const usedRomaji = new Set(answer.romaji);
```
The choices start with just the answer. `usedRomaji` starts with the answer's spellings.

```ts
  for (const candidate of candidates) {
    if (chosen.length === CHOICE_COUNT) break;
    if (candidate.romaji.some((r) => usedRomaji.has(r))) continue;
    chosen.push(candidate);
    candidate.romaji.forEach((r) => usedRomaji.add(r));
  }
```
- Go through the candidates in order. Stop once there are 4.
- If any of the candidate's spellings is already used, `continue` skips to the next candidate. This stops two tiles from showing the same spelling (like し and シ, both "shi"), and skips the answer itself.
- Otherwise add the candidate, and mark its spellings as used. `.forEach` runs a function once for each item.

```ts
  return chosen.sort((a, b) => KANA.indexOf(a) - KANA.indexOf(b));
```
The 4 choices in kana-chart order (a i u e o, ka ki ku…), not shuffled. Each kana's tile is always in the same place relative to the others, so your eyes stay on the kana instead of hunting for the answer. `KANA.indexOf(a) - KANA.indexOf(b)` is negative when `a` comes earlier in the chart, so `a` goes first. `.sort` changes `chosen` itself, which is fine because this function created it.

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
Each kana gets a **weight**. Bigger means more likely to be picked. `8 - box`: box 0 gives 8, box 7 gives 1. Due kana are multiplied by 10. White-belt kana are always due, so the kana you know least come up most.

**Lines 16–32**: `pickNext`.

```ts
  if (candidates.length === 0) throw new Error('pickNext needs at least one candidate');
```
If there's nothing to pick from, `throw` stops with an error message. It never happens in the app; the callers always pass at least one kana.

```ts
  const weighted = candidates.map((kana) => ({
    kana,
    weight: weightOf(progress.kana[kana.char] ?? NEW_KANA, now),
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
```
- One `{ kana, weight }` object for each candidate. The round brackets around `{ ... }` make it an object, not a block of steps.
- `total` is all the weights added up.

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

## details.ts: a kana's detail sheet, and its mix-ups

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
- Strike speed: the median of the recent correct times (see `median` in `lesson.ts`), or `null`.
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
Turns a wait into short text: `'Now'`, `'20 min'`, `'6 hours'`, `'2 days'`. Text in backticks with `${...}` puts values into the text. `Math.ceil` rounds **up**, so 30 seconds shows as "1 min", never "0 min".

**Lines 52–54**: `plural` adds an "s" unless the count is 1: `1 day`, `2 days`.

---

## question.ts: a whole question

**Lines 9–12**: `Question`, one kana to ask and its four tiles.

**Lines 17–23**
```ts
export function avoiding(options: readonly Kana[], avoid?: string, fallback: readonly Kana[] = []): readonly Kana[] {
  if (!avoid) return options;
  const others = options.filter((k) => k.char !== avoid);
  if (others.length > 0) return others;
  const fallbackOthers = fallback.filter((k) => k.char !== avoid);
  return fallbackOthers.length > 0 ? fallbackOthers : options;
}
```
- Makes sure the same kana is never asked twice in a row. `avoid` is the kana just asked.
- `avoid?:` means it can be left out (the first question has nothing to avoid). `fallback: ... = []` means that if `fallback` is left out, it's an empty list.
- Line 19: the options without the kana just asked. If any are left, use them.
- If none are left (the only option **was** the kana just asked), try the `fallback` list the same way.
- If that leaves nothing too, there really is only one kana, so it's asked again.

**Lines 27–32**
```ts
export function makeQuestion(progress: Progress, script: Script, now: number, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, script);
  const met = metKana(progress, script);
  const kana = pickNext(progress, avoiding(met.length > 0 ? met : unlocked, avoid), now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
```
A practice question:
- The kana to ask comes from the kana you've **met**. For a brand-new learner who hasn't met any, it falls back to every unlocked kana, so practice is never empty.
- `avoiding` removes the kana just asked, and `pickNext` picks one.
- The wrong tiles come from **every** unlocked kana, met or not. They're only romaji labels, so an unmet kana there does no harm.

**Line 35**: `DRILL_FOCUS_SHARE = 0.5`, meaning half.

**Lines 40–51**: `makeDrillQuestion`, a question for drilling one kana (`focus`).

```ts
  const unlocked = unlockedKana(progress, focus.script);
  const mixUps = new Set(mixUpsOf(progress, focus.char).map((m) => m.char));
  const met = new Set(metKana(progress, focus.script));
  const lookalikes = lookalikesOf(focus.char);
  const partners = unlocked.filter((k) => mixUps.has(k.char) || (met.has(k) && lookalikes.includes(k.char)));
```
- `partners`: the unlocked kana to drill alongside the focus kana. A kana is a partner if you've mixed it up with the focus kana, **or** it looks like the focus kana and you've met it.
- Mix-ups always count, even if you've never been asked that kana: picking it as a wrong answer is exactly why it belongs in the drill.

```ts
  const preferFocus = partners.length === 0 || rng() < DRILL_FOCUS_SHARE;
  const options = avoiding(preferFocus ? [focus] : partners, avoid, [focus, ...partners]);
  const kana = pickNext(progress, options, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
```
- If there are no partners, or the random number is below 0.5, ask the focus kana. Otherwise ask a partner. So about half the questions are the focus kana.
- `avoiding` stops a repeat. If the focus kana was just asked, the fallback `[focus, ...partners]` lets a partner be asked instead.

---

## exam.ts: belt exams

A row **qualifies** for a belt when all its kana reach it (see `belts.ts`). The belt is only **awarded** by passing a timed exam on that row. Exam results are saved in `completed`, like lessons, with the number correct as the score.

**Lines 11–14**: an exam is 20 questions (`EXAM_LENGTH`), you need 18 right to pass (`EXAM_PASS`), you get 60 seconds (`EXAM_TIME_MS`), so you can miss at most 2 (`MAX_MISSES`).

**Lines 16–18**: `examId` names an exam, like `'exam:hiragana:ka:green'`.

**Lines 21–29**
```ts
function highestPassed(progress: Progress, script: Script, row: RowId): number {
  let highest = 0;
  BELTS.forEach((belt, index) => {
    const id = examId(script, row, belt);
    const passed = progress.completed.some((c) => c.lesson === id && (c.score ?? 0) >= EXAM_PASS);
    if (passed) highest = Math.max(highest, index);
  });
  return highest;
}
```
- The highest belt exam passed for a row, as a number (0 is white, meaning none).
- For each belt, look for a finished exam with that id and a score of at least 18.
- `.forEach((belt, index) => ...)` also gives each item's position.

**Lines 32–36**
```ts
export function awardedBelt(progress: Progress, script: Script, row: RowId): Belt {
  const qualified = BELTS.indexOf(rowBelt(progress, script, row));
  return BELTS[Math.min(highestPassed(progress, script, row), qualified)]!;
}
```
The belt a row shows: the highest exam passed, but never above what its kana are now. If you passed the green exam and then a kana slips back to white, the row shows white until it's green again. You don't need to retake the exam.

**Lines 40–43**
```ts
export function examDue(progress: Progress, script: Script, row: RowId): Belt | null {
  const qualified = rowBelt(progress, script, row);
  return BELTS.indexOf(qualified) > highestPassed(progress, script, row) ? qualified : null;
}
```
The exam a row can take now: the belt it qualifies for, if that's higher than any exam already passed. Otherwise `null`.

**Lines 48–59**
```ts
export function examQuestions(script: Script, row: RowId, rng: Rng): Kana[] {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const questions: Kana[] = [];
  while (questions.length < EXAM_LENGTH) {
    let round = shuffle(rowKana, rng);
    if (round.length > 1 && round[0] === questions[questions.length - 1]) {
      round = [...round.slice(1), ...round.slice(0, 1)];
    }
    questions.push(...round);
  }
  return questions.slice(0, EXAM_LENGTH);
}
```
- `while (...)` repeats the block as long as the condition is true.
- Each **round** is the whole row, shuffled. Rounds are added until there are at least 20 questions. A 5-kana row makes 4 rounds; each kana is asked 4 times.
- Line 53: if a round would start with the kana the last round ended on, the first kana is moved to the end of the round (`slice(1)` is everything after the first; `slice(0, 1)` is just the first). So the same kana never comes twice in a row.
- Line 58 cuts the list to exactly 20 (a 3-kana row makes 21 in 7 rounds).

**Lines 65–69**
```ts
export function examStatus({ correct, misses, timeUp }: { ... }): ExamStatus {
  if (misses > MAX_MISSES) return 'failed';
  if (timeUp || correct + misses >= EXAM_LENGTH) return correct >= EXAM_PASS ? 'passed' : 'failed';
  return 'going';
}
```
- Where an exam stands. The `{ correct, misses, timeUp }` in the brackets takes those three fields out of the object passed in.
- The third miss fails at once, since 18 can no longer be reached.
- When time runs out or all 20 are answered, it's passed with 18 or more right.
- Otherwise it's still going.

---

## path.ts: the plaques on the Learn screen

**Lines 13–19**: `Plaque`, one lesson on the wall: an id (like `'hiragana:ka:0'`), its script and row, whether it's a `'learn'` plaque that teaches new kana or the `'mixed'` plaque that reviews the whole row, and its kana.

**Line 21**: a plaque is `'done'`, `'current'` (the next one to do), or `'locked'`.

**Lines 23–31**: `PathUnit`, one row on the wall: its row, its number (1 for あ), whether it's open, its awarded belt, the exam it can take now (or `null`), its plaques with their states, and how many are done.

**Lines 33–37**: `LearnPath`, the whole wall: every unit, the current plaque (`null` when every open plaque is done), and the unit to show at the top of the screen.

**Line 40**: `KANA_PER_PLAQUE = 2`.

**Lines 42–50**
```ts
export function plaquesFor(script: Script, row: RowId): Plaque[] {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const learn: Plaque[] = [];
  for (let i = 0; i < rowKana.length; i += KANA_PER_PLAQUE) {
    const number = i / KANA_PER_PLAQUE;
    learn.push({ id: `${script}:${row}:${number}`, script, row, kind: 'learn', kana: rowKana.slice(i, i + KANA_PER_PLAQUE) });
  }
  return [...learn, { id: `${script}:${row}:mixed`, script, row, kind: 'mixed', kana: rowKana }];
}
```
- The row's kana in groups of two: あ い, then う え, then お on its own (the last group gets whatever is left). `i += 2` means "add 2 to `i`" each time round.
- Then one `'mixed'` plaque with the whole row.

**Lines 55–63**: `plaqueById` finds a plaque from its id by building every plaque in both scripts and every row, and returning the first match. The lesson screen uses it to turn the id in the address back into a plaque.

**Lines 67–101**: `learnPath`, the whole wall.

```ts
  const openRows = new Set(unlockedKana(progress, script).map((k) => k.row));
  const finished = new Set(progress.completed.map((c) => c.lesson));
  let current: Plaque | null = null;
  let currentUnit: PathUnit | null = null;
  let lastOpen: PathUnit | null = null;
```
Which rows are open, which lessons are finished, and three names that get filled in while walking the rows.

```ts
    const plaques = plaquesFor(script, row).map((plaque) => {
      let state: PlaqueState = 'locked';
      if (finished.has(plaque.id)) state = 'done';
      else if (open && !current) {
        state = 'current';
        current = plaque;
      }
      return { plaque, state };
    });
```
Each plaque is done if it was finished. The first unfinished plaque in an open row becomes `current`. After that, `current` is set, so every later plaque stays locked. That's what makes plaques open one at a time, in order.

Lines 85–96 build the unit, remember which unit holds the current plaque, and remember the last open unit.

```ts
  return { units, current, currentUnit: currentUnit ?? lastOpen! };
```
The unit shown at the top is the one with the current plaque. If every plaque is done, it's the last open row. The `!` is safe because the first row is always open.

**Line 105**: `PLAQUE_FOCUS_SHARE = 0.7`.

**Lines 107–116**
```ts
export function makePlaqueQuestion(progress: Progress, plaque: Plaque, now: number, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, plaque.script);
  const review = metKana(progress, plaque.script).filter((k) => !plaque.kana.includes(k));
  const pool = [...new Set([...unlocked, ...plaque.kana])];

  const preferPlaque = review.length === 0 || rng() < PLAQUE_FOCUS_SHARE;
  const options = avoiding(preferPlaque ? plaque.kana : review, avoid, [...plaque.kana, ...review]);
  const kana = pickNext(progress, options, now, rng);
  return { kana, choices: makeChoices(kana, pool, rng) };
}
```
- A question in a plaque lesson. About 70% ask the plaque's own kana; the rest review other kana you've **met**.
- For your very first plaque there's nothing to review, so every question is one of the plaque's kana.
- `pool`, where the tiles come from, is every unlocked kana plus the plaque's kana, without repeats.

---

## rank.ts: the learner's overall rank

**Lines 10–15**
```ts
const ROWS_NEEDED: Record<Belt, number> = {
  white: 0,
  green: 3,
  brown: 10,
  black: SCRIPTS.length * ROWS.length,
};
```
How many rows (out of 20: 10 hiragana and 10 katakana) must have **earned** a belt, by exam, for your overall rank to reach it. Black needs all 20.

**Lines 18–27**
```ts
export function overallRank(progress: Progress): Belt {
  const earned = SCRIPTS.flatMap((script) => ROWS.map((row) => BELTS.indexOf(awardedBelt(progress, script, row))));
  let rank: Belt = 'white';
  BELTS.forEach((belt, index) => {
    const rows = earned.filter((e) => e >= index).length;
    if (rows >= ROWS_NEEDED[belt]) rank = belt;
  });
  return rank;
}
```
- `earned`: all 20 rows' awarded belts, as numbers.
- For each belt, lowest first: count the rows at that belt **or higher** (a brown row also counts toward green). If that's enough, that becomes the rank. Later belts overwrite earlier ones, so the result is the highest rank reached.
- The rank sets Karasu's form.

---

## duel.ts: duels and scrolls

A duel is fast rounds on one named pair that you keep mixing up. Winning one earns that pair's scroll.

**Line 11**: `DUEL_READY_MIXUPS = 3`. A pair's duel is offered once you've mixed it up 3 times.

**Lines 15–19**: `WeakPair`, one named pair with how many times you've mixed it up (`mixUps`) and whether its duel is `ready`.

**Lines 23–33**
```ts
export function weakPairs(progress: Progress): WeakPair[] {
  const open = new Set(SCRIPTS.flatMap((script) => unlockedKana(progress, script)).map((k) => k.char));

  return NAMED_PAIRS.map((pair) => {
    const [a, b] = pair.kana;
    const mixUps = progress.confusions.filter(
      ({ shown, guessed }) => (shown === a && guessed === b) || (shown === b && guessed === a),
    ).length;
    return { pair, mixUps, ready: mixUps >= DUEL_READY_MIXUPS && open.has(a) && open.has(b) };
  }).sort((x, y) => y.mixUps - x.mixUps);
}
```
- `open`: every unlocked kana in both scripts, as a `Set` of characters.
- For each named pair, count the mistakes where one of the two was shown and the other was picked, either way round.
- It's `ready` with 3 or more mix-ups, as long as both kana are unlocked.
- Sorted most mixed-up first. `.sort` keeps equal items in their original order, so pairs with the same count stay in `NAMED_PAIRS` order.

**Lines 37–38**: `DUEL_WIN = 10`, `DUEL_LOSS = 5`. You win at 10 points; the opponent wins at 5, so you can miss at most 4 times.

**Line 40**: `DuelScore`, `{ mine, theirs }`.

**Lines 44–48**: `duelStatus`, `'won'` at 10 of mine, `'lost'` at 5 of theirs, otherwise `'going'`.

**Lines 52–56**
```ts
export function scorePoint(score: DuelScore, answer: { correct: boolean; ms: number }): DuelScore {
  if (duelStatus(score) !== 'going') return score;
  if (!answer.correct) return { ...score, theirs: score.theirs + 1 };
  return answer.ms < FAST_MS ? { ...score, mine: score.mine + 1 } : score;
}
```
- The score after one answer.
- Once the duel is over, nothing changes, so a late tap can't change a finished result.
- A wrong answer is the opponent's point. A right answer under 4 seconds is yours. A right but slow answer is nobody's.
- It returns a new score object; the one passed in is never changed.

**Lines 61–66**
```ts
export function duelQuestion(pair: NamedPair, rng: Rng): Question {
  const choices = KANA.filter((k) => pair.kana.includes(k.char));
  const kana: Kana = choices[rng() < 0.5 ? 0 : 1]!;
  return { kana, choices };
}
```
- One point of a duel. `choices` is the pair's two kana, taken from `KANA` so they're in chart order.
- The kana asked is either one, at random. Unlike lessons, the same kana can come twice in a row: with only two kana, taking turns would tell you every answer.
- It returns a `Question`, the same shape lessons use, so the screen can reuse the answer tiles.

**Lines 69–71**: `duelId`, how a duel is named in the finished-lesson records: `'duel:シツ'`.

**Lines 74–77**
```ts
export function completeDuel(progress: Progress, pair: NamedPair, score: DuelScore, now: number): Progress {
  const record: Completion = { lesson: duelId(pair), at: now, score: score.mine, opponent: score.theirs };
  return { ...progress, completed: [...progress.completed, record] };
}
```
Records a finished duel, won or lost, with both scores. Like any finished record, it counts toward the streak and the daily goal.

**Lines 79–88**: `ScrollState` is `'won'`, `'ready'` or `'locked'`. `Scroll` is one slot in the collection: the pair, its mix-ups, its state, and its first win (when, and the score), or `null`.

**Lines 94–106**: `scrolls`, the whole collection.

```ts
      const wins = progress.completed
        .filter((c) => c.lesson === duelId(pair))
        .map((c) => ({ at: c.at, score: { mine: c.score ?? 0, theirs: c.opponent ?? 0 } }))
        .filter((c) => duelStatus(c.score) === 'won');
```
Every finished duel for this pair, turned into a time and a score, keeping only the wins.

```ts
      const firstWin = wins.reduce<Scroll['firstWin']>((first, win) => (first === null || win.at < first.at ? win : first), null);
      const state = firstWin ? 'won' : ready ? 'ready' : 'locked';
```
- The earliest win, or `null` if there isn't one. `Scroll['firstWin']` means "the type of the `firstWin` field of `Scroll`".
- A pair with a win is `'won'`. Otherwise it's `'ready'` if its duel is ready, or `'locked'`.

```ts
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state));
```
Won scrolls first, then ready, then locked. Within each group, the order from `weakPairs` stays: most mixed-up first.

---

## tips.ts: a memory tip for every kana

**Lines 4–100**: `KANA_TIPS`, an object with one tip for each of the 92 kana, like `し: 'One stroke that dips and curves up, like a fishing hook. She went fishing: shi.'`. Each tip ties the kana's shape to its sound. `Readonly<Record<string, string>>` means "an object from character to text, which can't be changed".

**Lines 103–105**
```ts
export function kanaTip(char: string): string | null {
  return KANA_TIPS[char] ?? null;
}
```
The tip for a kana, or `null` if there isn't one (for something that isn't a kana).

---

## feedback.ts: belt changes and tips for the wrong-answer sheet

**Line 7**: `BeltChange`, the belt before and after.

**Lines 9–11**: `beltOf`, the belt of one kana in some progress (white if it has no progress).

**Lines 14–18**
```ts
export function beltChange(before: Progress, after: Progress, char: string): BeltChange | null {
  const from = beltOf(before, char);
  const to = beltOf(after, char);
  return from === to ? null : { from, to };
}
```
Compares a kana's belt before and after an answer. If it's the same, `null`. Otherwise `{ from, to }`.

**Lines 21–23**
```ts
function pairTip(a: string, b: string): string | null {
  return NAMED_PAIRS.find(({ kana }) => kana.includes(a) && kana.includes(b))?.tip ?? null;
}
```
- The tip for telling `a` and `b` apart, from the named pair that contains both (see `pairs.ts`).
- `({ kana })` takes the `kana` field out of each pair.
- `?.tip` reads the tip if a pair was found. `?? null` turns "missing" into `null`.

**Lines 26–32**: `pairTipFor` tries each kana in `others` in order and returns the first pair tip with `char`, or `null`. The detail sheet passes a kana's most common mix-ups first, then its lookalikes.

**Lines 36–42**
```ts
export function tipFor(shown: Kana, guessed: Kana): string {
  return (
    pairTip(shown.char, guessed.char) ??
    kanaTip(shown.char) ??
    `${shown.char} is "${shown.romaji[0]}". ${guessed.char} is "${guessed.romaji[0]}".`
  );
}
```
The tip on the wrong-answer sheet. The `??` chain tries each in turn and uses the first that isn't `null`:
1. A written tip for the two kana you mixed up.
2. Otherwise, the memory tip for the kana you were shown.
3. Otherwise, a plain line like `う is "u". あ is "a".`. (Every kana has a tip, so this last one is only a safety net.)

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
- The middle value of a list of numbers. An empty list gives `null`.
- Line 25 sorts a copy from smallest to largest. `(a, b) => a - b` tells `.sort` to compare as numbers.
- `%` gives the remainder after dividing. `length % 2 === 1` means the length is odd. Odd: take the middle item. Even: average the two middle items.
- Example: `[3000, 900, 1200]` sorts to `[900, 1200, 3000]`, and the median is 1200.
- The median is used instead of the average so one slow answer doesn't drag the number up.

**Lines 31–33**: `beltIndex`, a kana's belt as a number (white 0 to black 3).

**Lines 36–51**: `summarizeLesson` takes progress at the start and end of the lesson, and every answer given.

```ts
  const correct = answers.filter((a) => a.correct);
  const xp = correct.reduce((sum, a) => sum + XP_PER_CORRECT + (a.ms < FAST_MS ? XP_FAST_BONUS : 0), 0);
```
XP adds 10 for each correct answer, plus 5 for each that took under 4 seconds. Time spent never earns XP.

```ts
  const answeredChars = [...new Set(answers.map((a) => a.char))];
  const promotions = answeredChars
    .filter((char) => beltIndex(after, char) > beltIndex(before, char))
    .map((char) => ({ char, belt: tierOf((after.kana[char] ?? NEW_KANA).box) }));
```
- `answeredChars`: each kana answered, once.
- `promotions`: the kana whose belt is higher at the end than at the start, with the new belt. Kana that dropped a belt are left out.

```ts
    accuracy: answers.length === 0 ? 0 : correct.length / answers.length,
    strikeSpeedMs: median(correct.map((a) => a.ms)),
```
Accuracy is correct answers divided by all answers. Strike speed is the median time of the correct answers only.

---

## saved.ts: saving progress as text, and reading it back safely

**Lines 8–9**
```ts
const SAVE_VERSION = 3;
const READABLE_VERSIONS: readonly unknown[] = [1, 2, 3];
```
Each save is marked with a version number. Version 1 had no stats, version 2 had no finished lessons. This code writes version 3 and can still read all three.

**Line 11**: `EMPTY`, the same as `EMPTY_PROGRESS`.

**Lines 14–16**
```ts
export function serializeProgress(progress: Progress): string {
  return JSON.stringify({ version: SAVE_VERSION, progress });
}
```
Turns progress into text. `JSON.stringify` writes an object as text, like `{"version":3,"progress":{...}}`. The same text is saved on the phone and sent to the cloud.

**Lines 20–47**: `parseProgress` reads that text back. Anything missing or damaged is dropped, so a bad save can never crash the app.

```ts
  if (text === null) return EMPTY;
```
`null` means nothing was saved yet (first launch), so start empty.

```ts
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return EMPTY;
  }
```
- `JSON.parse` turns text back into an object. If the text is broken, it throws an error.
- `try { ... } catch { ... }` means: run the first block; if it throws an error, run the second block instead of crashing.
- `unknown` is TypeScript's type for "could be anything". Nothing can be read from it until it has been checked.

```ts
  if (!isObject(data) || !READABLE_VERSIONS.includes(data.version) || !isObject(data.progress)) return EMPTY;
```
If the data isn't an object, has a version this code can't read, or has no `progress` object, start empty.

```ts
  const { kana, confusions, stats, completed, settings } = data.progress;
  const progress = {
    kana: isObject(kana) ? validEntries(kana, isKanaProgress) : {},
    confusions: Array.isArray(confusions) ? confusions.filter(isConfusion) : [],
    stats: isObject(stats) ? validEntries(stats, isKanaStats) : {},
    completed: Array.isArray(completed) ? completed.filter(isCompletion) : [],
  };
```
- Takes the parts out of the saved progress. `const { a, b } = obj` is short for `const a = obj.a; const b = obj.b;`.
- For each part: if it's the right kind of thing, keep only the valid entries inside it. Otherwise use an empty one.
- A version 1 save has no `stats`, so `stats` is `undefined`, `isObject` is `false`, and stats become `{}`. That is how old saves are upgraded.

```ts
  const hasProgress = Object.keys(progress.kana).length > 0 || progress.completed.length > 0 || Object.keys(progress.stats).length > 0;
  const onboarded = isObject(settings) && typeof settings.onboarded === 'boolean' ? settings.onboarded : hasProgress;
  const dailyGoal = isObject(settings) && isDailyGoal(settings.dailyGoal) ? settings.dailyGoal : DEFAULT_DAILY_GOAL;
  const script = isObject(settings) && settings.script === 'katakana' ? 'katakana' : 'hiragana';
  const sound = !(isObject(settings) && settings.sound === false);
  return { ...progress, settings: { onboarded, dailyGoal, script, sound } };
```
- Settings are checked one field at a time. `Object.keys(obj)` is the list of an object's field names.
- Saves from before the welcome screen existed have no settings. Anyone with saved progress has clearly used the app, so they count as onboarded and never see the welcome.
- A daily goal that isn't one of the four choices becomes the default. A script that isn't `'katakana'` becomes `'hiragana'`.
- Sound is on unless it was saved as `false`, so older saves (which have no `sound`) start with it on.

**Lines 50–56**
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
- `isValid` is a function passed in, like `isKanaProgress`.

**Lines 59–61**: `isObject`, `true` for a real object (not `null`, not a list). `typeof value === 'object'` asks what kind of value it is.

**Lines 63–72**: `isKanaProgress`, `true` if the value has a whole-number `box` from 0 to 7 and a number `dueAt`. `Number.isInteger` checks for a whole number.

**Lines 74–76**: `isCount`, `true` for a whole number of 0 or more.

**Lines 78–86**: `isKanaStats`, `true` if `seen` and `correct` are counts and `recentMs` is a list of numbers.

**Lines 88–90**: `isConfusion`, `true` if both `shown` and `guessed` are strings.

**Lines 92–100**: `isCompletion`, `true` if `lesson` is a string, `at` is a number, and `score` and `opponent` are each either missing or a number.

---

## merge.ts: combining two copies of progress

When you're signed in, your progress lives in two places: on this device and in the cloud. If you practise on your phone and on the web, each copy has things the other doesn't. `mergeProgress` combines them so nothing is lost. The cloud sync calls it every time it syncs.

**Lines 7–15**
```ts
export function mergeProgress(mine: Progress, theirs: Progress): Progress {
  return {
    kana: mergeRecords(mine.kana, theirs.kana, laterKana),
    confusions: mergeConfusions(mine.confusions, theirs.confusions),
    stats: mergeRecords(mine.stats, theirs.stats, moreStats),
    completed: mergeCompleted(mine.completed, theirs.completed),
    settings: { ...mine.settings, onboarded: mine.settings.onboarded || theirs.settings.onboarded },
  };
}
```
- `mine` is this device's copy, `theirs` is the other one.
- Each part is merged by its own rule, below.
- Settings are choices, not training, so there's no "right" way to combine them. They come from `mine`, the device you're holding. The one exception: if either copy has been through the welcome, the result has too.
- Everything except settings comes out the same whichever copy is `mine`. A test checks that.

**Lines 19–28**
```ts
function mergeRecords<T>(a: Readonly<Record<string, T>>, b: Readonly<Record<string, T>>, pick: (x: T, y: T) => T) {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const merged: Record<string, T> = {};
  for (const key of keys) {
    const x = a[key];
    const y = b[key];
    merged[key] = x !== undefined && y !== undefined ? pick(x, y) : (x ?? y)!;
  }
  return merged;
}
```
- Merges two objects that are keyed by character, like `kana` and `stats`. `<T>` is the type of the values, so it works for both.
- Line 20: every key from either object, once, sorted. Sorting means the result's order doesn't depend on which copy came first.
- If only one copy has a kana, use that one (`x ?? y`). If both do, `pick` chooses.

**Lines 32–35**
```ts
function laterKana(x: KanaProgress, y: KanaProgress): KanaProgress {
  if (x.dueAt !== y.dueAt) return x.dueAt > y.dueAt ? x : y;
  return x.box >= y.box ? x : y;
}
```
For a kana's box: keep the copy with the later due time. Every answer sets a new due time, so the later one is usually the most recent answer. If the times are equal, keep the higher box.

**Lines 39–43**: `moreStats` keeps the stats that have seen more answers. Ties go to more correct answers, and if those are equal too, to whichever writes out as the "larger" text. That last rule is arbitrary, but it means the choice never depends on order.

**Lines 48–61**: `mergeConfusions`.
- The mistake log has no dates, and both copies share whatever was synced before. So an entry in both copies might be the same mistake, or two separate ones. There's no way to tell.
- `counts` turns a log into a `Map` from each pair (like `"あ\tお"`; `\t` is a tab character, used to join the two kana) to how many times it appears.
- For each pair, the result has the **larger** of the two counts. That never counts a shared mistake twice. The cost: if both devices made the same mistake since they last synced, one of them is lost.
- `key.split('\t')` splits the pair back into its two kana. `Array.from({ length: times }, ...)` makes a list of `times` copies of the mistake.

**Lines 65–72**
```ts
function mergeCompleted(a: readonly Completion[], b: readonly Completion[]): Completion[] {
  const byKey = new Map<string, Completion>();
  for (const c of [...a, ...b]) byKey.set(`${c.at}\t${c.lesson}\t${c.score ?? ''}`, c);
  return [...byKey.entries()]
    .sort(([kx, x], [ky, y]) => x.at - y.at || (kx < ky ? -1 : kx > ky ? 1 : 0))
    .map(([, c]) => c);
}
```
- Every finished lesson from both copies, once each. Two records with the same time, name and score are the same lesson, so the `Map` keeps just one.
- Sorted oldest first. If two finished at the same moment, they're ordered by their key text so the order is always the same. `a || b` uses `b` only when `a` is 0 (equal times).
- `([, c]) => c` takes the second item of each `[key, record]` pair.

---

## grid.ts: the data behind the belt grid

**Lines 8–26**: the shapes:
- `GridCell`: one kana, its belt, and whether it's locked.
- `GridRow`: a row name, the belt it has been **awarded** by exam, the belt its kana **qualify** it for, and its cells.
- `MasteryGrid`: all the rows, the total number of kana, how many are past white belt, and how many are at each belt. `Record<Belt, number>` means an object with one number for each belt.

**Lines 29–52**: `masteryGrid`.

```ts
  const unlocked = new Set(unlockedKana(progress, script));
```
Puts the unlocked kana in a `Set`, so checking "is this one unlocked?" is quick.

```ts
  const rows = ROWS.map((row) => ({
    row,
    belt: awardedBelt(progress, script, row),
    qualified: rowBelt(progress, script, row),
    cells: KANA.filter((k) => k.script === script && k.row === row).map((kana) => ({
      kana,
      belt: tierOf((progress.kana[kana.char] ?? NEW_KANA).box),
      locked: !unlocked.has(kana),
    })),
  }));
```
For each row: its two belts, and its kana turned into cells with their own belts and whether they're locked.

```ts
  const cells = rows.flatMap((r) => r.cells);
  const counts = Object.fromEntries(BELTS.map((belt) => [belt, cells.filter((c) => c.belt === belt).length]));
```
- `cells`: every cell from every row in one list.
- `counts`: for each belt, how many cells have it. `Object.fromEntries` turns a list of `[name, value]` pairs into an object: `{ white: 42, green: 2, ... }`.

```ts
    counts: counts as Record<Belt, number>,
```
`as Record<Belt, number>` tells TypeScript what `counts` is, because it can't work that out from `Object.fromEntries`. It's safe because it was built from every belt.

---

## profile.ts: the numbers on the Profile tab

**Lines 12–14**: `kanaLearned`, how many kana (both scripts) are past white belt.

**Lines 17–21**
```ts
export function overallAccuracy(progress: Progress): number | null {
  const all = Object.values(progress.stats);
  const seen = all.reduce((sum, s) => sum + s.seen, 0);
  return seen === 0 ? null : all.reduce((sum, s) => sum + s.correct, 0) / seen;
}
```
Every answer ever given, across all kana: correct divided by seen. `Object.values(obj)` is the list of an object's values. `null` before any answers, so the screen can show a dash instead of 0%.

**Lines 24–26**: `overallStrikeSpeed`, the median of every kana's recent correct times, all put into one list with `.flatMap`.

**Lines 29–32**: `rowBeltsEarned`, how many of the 20 rows have been awarded a belt above white. It feeds the "Graded" badge.

**Lines 35–38**: `trainingSince`, the time of the earliest finished lesson, or `null`.

**Lines 41–43**: `lessonsSince`, how many lessons, games and exams finished at or after a time. The Ranks tab uses it for "this week".

**Lines 45–55**
```ts
export function badgeLevel(value: number, goals: readonly number[]): BadgeProgress {
  const level = goals.filter((goal) => value >= goal).length;
  return { level, goal: goals[level] ?? null, value };
}
```
- Where a number stands against a badge's goals. For a 12-day streak against `[7, 30, 100]`: one goal reached, so level 1, and the next goal is `goals[1]`, 30.
- Once every goal is reached, `goals[level]` is past the end of the list, so it's `undefined`, and `?? null` makes it `null`.

---

## streak.ts: the streak, rest days, and the week strip

Days here are text like `"2026-09-25"`. Turning a timestamp into a day needs the phone's timezone, so the hook does that. This file only works with the day text.

**Line 5**: each day in the week strip is `'trained'`, `'rest'` (covered by a rest day), `'missed'`, `'today'` (not trained yet, but not over), or `'none'` (before you started).

**Lines 7–20**: `StreakDay` is one day in the strip. `Streak` is everything the streak screen shows: the current streak, whether today is trained, rest days available, the most rest days you can hold, the last streak that broke, and the last seven days.

**Lines 24–26**: you start with 1 rest day, earn 1 more every 7 days in a row, and can hold at most 2.

**Line 28**: `'SMTWTFS'`, the first letter of each weekday, Sunday first.

**Lines 30–34**
```ts
function toDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1));
}
```
- Turns `"2026-09-25"` into a `Date` (JavaScript's built-in date value).
- `.split('-')` gives `['2026', '09', '25']`, and `.map(Number)` turns each into a number.
- `Date.UTC` builds the date in UTC, a timezone that never changes, so adding days works the same on every phone. Months start at 0 in JavaScript, hence `- 1`.

**Lines 37–41**
```ts
export function addDays(day: string, days: number): string {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
```
The day `days` after `day` (negative for before). `setUTCDate` handles month ends: 31 plus 1 becomes the 1st of the next month. `.toISOString()` writes the date as `"2026-09-26T00:00:00.000Z"`, and `.slice(0, 10)` keeps the first 10 characters.

**Lines 44–90**: `streakOf` works out the whole streak by walking every day from your first lesson to today.

```ts
  const trained = new Set(trainedDays);
  const statuses = new Map<string, DayStatus>();
  let current = 0;
  let restDays = STARTING_REST_DAYS;
  let previous: number | null = null;
```
The days you trained (each once, however many lessons), a `Map` to note what happened on each day, and the running counts.

```ts
  const first = [...trained].sort()[0];
  if (first !== undefined) {
    for (let day = first; day <= today; day = addDays(day, 1)) {
```
Day text sorts in date order, so the smallest is the first day you trained. If there is one, walk forward one day at a time until today.

```ts
      if (trained.has(day)) {
        current += 1;
        if (current % REST_DAY_EVERY === 0) restDays = Math.min(restDays + 1, MAX_REST_DAYS);
        statuses.set(day, 'trained');
```
A trained day adds 1 to the streak. Every 7th day in a row earns a rest day, up to 2.

```ts
      } else if (day === today) {
        statuses.set(day, 'today');
```
Today isn't over yet, so not having trained today doesn't break anything.

```ts
      } else if (current > 0 && restDays > 0) {
        restDays -= 1;
        statuses.set(day, 'rest');
```
A missed day during a streak uses a rest day if there is one. The streak survives, but the day doesn't add to it.

```ts
      } else {
        if (current > 0) previous = current;
        current = 0;
        statuses.set(day, 'missed');
      }
```
Otherwise the day is missed. If a streak was running, it's remembered in `previous`, and the streak goes back to 0.

```ts
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    return {
      day,
      letter: WEEKDAY_LETTERS[toDate(day).getUTCDay()] ?? '',
      status: statuses.get(day) ?? (day === today ? 'today' : 'none'),
    };
  });
```
- The last seven days, oldest first: `i - 6` goes from −6 (six days ago) to 0 (today).
- `Array.from({ length: 7 }, (_, i) => ...)` makes a list of 7 items, running the function with `i` from 0 to 6. `_` is a name for a parameter that isn't used.
- `getUTCDay()` gives the weekday as a number (0 is Sunday), used to pick the letter.
- Days before your first lesson have no status noted, so they're `'none'`.

---

## placement.ts: the placement test

For learners who already know some hiragana. It goes row by row, asking each kana once, and stops at the first row they mostly miss.

**Line 12**: `KNOWN_SHARE = 0.8`. A row counts as known with 80% right, the same bar as unlocking.

**Line 14**: `KNOWN_BOX = 3`, the lowest green-belt box.

**Lines 16–21**: `placementQuestions`, a row's hiragana, shuffled.

**Lines 23–25**: `rowPassed`, `true` if at least 80% were right. `total > 0 &&` stops a division by zero.

**Lines 28–32**
```ts
export function placeKnown(progress: Progress, char: string, now: number): Progress {
  const current = progress.kana[char] ?? NEW_KANA;
  if (current.box >= KNOWN_BOX) return progress;
  return { ...progress, kana: { ...progress.kana, [char]: { box: KNOWN_BOX, dueAt: now + intervalFor(KNOWN_BOX) } } };
}
```
Starts a kana you knew at green belt (box 3), due in 20 minutes. A kana that's already higher is left alone, so the test can never lower you.

**Lines 35–37**
```ts
export function placeRow(progress: Progress, row: RowId, now: number): Progress {
  return plaquesFor('hiragana', row).reduce((p, plaque) => completeLesson(p, plaque.id, now), progress);
}
```
Marks every plaque in a known row as done, so the Learn screen starts after it. `.reduce` starts from `progress` and applies `completeLesson` once per plaque, passing each result on to the next.

---

## rain.ts: the Kana Rain game

Kana fall from the top of the play area, and you type their romaji before they land. Positions are fractions, not pixels: `y` goes from 0 (top) to 1 (ground), and the width is split into 5 lanes. The screen turns those into pixels.

**Lines 8–14**: `Drop`, one falling kana: an id, the kana, its lane (0 to 4, left to right), its height `y`, and its `age` (milliseconds since it appeared, used as the answer time when it's cleared).

**Lines 16–24**: `RainState`, the whole game: the falling kana, the next id to hand out, milliseconds since the last kana appeared, the score, lives, kana cleared (which sets the wave), and whether the game is over.

**Lines 26–29**: in wave 1, a kana takes 9 seconds to fall and a new one appears every 1.6 seconds. 5 lanes, 3 lives.

**Lines 33–36**: every 10 kana cleared starts a new wave. Each wave's times are 0.9 of the last (10% faster), but a fall never takes less than 3.5 seconds and kana never appear more often than every 0.7 seconds.

**Lines 38–40**: `waveOf`, the wave number: 1 for 0–9 cleared, 2 for 10–19, and so on.

**Lines 42–48**
```ts
export function rainPace(wave: number): { fallMs: number; spawnMs: number } {
  const factor = WAVE_SPEEDUP ** (wave - 1);
  return {
    fallMs: Math.max(RAIN_FALL_MS * factor, FASTEST_FALL_MS),
    spawnMs: Math.max(RAIN_SPAWN_MS * factor, FASTEST_SPAWN_MS),
  };
}
```
`**` means "to the power of". Wave 3's factor is 0.9 × 0.9 = 0.81. `Math.max` stops the times dropping below the limits.

**Lines 51–56**
```ts
export function pointsFor(y: number): number {
  return BASE_POINTS + Math.round(HEIGHT_POINTS * (1 - Math.min(Math.max(y, 0), 1)));
}
```
10 points for any catch, plus up to 30 more the higher the kana still was: 40 at the very top, 10 at the ground. `Math.round` rounds to the nearest whole number.

**Line 60**: `LANE_CLEAR_Y = 0.2`. A new kana won't start in a lane where another is still in the top 20%, so they never overlap.

**Lines 62–65**: `startRain`, a new game. `sinceSpawn` starts at the full spawn time, so the first kana appears straight away.

**Lines 71–107**: `stepRain` moves the game forward by `ms` milliseconds. The screen calls it about 60 times a second. `nextKana` is a function the screen passes in to choose each new kana (it uses `pickNext`); it can return `null` for "none right now". It returns the new state and the kana that landed during this step.

```ts
  if (state.over) return { state, landed: [] };
```
Once the game is over, nothing changes.

```ts
  const { fallMs, spawnMs } = rainPace(waveOf(state.cleared));
  const moved = state.drops.map((drop) => ({ ...drop, y: drop.y + ms / fallMs, age: drop.age + ms }));
  const landed = moved.filter((drop) => drop.y >= 1);
  let drops = moved.filter((drop) => drop.y < 1);
```
- Every kana moves down. In `ms` milliseconds it falls `ms / fallMs` of the height. With a 9-second fall, 90 milliseconds is 0.01, one hundredth of the way.
- Kana at or past the ground have landed and are removed.

```ts
  const lives = Math.max(state.lives - landed.length, 0);
  if (lives === 0) {
    return { state: { ...state, drops, lives, over: true }, landed };
  }
```
Each landed kana costs a life. At 0 the game is over.

```ts
  let { nextId, sinceSpawn } = state;
  sinceSpawn += ms;
  while (sinceSpawn >= spawnMs) {
    sinceSpawn -= spawnMs;
```
Time since the last new kana goes up. Each time it passes the spawn time, a new kana is due. It's a `while`, not an `if`, so a long step (the phone was slow for a moment) can add more than one.

```ts
    const busy = new Set(drops.filter((d) => d.y < LANE_CLEAR_Y).map((d) => d.lane));
    const free = Array.from({ length: RAIN_LANES }, (_, lane) => lane).filter((lane) => !busy.has(lane));
    if (free.length === 0) continue;

    const kana = nextKana();
    if (!kana) continue;
```
- `busy`: lanes with a kana still near the top. `free`: the lanes `[0, 1, 2, 3, 4]` minus the busy ones.
- If no lane is free, or there's no kana to give, skip this one (`continue` goes back to the top of the loop).

```ts
    const lane = free[Math.floor(rng() * free.length)]!;
    drops = [...drops, { id: nextId, kana, lane, y: 0, age: 0 }];
    nextId += 1;
```
Pick a random free lane and add the new kana at the top. Each kana gets its own id.

**Line 110**: `SUBMIT_KEYS`, Enter and Space. They mean "take what I've typed as my answer".

**Lines 112–114**: `spellings`, a kana's list of romaji.

**Lines 117–119**
```ts
function lowest(drops: readonly Drop[]): Drop | null {
  return drops.reduce<Drop | null>((low, drop) => (low === null || drop.y > low.y ? drop : low), null);
}
```
The lowest kana (closest to landing), or `null` for none. It starts with `null` and keeps whichever has the bigger `y`. `reduce<Drop | null>` tells TypeScript the running result can be a kana or `null`.

**Lines 122–126**
```ts
export function targetOf(drops: readonly Drop[], typed: string): Drop | null {
  const text = typed.toLowerCase();
  if (text === '') return null;
  return lowest(drops.filter((d) => spellings(d).some((r) => r.startsWith(text))));
}
```
The kana you're locked on to: the lowest one whose spelling starts with what you've typed. `r.startsWith(text)` is `true` if `r` begins with `text`: `'shi'` starts with `'sh'`.

**Lines 128–133**: `TypeResult`, what one key press did: the new state, what the typing bar should show, the kana cleared (if any), and whether the key was ignored.

**Lines 136–143**: `clear` removes a kana, adds its points, and counts it.

**Lines 146–168**: `typeKey` handles one key press. `typed` is what was typed before this key.

```ts
  const before = typed.toLowerCase();
  if (state.over) return { state, typed: before, cleared: null, rejected: true };
```
After the game ends, keys do nothing.

```ts
  if (SUBMIT_KEYS.has(key)) {
    const exact = lowest(state.drops.filter((d) => spellings(d).includes(before)));
    return exact
      ? { state: clear(state, exact), typed: '', cleared: exact, rejected: false }
      : { state, typed: before, cleared: null, rejected: false };
  }
```
Enter or Space: if what you've typed is a complete spelling of a falling kana, clear the lowest such kana and empty the bar. Otherwise nothing happens.

```ts
  const text = before + key.toLowerCase();
  const matching = state.drops.filter((d) => spellings(d).some((r) => r.startsWith(text)));
  if (matching.length === 0) return { state, typed: before, cleared: null, rejected: true };
```
Any other key is added to what's typed. If no falling kana's spelling starts with the new text, the key is ignored (`rejected: true`), and the bar keeps what it had.

```ts
  const exact = lowest(matching.filter((d) => spellings(d).includes(text)));
  const longerPossible = matching.some((d) => spellings(d).some((r) => r.length > text.length && r.startsWith(text)));
  if (exact && !longerPossible) {
    return { state: clear(state, exact), typed: '', cleared: exact, rejected: false };
  }
  return { state, typed: text, cleared: null, rejected: false };
```
- `exact`: the lowest kana whose spelling is exactly what's typed.
- `longerPossible`: whether some falling kana has a **longer** spelling that starts with what's typed.
- If there's an exact match and nothing longer is possible, clear it straight away.
- Otherwise keep typing. The case this is for: you type "n" while ん and な are both falling. "n" is ん exactly, but you might be halfway through "na". So it waits. The next key decides, or Enter takes ん.

---

## The test files

Test files sit next to the code they test (`kana.test.ts`, `boxes.test.ts`, and so on). They all use the same pieces:

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
- **Fixed numbers for time and randomness**: `NOW = 1_000_000` is a made-up time; `() => 0.5` is a made-up random source. Because these never change, each test gives the same result every time. Many tests loop over several fake random sources (`() => 0`, `() => 0.5`, `() => 0.99`) so a rule is checked against more than one outcome.
- `npm test` runs every `.test.ts` file and prints which tests passed and which failed.

What each file checks:
- **pairs.test.ts**: every pair is two different real kana from one script, listed once, with a name and a tip that mentions both; both scripts covered; `pairId` and `pairById`.
- **kana.test.ts**: 46 + 46 kana, no duplicates; spellings accepted, including alternates, capitals and spaces; rows in order and the right size; lookalikes found both ways, and every named pair counts as lookalikes.
- **boxes.test.ts**: each box's belt and waiting time (0 below green); "due" is true at or after the due time.
- **goal.test.ts**: the four goals, the default of 2, changing the goal without changing the input, counting lessons on a day.
- **answers.test.ts**: every rule of `recordAnswer` (up a box, capped at 7, slow, wrong, floor at 0, mistakes logged, new kana, a green kana not due stays put, a white kana moves up even with a future due time, input never changed), the stats it keeps, finished lessons, best scores, `markDue`, onboarding, sound, and `isEmptyProgress`.
- **unlock.test.ts**: only the あ row at first; the next row opens at 4 of 5 green but not 3 of 5; scripts are separate; `greenNeeded`; `metKana` only lists open kana with progress.
- **random.test.ts**: shuffle keeps every item, is repeatable, and doesn't change the original.
- **choices.test.ts**: 4 choices including the answer, lookalikes included, no repeated spellings, kana-chart order.
- **pick.test.ts**: runs `pickNext` 100 times with random numbers 0.00 to 0.99 and counts picks; due and low-box kana win most often; only candidates are picked.
- **details.test.ts**: belt, accuracy, speed and wait for a kana; mix-ups counted both ways; a never-answered kana; `formatWait` wording.
- **question.test.ts**: practice asks unlocked kana in the right script, only ones you've met; drill questions ask the focus kana or a partner; the same kana never comes twice in a row.
- **exam.test.ts**: which exam is due, awarded belts (never above the kana now), exam questions (20, from the row, no repeats in a row), and when an exam passes or fails.
- **path.test.ts**: plaques per row (including 3-kana rows), `rowBelt`, which plaque is current, rows opening, scripts separate, plaque questions (mostly the plaque's kana, review only kana you've met, no repeats), exams on the path.
- **rank.test.ts**: rank thresholds, higher belts counting toward lower ranks, only exam-earned belts count.
- **duel.test.ts**: `weakPairs` (counting both ways, order, ready at 3 and only when unlocked), duel questions (only the two kana, chart order, repeats allowed), scoring (fast, wrong, slow, after the end, input unchanged), win and loss, `completeDuel`, and `scrolls` (locked, ready, first win kept, a loss isn't a win, order).
- **tips.test.ts**: every kana has a tip, and each tip mentions the kana's sound.
- **feedback.test.ts**: belt changes up, down and none; pair tips, the kana's own tip as the fallback, and `pairTipFor`.
- **lesson.test.ts**: lesson length, `median`, and the lesson summary (XP, accuracy, strike speed, promotions).
- **saved.test.ts**: save then load gives the same progress; first launch, broken text and unknown versions start fresh; older saves are upgraded; damaged entries are dropped (including a duel with a broken opponent score); settings are checked, including sound.
- **merge.test.ts**: the later due time wins, mix-ups keep the larger count, stats keep the copy that saw more, finished lessons once each, settings from the first copy, the same result in either order, merging with itself changes nothing, inputs never changed.
- **grid.test.ts**: every row in order, locks for a new learner, belts and counts, scripts separate.
- **profile.test.ts**: kana learned, accuracy, strike speed, rows earned, training since, lessons since, badge levels.
- **streak.test.ts**: month ends, counting days, today not breaking it, rest days covering a missed day, breaking and remembering the old streak, earning rest days, the week strip.
- **placement.test.ts**: questions per row, the 80% bar, placing at green without ever lowering, marking a row's plaques done.
- **rain.test.ts**: falling speed, landing, spawning and free lanes, locking on, partial and complete matches, alternate spellings, ignored keys, the "n" case, points by height, lives and game over, waves and speed-ups, answer timing.
