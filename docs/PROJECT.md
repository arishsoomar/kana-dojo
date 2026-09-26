# Kana Dojo — Project Context

Read this before working on anything. It explains what is being built and
why the pieces are shaped the way they are.

## What this is

A mobile and web app for learning hiragana and katakana. The person using
it can already read romaji and is starting from zero on kana.

The problem with existing kana drills is that they work but are boring,
so people stop after a few days. The bet here is that wrapping a genuine
spaced-repetition engine in games and a visible progression system keeps
people practicing long enough to actually finish.

**Target:** someone can read all 46 basic hiragana and all 46 basic
katakana on sight, in under a second each, after a few weeks of short
daily sessions.

## Theme: Dojo

Learning kana is framed as martial-arts training. This is not decoration
— the metaphor maps onto the real data:

| App concept | What it actually is |
|---|---|
| Belt on a kana | That kana's mastery tier from the SRS engine |
| Belt on a row | The lowest belt among that row's kana |
| Belt exam | A timed test required to be awarded a row belt |
| Dan stripes | Speed and accuracy sustained over months |
| Plaque | A completed lesson, hung on the dojo wall |
| Duel | A drill built from the learner's own confusion data |
| Scroll | A duel trophy that stores the tip for that kana pair |
| Strike speed | Median answer time in milliseconds |
| Mon (coins) | Earned currency. Cannot be bought with money |
| Rest day | Streak freeze |
| Karasu | Crow sensei mascot. Its form reflects overall rank |

**Rule:** nothing in the reward system is awarded for time spent. Every
unlock traces back to something the engine measured — accuracy, speed, or
retention over time.

## Architecture

Three layers. Keeping them separate is the single most important
structural decision in the project.

```
src/core/       Pure TypeScript. No React, no React Native, no I/O.
                Takes state in, returns new state out. Fully unit tested.
                This is the spaced-repetition engine.

src/hooks/      Connects the engine to React. Holds state, handles
                persistence, exposes actions to components.

src/components/ Presentation only. Receives props, renders, calls
src/screens/    callbacks. Contains no learning logic.
```

Why this matters: the engine is the hard part and the part most worth
getting right. Because it is pure functions, it can be tested in
milliseconds without rendering anything, and it works unchanged on iOS,
Android, and web.

**Never import React into `src/core/`.** If a function in core needs to
know about a component, the layering is wrong.

## Design system

Palette name: **Sumi**. Charcoal ink and vermilion on paper.

| Token | Hex | Used for |
|---|---|---|
| `sumi` | `#1F2024` | Text, primary buttons |
| `vermilion` | `#E0492F` | Seals, streaks, bosses, wrong answers |
| `pine` | `#2E9E5B` | Correct answers |
| `gold` | `#C9A227` | Mon coins, highest rank |
| `wood` | `#D9B383` | Plaques, shelves |
| `indigo` | `#3B82C4` | Audio buttons and hints |
| `paper` | `#EEF0F3` | Screen backgrounds |
| `night` | `#17181C` | Dungeon and rhythm screens |
| `line` | `#DDE1E8` | Borders |
| `ink2` | `#5E6372` | Secondary text |

Belt colors: white `#FFFFFF`, green `#2E9E5B`, brown `#7A4A26`,
black `#1B1D26`.

Rules:
- Flat surfaces. No drop shadows, no 3D button edges, no large radii.
  Corner radius is 6–10px.
- Selection is shown with a **thicker border**, never a colored fill.
- Wrong answers use vermilion, the same red as the seals, so red means
  "pay attention" rather than "you failed".
- Typography: Archivo for Latin text, Zen Kaku Gothic New for kana.
- Plaques read top to bottom, like real Japanese signage.
- Every color is referenced from the theme file by name. Never hardcode a
  hex value in a component.

See `docs/mocks/kana-dojo-mocks.html` for all 31 screens rendered. Open it
in a browser, or read the source for exact spacing and structure.

## Navigation

Tab screens sit flat. Anything that covers the tab bar pushes onto the
root stack. (This also avoids a known SDK 57 issue where nested stacks
inside tabs can hang iOS release builds.)

```
src/app/
  _layout.tsx        root Stack
  (tabs)/
    _layout.tsx      Tabs + custom tab bar
    index.tsx        Learn path — plaques on the dojo wall
    games.tsx        Training hall — all game modes
    kana.tsx         Belt grid — every kana and its belt
    ranks.tsx        Tournament — weekly league
    profile.tsx      Profile — rank, stats, badges
  lesson.tsx         pushes over the tabs
  exam.tsx           belt exam, pushes over the tabs
  games/...          individual game modes
```

## The engine

Every kana has a box number 0–9: three steps to each belt. A kana climbs
by being answered right, quickly, and each belt asks for more speed, since
the goal is reading at a glance. There is no waiting: a kana can climb as
fast as the learner can read it.

```
Box:              0  1  2   3  4  5   6  7  8   9
Belt:             white     green     brown     black
Climb if tapped   under 4s  under 2.5s under 1.5s  (top)
Climb if typed    under 6s  under 4s   under 3s
```

Rules:
- Right and under the limit for its belt → box + 1 if tapped, box + 2 if
  typed (recalling the sound is harder than recognising it)
- Right but at or over the limit → box unchanged
- Wrong → box − 2 (floor 0), and the confusion is logged as a pair (what
  it was, what the learner guessed)
- Each kana also keeps when it was last answered, which decides which copy
  wins when two devices' progress is merged

Core functions:

| Function | Purpose |
|---|---|
| `recordAnswer()` | Apply an answer, return new progress state |
| `tierOf()` | Box number → belt |
| `unlockedKana()` | Which rows are open. Next row unlocks at 80% green |
| `pickNext()` | Weighted choice of what to ask next |
| `makeChoices()` | Build multiple-choice options, lookalikes first |
| `weakPairs()` | Most-confused pairs. Feeds duels and assignments |
| `masteryGrid()` | Data for the belt grid screen |
| `seededRng()` | Deterministic randomness for the daily puzzle |

All of these return new objects. Nothing mutates its input.

Note: a working reference implementation exists but is deliberately not in
the repo. The learner is rebuilding it from the tests as a spec.

## Non-negotiables

- No lives or hearts in lessons. A wrong answer gets a memory tip.
- No purchasable currency. No pay-to-win. Everything buyable is cosmetic.
- Seasonal items return every year, so missing a week loses nothing
  permanently.
- A broken streak shows encouragement, never guilt.
- Games are not separate from study. Every answer in every mode goes
  through `recordAnswer()`.
