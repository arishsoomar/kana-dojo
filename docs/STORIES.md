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
- [ ] Script toggle between hiragana and katakana (each has its own
      progress and its own unlocks)

### D2. Kana details
**As a** learner, **I want** to tap a kana and see its stats, **so that** I
understand why it's weak.

Done when:
- [ ] Sheet shows accuracy, strike speed, next drill time (progress now
      keeps per-kana stats; save format v2, v1 saves are upgraded)
- [ ] Shows the pairs this kana is confused with, and how often (both
      directions)
- [ ] Memory tip shown. Only the lookalike pair tips exist so far; kana
      without one show no tip. Needs a written tip for every kana.
- [ ] A button drills this kana specifically: a 10-question lesson, about
      half on the kana itself and half on what it's mixed up with

### D3. Learn path
**As a** learner, **I want** a home screen showing what to do next, **so
that** I never wonder where to start.

Done when:
- [ ] Lessons render as plaques on the dojo wall: each row introduces its
      kana two at a time, then a Mixed review of the whole row
- [ ] Finished plaques get a vermilion seal (and can be replayed)
- [ ] Current plaque is visually distinct
- [ ] Locked plaques appear but can't be tapped. Plaques open one at a
      time, and only in unlocked rows
- [ ] Header shows the row's belt (its weakest kana)
- [ ] When every open plaque is done, the screen offers Practice and says
      how many more kana need green to open the next row
- [ ] Hiragana / Katakana toggle; progress now records every finished
      lesson with its time (save format v3)

### D4. Streak
**As a** learner, **I want** a streak, **so that** I have a reason to come
back tomorrow.

Done when:
- [ ] Counts consecutive days with at least one completed lesson (any
      kind; days are the learner's local calendar days; today can't be missed)
- [ ] Last seven days shown
- [ ] Rest day protects one missed day. Start with 1, earn 1 per 7 days in
      a row, hold at most 2; used automatically
- [ ] Breaking a streak shows encouragement, never guilt (missed days are
      grey, not red; Karasu welcomes you back)
- [ ] Opened from the flame counter on the Learn screen

---

## Epic E — Kana Rain

### E1. Falling kana
Kana fall from the top at a steady rate and are removed at the bottom.
(Unlocked hiragana; a new kana every 1.6s, 9s to fall, 5 lanes that never
overlap near the top. Opened from the Games tab, which lists Kana Rain only.)

### E2. Typing to match
Typed romaji highlights the matching kana; a complete match clears it.
(Locks on to the lowest matching kana. Alternate spellings and capitals
work. Keys that can't match anything are ignored. "n" waits while な etc.
could still be meant; Enter or space takes ん.)

### E3. Scoring and lives
Points for speed, three lives, wave difficulty ramp.
(10 points plus up to 30 more the higher a kana is caught. A landing costs a
life; at zero the game stops. A new wave every 10 kana cleared, each 10%
faster, down to 3.5s falls and a kana every 0.7s. No combo multiplier.)

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

## Epic G — Accounts and sync

The app stays fully usable without an account. Progress is always saved on
the device first; the server is a copy that keeps devices in step.

### G1. Sign in
**As a** learner, **I want** to create an account and sign in, **so that**
my progress isn't tied to one device.

Done when:
- [ ] Sign in with email (magic link) and Sign in with Apple
- [ ] Signing in is optional; everything works signed out
- [ ] Sign out returns to local-only progress on that device

### G2. Cloud save
**As a** learner, **I want** my progress saved to my account, **so that**
losing my phone doesn't lose my training.

Done when:
- [ ] Each save goes to the device first, then to the server
- [ ] Works offline; unsent saves go up when the connection returns
- [ ] Server data is checked with `parseProgress` like local data

### G3. Merging devices
**As a** learner, **I want** practice on any device to count, **so that**
switching between phone and web never throws away a session.

Done when:
- [ ] `mergeProgress(a, b)` in `src/core/`, test-first
- [ ] Per kana, the copy with the later `dueAt` wins
- [ ] Confusion logs are combined without duplicates
- [ ] Merging is the same whichever order the two copies arrive in

### G4. First sign-in keeps local progress
**As a** learner, **I want** the progress I made before signing up to
carry over, **so that** creating an account never resets me.

Done when:
- [ ] On first sign-in, device progress is merged into the account
- [ ] Signing in on a second device merges, never overwrites

---

## Later

Yokai dungeon and charms, duels and scrolls, memory match, word forge,
calligraphy, taiko drill, daily kata, the dojo room, assignments,
tournaments, shadow match, supply shed, onboarding (welcome, daily goal,
placement test).

Each gets expanded into full stories when its epic comes up. Not before.
