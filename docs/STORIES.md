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
- [ ] Tapping an option answers straight away (no separate Check button).
      A correct answer moves straight on to the next question.
- [ ] The same kana is never asked twice in a row (lessons, plaques,
      practice, drills and exams), unless it's the only one available
- [ ] Options sit at the bottom, within thumb reach; the kana frame grows
      to fill the space above them

### C2. Feedback
**As a** learner, **I want** to know immediately whether I was right,
**so that** the correction sticks.

Done when:
- [ ] Correct → straight on to the next question (the pine sheet was
      dropped so correct answers keep the pace up)
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
- [ ] Memory tip shown: the pair tip for its most common mix-up or a
      lookalike, else its own tip. Every kana has one (first drafts in
      src/core/tips.ts, to be rewritten in the app's voice).
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
(A cleared kana is correct, timed by how long it was falling. A kana that
lands while the player is locked on to it is wrong, with no mix-up logged. A
kana that lands before the player started on it only becomes due again: box
and stats unchanged, since it most likely landed because they were busy.
The engine's pickNext chooses which kana fall.)

### E5. Results
Reuses the lesson completion layout. High score persists.
(Score, accuracy, strike speed, belts earned, "New best!" or the best to
beat, Play again. A finished game is saved like a lesson ("game:rain") with
its score, so it also counts toward the streak. Best score shows on the
training hall card.)

---

## Epic F — Belts as a system

### F1. Row belts
A row's belt is the lowest belt among its kana.
(Shown next to each row label on the belt grid, and in the Learn header.
This is the belt a row has qualified for; F2's exam makes it official.)

### F2. Belt exam
Timed 20-question test, no hints, 18 to pass, unlimited retries.
(Offered when a row qualifies for a belt it hasn't passed; the exam is for
that belt. 60 seconds, only the row's kana, wrong options from the same row.
Ends early at the third miss. Only the picked answer shows right or wrong.
Answers go through recordAnswer. Results are saved as finished-lesson
records with the number correct; a row shows the highest belt passed,
never above what its kana qualify for. Offered from a card on the row's
shelf and by Karasu on the Learn screen.)

### F3. Belt ceremony
Karasu ties on the belt. Plaque added to the dojo.
(Shown instead of the results screen when an exam is passed: the new belt
drops onto Karasu, he switches to it, and the words fade in. The plaque is
a gold belt plaque on that row's shelf on the Learn path, until the dojo
room exists. No "+50 mon": coins aren't in any story yet.)

### F4. Karasu evolves
Mascot form changes with overall rank.
(Overall rank comes from row belts earned by exam, across all 20 rows:
green at 3 rows, brown at 10, black when all 20 are black. Forms: white-belt
fledgling, green student with red headband, brown with gold headband, black
master with spread wings, staff and hat. Karasu shows the rank everywhere;
the belt ceremony says when an exam raised it.)

---

## Epic G — Accounts and sync

The app stays fully usable without an account. Progress is always saved on
the device first; the server is a copy that keeps devices in step.

### G1. Sign in
**As a** learner, **I want** to create an account and sign in, **so that**
my progress isn't tied to one device.

Done when:
- [ ] Sign in with a code sent by email (Supabase; 6 to 10 digits). Sign in with
      Apple comes later, before App Store release.
- [ ] Signing in is optional; everything works signed out, and without
      Supabase keys the account option doesn't appear at all
- [ ] Sign out returns to local-only progress on that device

### G2. Cloud save
**As a** learner, **I want** my progress saved to my account, **so that**
losing my phone doesn't lose my training.

Done when:
- [ ] Each save goes to the device first, then to the server (uploaded 2s
      after changes settle, to the learner's row in the `progress` table)
- [ ] Works offline; unsent saves go up when the connection returns (an
      "upload owed" flag on the device; retried on foreground, on the next
      change, and every 30s)
- [ ] Server data is checked with `parseProgress` like local data
- Replaced in G4: every sync now merges instead.

### G3. Merging devices
**As a** learner, **I want** practice on any device to count, **so that**
switching between phone and web never throws away a session.

Done when:
- [ ] `mergeProgress(a, b)` in `src/core/`, test-first
- [ ] Per kana, the copy with the later `dueAt` wins
- [ ] Confusion logs are combined without duplicates
- [ ] Merging is the same whichever order the two copies arrive in
- Mix-up logs have no dates, so shared entries can't be told apart: each
  pair keeps the larger of its two counts (never double-counts; can miss a
  mix-up both devices logged separately). Stats: per kana, the copy that has
  seen more answers. Finished lessons: once each, oldest first.
- Settings are choices, not training: they come from the device in hand
  (the first argument); onboarded if either copy is. Order-independence
  covers the training record.

### G4. First sign-in keeps local progress
**As a** learner, **I want** the progress I made before signing up to
carry over, **so that** creating an account never resets me.

Done when:
- [ ] On first sign-in, device progress is merged into the account
- [ ] Signing in on a second device merges, never overwrites
- Every sync (sign-in, 2s after changes, returning to the app, retries)
  downloads, merges into the device's copy, and uploads if the cloud is
  missing anything. A download that fails uploads nothing, so a network
  error can't overwrite the account.

---

## Epic H — Onboarding

### H1. Welcome
**As a** new learner, **I want** a welcome from Karasu the first time I open
the app, **so that** I know what I'm here to do.

Done when:
- [ ] First launch shows Karasu: "I'm Karasu", and the goal stated plainly
- [ ] "Enter the dojo" leads into the app, and the welcome never shows again
- [ ] Existing learners with saved lessons never see it
- [ ] No "I have an account" button until accounts exist (Epic G)

### H2. Daily goal
**As a** new learner, **I want** to choose how much to train each day, **so
that** the daily target feels like mine.

Done when:
- [ ] Choose 5, 10, 15 or 20 minutes (1, 2, 3 or 4 lessons per day; the
      app counts lessons, never time). Onboarding finishes here.
- [ ] The Learn screen shows today's progress toward the goal (a small ring
      next to the streak; any lesson, game or exam counts)
- [ ] The goal can be changed later, from the Profile tab

### H3. Starting point
**As a** learner who already knows some kana, **I want** to skip what I
know, **so that** I don't start from the あ row.

Done when:
- [ ] Brand new: start at the あ row
- [ ] Know some hiragana: a short grading test; kana answered quickly and
      correctly start at green belt, so their rows unlock. It goes row by
      row, stops at the first row under 80%, and marks known rows' plaques
      done. It never awards row belts (exams still do). X stops early.
- [ ] Know all hiragana: start on katakana (the Learn screen remembers its
      script); hiragana still has to be earned
- [ ] Every grading answer goes through `recordAnswer()`

---

## Epic I — Duels and scrolls

A duel is a short, fast drill on two lookalike kana that the learner keeps
mixing up, built from their own mistake log. Winning one earns a scroll
that keeps the trick for telling the pair apart. Only pairs with a written
tip can be duelled, so every duel and scroll has something to teach.

### I1. Weak pairs
**As a** learner, **I want** the app to know which lookalike pairs I mix
up most, **so that** my duels are about my real mistakes.

Done when:
- [ ] Every pair tip in `feedback.ts` moves into one list of named pairs
      (e.g. シ ツ "The shadow twins"), each with its name and tip
- [ ] More named pairs are added for common hiragana and katakana
      mix-ups, so the collection covers both scripts
- [ ] `weakPairs(progress)` in `src/core/`, test-first: the named pairs,
      each with how many times it's been mixed up (both directions
      counted), most mixed-up first
- [ ] A pair is "ready" to duel once it's been mixed up 3 or more times
      and both its kana are unlocked
- 19 pairs in `pairs.ts` (11 hiragana, 8 katakana). The lookalike list in
  `kana.ts` is now built from them, so every named pair is also used for
  tricky wrong-answer tiles and drill partners. `weakPairs` lives in
  `duel.ts` (not `pairs.ts`) so `kana.ts` and `unlock.ts` don't import
  each other in a loop.

### I2. Duel rules
**As a** learner, **I want** a duel to have clear rules, **so that**
winning means I can really tell the pair apart.

Done when:
- [ ] Pure functions in `src/core/`, test-first
- [ ] Each point shows one of the two kana, with the pair's two
      spellings as the only answers
- [ ] A right answer under 4 seconds scores me a point; a wrong answer
      scores the opponent a point; a slow right answer scores nothing
- [ ] First to 10 wins. The opponent reaching 5 ends the duel as a loss
- [ ] The kana shown is random each point, and may repeat. (The
      no-repeats rule from lessons doesn't apply: with only two kana,
      it would make every answer predictable.)

### I3. Duel screen
**As a** learner, **I want** to play a duel, **so that** I practise the
pair I struggle with most.

Done when:
- [ ] Matches the Duel mock: point count, the pair's name, the kana, two
      answers, the tip always showing, and how many times I've mixed
      them up
- [ ] Every answer goes through `recordAnswer()`
- [ ] Winning or losing shows the score, with Retry and Done
- [ ] The result is saved with the finished lessons, including both
      scores, so a scroll can say "Won 10 to 3 on Sept 14"
- [ ] Android back and the X both ask before leaving mid-duel
- `/duel?pair=シツ`. A right answer moves on at once (like lessons); a
  wrong one shows red on the pick and the right answer for 0.7s, since the
  tip is already on screen. A slow right answer says "too slow for a point".
- Saved as `{ lesson: 'duel:シツ', score, opponent }`: finished-lesson
  records got an optional `opponent` field (no save version bump; older
  saves just don't have it). Like games, a finished duel counts toward the
  streak and the daily goal.

### I4. Scrolls
**As a** learner, **I want** a collection of scrolls I've won, **so that**
I can see which pairs I've settled and look up their tips.

Done when:
- [ ] A Scrolls screen, matching the Scroll mock: "N of M" collected, and
      one slot per named pair
- [ ] A won scroll shows the pair, its name, its tip, and "Won 10 to 3
      on" the date of the first win
- [ ] A ready pair shows "Ready" and starts its duel when tapped
- [ ] Any other pair shows "Locked"
- [ ] A Duels card on the Games tab opens the Scrolls screen

---

## Built outside the stories

- Profile tab: rank, training-since date, streak, kana learned, strike
  speed, accuracy, and two levelled badges (Unbroken: streak days 7/30/100;
  Graded: row belts earned 5/10/20). No name or XP total until accounts.
- Ranks tab: your division (named after your rank) and lessons this week.
  The weekly league itself needs accounts (Epic G).
- Learn: Karasu says what opens the next row (how many kana still need
  green belt, and that 3 quick right answers make a kana green). The first
  locked row repeats the rule.
- White belt is count-based: no waits below green, so a row can open in
  one good practice session. Waits start at green (see PROJECT.md).
- Practice and plaque reviews only ask kana the learner has met (answered
  or placed). A newly opened row waits for its plaques. Drills still ask
  any kana it's been mixed up with.
- Answer tiles come in kana-chart order, not shuffled, so the eyes stay
  on the kana instead of hunting for the answer.

## Later

Yokai dungeon and charms, memory match, word forge,
calligraphy, taiko drill, daily kata, the dojo room, assignments,
tournaments, shadow match, supply shed.

Each gets expanded into full stories when its epic comes up. Not before.
