# Kana Dojo — User Stories

Work happens one story at a time, in order. A story is done when every
box under "Done when" is checked, `npx tsc --noEmit` passes, and the
learner can explain what they built without looking at it.

Do not start a story before the one above it. Do not build anything not
listed in the story currently being worked on.

Format:

> **As a** [person], **I want** [one thing], **so that** [reason].

---

## Epic A — Skeleton

### A1. Five tabs
**As a** learner, **I want** the five main sections reachable from a tab
bar, **so that** I can move between training, games, and my progress.

Done when:
- [ ] `(tabs)` route group exists with `index`, `games`, `kana`, `ranks`,
      `profile`
- [ ] Each renders a placeholder showing its own name
- [ ] Tapping a tab switches screens
- [ ] Root `_layout.tsx` is a Stack wrapping the tabs

### A2. Theme file
**As a** developer, **I want** every color and font in one file, **so
that** the app has a consistent look and the theme can change in one place.

Done when:
- [ ] `src/constants/theme.ts` exports the Sumi palette from PROJECT.md
- [ ] Belt colors are exported as their own map
- [ ] Both fonts are loaded and usable
- [ ] No hex value appears anywhere outside this file, except `app.json`
      (plain JSON can't import; its colors must match `paper` by hand)

### A3. Custom tab bar
**As a** learner, **I want** a tab bar that matches the dojo look, **so
that** the app feels like itself rather than a default template.

Done when:
- [ ] Tab bar has a thin top border, no shadow
- [ ] Active tab shows a vermilion dot under its icon
- [ ] Icons match the mocks
- [ ] Works on iOS, Android, and web

---

## Epic B — The engine

Built from tests. Write the test first, watch it fail, make it pass.
Nothing in this epic imports React.

### B1. Kana data
**As a** developer, **I want** every kana with its romaji and row, **so
that** the rest of the engine has something to work on.

Done when:
- [ ] All 46 basic hiragana and 46 basic katakana present
- [ ] Alternate romaji accepted (shi/si, chi/ti, tsu/tu, fu/hu).
      ji/zi is for じ, which is not in the basic 46; revisit with dakuten.
- [ ] Rows are defined and each kana knows its row (ん is in the wa row)
- [ ] Lookalike sets defined (シ/ツ, ソ/ン, ぬ/め, わ/ね/れ, る/ろ, さ/ち)

### B2. Boxes and belts
**As a** learner, **I want** each kana to have a belt reflecting how well
I know it, **so that** I can see my progress honestly.

Done when:
- [ ] `tierOf(box)` maps 0–7 to white/green/brown/black
- [ ] Box intervals match the table in PROJECT.md
- [ ] A kana knows whether it is currently due

### B3. Recording answers
**As a** learner, **I want** my answers to change what I'm shown later,
**so that** I spend time on what I don't know.

Done when:
- [ ] Correct + due + under 4s → box + 1
- [ ] Correct but not due → box unchanged
- [ ] Correct + due but 4s or slower → box unchanged, rescheduled at its
      current interval
- [ ] Wrong → box − 2, floor 0, due now (even if it was not due)
- [ ] A kana with no progress yet starts at box 0, due now
- [ ] Wrong answers log the confused pair
- [ ] The input state object is never mutated

### B4. Choosing what to ask
**As a** learner, **I want** the app to pick what to drill, **so that** I
don't have to decide.

Done when:
- [ ] `pickNext()` favors overdue and low-box kana (not-due kana can
      still be picked, just rarely)
- [ ] `makeChoices()` puts lookalikes in the distractors (only lookalikes
      that are in the pool, i.e. already unlocked)
- [ ] No distractor shares the right answer's romaji, and no two choices
      share a romaji
- [ ] `unlockedKana()` opens the next row at 80% green (green belt or
      better), separately for hiragana and katakana
- [ ] Randomness is passed in as `rng`, never read inside the engine

---

## Epic C — The lesson loop

### C1. A question on screen
**As a** learner, **I want** to see a kana and pick its sound, **so that**
I can practice.

Done when:
- [ ] Kana renders in the framed card from the mocks
- [ ] Four options, one correct
- [ ] Tapping an option answers straight away (no separate Check button)
- [ ] Options sit at the bottom, within thumb reach; the kana frame grows
      to fill the space above them

### C2. Feedback
**As a** learner, **I want** to know immediately whether I was right,
**so that** the correction sticks.

Done when:
- [ ] Correct → pine sheet, answer, time taken, any belt change
- [ ] Wrong → vermilion sheet, correct answer, what was picked, memory tip
      (hand-written tips for the lookalike pairs; other mix-ups name both
      sounds. The button says Continue, and belt drops aren't announced.)
- [ ] Karasu's expression changes between the two
- [ ] Each answer calls `recordAnswer()`

### C3. A full lesson
**As a** learner, **I want** lessons that start and end, **so that** a
session has a finish line.

Done when:
- [ ] A lesson is a fixed number of questions (10)
- [ ] Progress bar fills as questions are answered
- [ ] X button exits with a confirmation (swipe-back is off on iOS)
- [ ] Completion screen shows XP, accuracy, strike speed, belt changes.
      XP: 10 per correct answer, +5 if under 4s. Strike speed is the median
      time of correct answers only. Only promotions are listed.

### C4. Progress survives restart
**As a** learner, **I want** my progress saved, **so that** closing the
app doesn't erase my work.

Done when:
- [ ] Progress persists to device storage
- [ ] Reloading restores boxes, due dates, and confusion data
- [ ] First launch with no saved data doesn't crash

---

## Epic D — Seeing progress

### D1. Belt grid
**As a** learner, **I want** to see every kana and its belt, **so that** I
know where I stand.

Done when:
- [ ] Grid of rows with a belt stripe under each kana
- [ ] Locked kana show a lock
- [ ] Header shows the count past white belt
- [ ] Script toggle between hiragana and katakana

### D2. Kana details
**As a** learner, **I want** to tap a kana and see its stats, **so that** I
understand why it's weak.

Done when:
- [ ] Sheet shows accuracy, strike speed, next drill time
- [ ] Shows the pairs this kana is confused with, and how often
- [ ] Memory tip shown
- [ ] A button drills this kana specifically

### D3. Learn path
**As a** learner, **I want** a home screen showing what to do next, **so
that** I never wonder where to start.

Done when:
- [ ] Lessons render as plaques on the dojo wall
- [ ] Finished plaques get a vermilion seal
- [ ] Current plaque is visually distinct
- [ ] Locked plaques appear but can't be tapped
- [ ] Header shows the row's belt

### D4. Streak
**As a** learner, **I want** a streak, **so that** I have a reason to come
back tomorrow.

Done when:
- [ ] Counts consecutive days with at least one completed lesson
- [ ] Last seven days shown
- [ ] Rest day protects one missed day
- [ ] Breaking a streak shows encouragement, never guilt

---

## Epic E — Kana Rain

### E1. Falling kana
Kana fall from the top at a steady rate and are removed at the bottom.

### E2. Typing to match
Typed romaji highlights the matching kana; a complete match clears it.

### E3. Scoring and lives
Points for speed, three lives, wave difficulty ramp.

### E4. Feeding the engine
Every hit and miss calls `recordAnswer()` like a lesson answer would.

### E5. Results
Reuses the lesson completion layout. High score persists.

---

## Epic F — Belts as a system

### F1. Row belts
A row's belt is the lowest belt among its kana.

### F2. Belt exam
Timed 20-question test, no hints, 18 to pass, unlimited retries.

### F3. Belt ceremony
Karasu ties on the belt. Plaque added to the dojo.

### F4. Karasu evolves
Mascot form changes with overall rank.

---

## Later

Yokai dungeon and charms, duels and scrolls, memory match, word forge,
calligraphy, taiko drill, daily kata, the dojo room, assignments,
tournaments, shadow match, supply shed, onboarding (welcome, daily goal,
placement test).

Each gets expanded into full stories when its epic comes up. Not before.
