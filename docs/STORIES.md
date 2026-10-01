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
kana that lands before the player started on it isn't recorded at all: box
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
- `scrolls(progress)` in `duel.ts` (test-first) gives each pair's state
  and first win; won first, then ready, then locked, most mixed-up first
  within each. The date is formatted on screen (it needs the timezone).
- The Duels card says how many duels are ready, or how many scrolls are
  won when none are. A won scroll has "Duel again" for a rematch (the
  first win stays on the scroll).
- A ready duel hangs on the Learn wall as a red "boss" plaque, in the unit
  of the row that opened it (`duelRow`).
- A locked slot says what it's waiting for: "Needs タ row" (a row must open
  first) or "1 of 3 mix-ups".

---

## Epic J — Dakuten and handakuten

The basic 46 kana per script are only part of what's needed to read. The
dakuten mark ゛ voices a kana (か ka → が ga) and the handakuten circle ゜
turns the h-row into p (は ha → ぱ pa). That's 25 more kana per script, in
five new rows after the わ row. Combos like きゃ (yōon) are a later epic.

### J1. The new rows
**As a** learner, **I want** to learn が, ざ, だ, ば and ぱ rows, **so that**
I can read the sounds most Japanese words use.

- [ ] `KANA` gains the が, ざ, だ, ば and ぱ rows in both scripts (71 + 71),
      test-first, opening in that order after the わ row
- [ ] Spellings: じ and ぢ are both "ji" (also "zi", "di"); ず and づ both
      "zu" (also "du"). Answer tiles never show the same spelling twice
- [ ] Every new kana has a memory tip that mentions its sound
- [ ] New lookalike pairs for duels: ば/ぱ, バ/パ, ジ/ヅ
- [ ] Everything built on rows (plaques, unlocking, exams, the grid, rank,
      Kana Rain) takes the new rows with no special cases
- Notes: ぢ and づ are rare; their tips say so, and which sound they share.

### J2. Showing them
**As a** learner, **I want** to see that the new rows are dakuten, **so
that** I know what the marks mean.

- [ ] The Learn wall's unit boards say "dakuten" or "handakuten"
- [ ] The Kana tab's grid has a heading before the first dakuten row and
      before the handakuten row
- [ ] "Kana learned" on Profile counts out of every kana (142), not 92
- [ ] The guide explains dakuten and handakuten, and its counts are right

---

## Epic K — Yōon

Yōon are the combined sounds: a kana from the i-column followed by a small
ゃ, ゅ or ょ, read as one sound (き + ゃ = きゃ, kya). There are 33 per
script, in 11 rows of three, after the ぱ row. Each is written with two
characters but read as one kana.

### K1. The yōon rows
**As a** learner, **I want** to learn きゃ, しゃ, ちゃ and the rest, **so
that** I can read words like しゃしん and きょう.

- [ ] `KANA` gains the 11 yōon rows in both scripts (104 + 104), test-first,
      in the order きゃ しゃ ちゃ にゃ ひゃ みゃ りゃ ぎゃ じゃ びゃ ぴゃ
- [ ] Common spellings are accepted: sha/sya, cha/tya/cya, ja/zya/jya
- [ ] Every yōon has a memory tip that mentions its sound
- [ ] Rows are grouped by kind (basic, dakuten, handakuten, yōon), and the
      Learn wall and Kana tab label the yōon rows like the marked ones
- Notes: ぢゃ ぢゅ ぢょ are left out; they're very rare and sound the same
  as じゃ じゅ じょ.

### K2. Two-character kana on screen
**As a** learner, **I want** きゃ to fit wherever a kana is shown, **so
that** nothing overflows or gets cut off.

- [ ] The kana card, the detail sheet, plaques and Kana Rain's falling tags
      shrink a two-character kana to fit

---

## Epic L — Word Forge

Reading single kana is the means; reading words is the goal. Word Forge is
a game of short rounds reading real words built only from kana the learner
has met, each shown with its meaning and spoken after the answer. Every
word answer feeds the kana inside it back into the engine.

### L1. Words and reading them
**As a** learner, **I want** real words made from kana I know, **so that**
I practise reading, not just recognising.

- [ ] A word list in `src/core/words.ts`: hiragana and katakana words with
      meanings, none needing small っ or ー yet (test-checked)
- [ ] `splitWord` turns a word into its kana, taking yōon like しゃ as one
- [ ] A word is ready once the learner has met all of its kana
- [ ] Tap mode: the answer and up to three options that each differ by one
      kana, lookalikes first
- [ ] Type mode: the typed romaji is matched kana by kana; any accepted
      spelling counts (sushi or susi)
- [ ] Each word answer goes through `recordAnswer()` for its kana: all of
      them when read right, and only the misread kana when wrong, with the
      mix-up logged. The time is shared evenly between the word's kana
- Notes: every word's romaji must read back as the same kana (so no
  "honya", which could be ほにゃ), which the tests check.

### L2. The Word Forge screen
**As a** learner, **I want** to play Word Forge from the Games tab, **so
that** I can read words whenever I like.

- [ ] A Word Forge card on the Games tab, opening once 5 words are ready
- [ ] Rounds of 10 words from the Learn screen's script, tapped or typed
      (the same Tap / Type switch as lessons, typed counting double)
- [ ] After each answer: the word's romaji and meaning, spoken aloud
- [ ] A wrong answer shows which kana was misread, with its tip
- [ ] The end shows the usual summary, and the round counts toward the
      streak and daily goal
- Each word's card shows a picture and its English meaning. The pictures are
  Microsoft's Fluent Emoji in 3D (MIT licence), downloaded by
  `scripts/fetch-pictures.mjs` into `assets/images/pictures/` (256 px,
  about 4 MB in all), which also writes `src/constants/word-pictures.ts`.
  The set has no flags, so countries use a stand-in (🗽 for America). The
  licence notice is in the guide, under Credits.

---

## Epic M — Small っ and ー

Two marks that aren't sounds of their own. Small っ (sokuon) doubles the
next consonant: きって kitte. ー (chōonpu) stretches the vowel before it,
mostly in katakana: コーヒー koohii. They're needed for a huge number of
common words, so Word Forge teaches them in words.

### M1. Reading marks in words
**As a** learner, **I want** Word Forge to read words with っ and ー, **so
that** I can read words like がっこう and ラーメン.

- [ ] `splitWord` keeps っ, ッ and ー in a word as marks between its kana,
      test-first; a mark must sit next to the kana it changes
- [ ] Romaji: っ doubles the next consonant (t before ch: matcha); ー
      repeats the vowel before it (koohii). Typing ー as "-" works too
- [ ] Typed readings check each mark; a missed mark makes the word wrong,
      and is named in the correction
- [ ] Tap mode: a word with a mark can offer the word with the mark missed
      (kite for きって) as one of the wrong options
- [ ] Marks have no belt: only the word's kana go through `recordAnswer()`

### M2. Teaching them
**As a** learner, **I want** to be told what っ and ー do, **so that** I'm
not guessing.

- [ ] Before answering a word with a mark, Karasu says what the mark does
- [ ] About 40 common words with っ and ー join the list, with pictures
- [ ] The guide explains both marks

---

## Epic N — Extended katakana

Katakana has combos with a small ァ ィ ゥ ェ ォ for sounds Japanese doesn't
have on its own, used in words from other languages: パーティー (party),
フォーク (fork), カフェ (café). They exist only in katakana.

### N1. The extended rows
**As a** learner, **I want** to learn ファ, ティ, ウィ, シェ and the rest,
**so that** I can read loanwords.

- [ ] Four katakana-only rows after the yōon: ファ フィ フェ フォ; ティ ディ
      デュ; ウィ ウェ ウォ; シェ ジェ チェ (test-first)
- [ ] Each script has its own list of rows (`rowsOf`); unlocking, the Learn
      wall, the grid, exams, placement and rank use it, so hiragana has no
      empty units
- [ ] Every combo has a tip that mentions its sound
- [ ] The Learn wall and Kana tab label the rows as extended katakana
- Notes: ディ shares "di" with ヂ, and ウォ shares "wo" with ヲ; answer
  tiles never show the same spelling twice. トゥ and ドゥ are left out: "tu"
  is already ツ.

### N2. Words that use them
- [ ] Word Forge gains words like パーティー, フォーク, カフェ, チェス and
      ジェットコースター, with pictures

---

## Epic O — Yokai dungeon

A roguelike run, from the mock. Each enemy is a yokai with a kana on its
belly, and a right answer is a strike. Answer too slowly and it attacks, so
speed matters as much as accuracy. Between floors the learner takes one of
three charms, so each run feels different.

### O1. Dungeon rules
**As a** learner, **I want** a run with clear rules, **so that** going
deeper means reading faster.

- [ ] Pure functions in `src/core/dungeon.ts`, test-first
- [ ] Floors get more yokai (3, then one more every floor, up to 6) and
      tougher ones (1 HP, then more every 3 floors, up to 3)
- [ ] Each yokai attacks after a few seconds (5s on floor 1, 8% faster
      every floor, never under 2s); a wrong answer or a timeout costs one of
      5 hearts; the run ends at 0
- [ ] A right answer strikes once; a quick one ("Clean!") too
- [ ] Charms: Paper lantern (Common: attacks 20% slower), Healing tea
      (Common: 2 hearts back), Hint scroll (Rare: the answer's first letter,
      3 times a floor), Sharp bokken (Rare: clean strikes hit twice), Lucky
      omamori (Epic: the first mistake each floor is free). Three to pick
      from, rarer ones less often, none twice except tea

### O2. The dungeon screens
**As a** learner, **I want** to play the dungeon from the Games tab, **so
that** I can practise under pressure.

- [ ] Choose hiragana or katakana, with how many kana I've learned in each
      and my deepest floor; it needs 5 met kana
- [ ] The battle matches the mock: floor, charms, yokai with its kana and
      HP, "Clean!", Karasu with hearts, the attack timer, four dark tiles
- [ ] After each floor, the charm pick from the mock
- [ ] Every answer goes through `recordAnswer()`; a timeout counts as
      wrong with nothing picked
- [ ] The end shows the floor reached, saved per script as the deepest
- [ ] The Games tab card shows the deepest floor

---

## Epic P — Memory match

From the mock: sixteen cards face down, eight pairs. Flip two; a kana and
its romaji (or the same sound in the other script) are a pair. It links the
kana to their sounds, and hiragana to katakana, in a calmer game than the
others.

### P1. Memory rules
- [ ] Pure functions in `src/core/memory.ts`, test-first
- [ ] Three modes: hiragana (あ with a), katakana (ア with a), and both (あ
      with ア); each deals 8 pairs from kana the learner has met in it, the
      weaker ones more often, with no two pairs sharing a spelling
- [ ] Flipping two cards is a move; a pair stays face up, anything else
      turns back over
- [ ] A found pair counts as a right answer for its kana (timed from the
      first card to the second); a miss isn't recorded, since forgetting
      where a card was isn't misreading it
- [ ] The best is the fewest moves, kept for each mode

### P2. The memory match screen
- [ ] Choose a mode, with how many kana are learned for it and the best;
      a mode needs 8 met kana (in both scripts, for "both")
- [ ] The board matches the mock: pairs found, the clock, face-down cards,
      the card turned up, found pairs faded, and Karasu saying what matched
- [ ] The end shows the moves, the time, and whether it's a new best
- [ ] The Games tab card shows the best

---

## Epic Q — Mnemonic cards

Inspired by Tofugu's hiragana guide (but with our own words and pictures):
every kana gets a picture that ties its shape to its sound, and in a lesson
the kana card flips over to show it.

### Q1. Pictures and helped answers
- [ ] Each of the 92 basic kana has a picture (Fluent Emoji 3D, MIT) that
      matches its tip; the other kana use their base kana's picture (が
      uses か's, きゃ uses き's, ファ uses フ's), found by `mnemonicBase`,
      test-first
- [ ] Tips that didn't fit a picture are rewritten, in our own words
- [ ] A "helped" answer (given after looking at the back of the card)
      doesn't move the kana or change its stats, but still marks it met

### Q2. Flipping the card
- [ ] In a lesson, tapping the kana card flips it to its picture, tip and
      sound, and back; looking makes that question's answer a helped one
- [ ] The first time a kana is ever shown, its card starts flipped
- [ ] The Kana tab's detail sheet shows the picture with the tip

---

## Epic R — Supply shed

From the mock: spend mon, the old square-holed coin, on rest days and gear
for Karasu. Everything is cosmetic or a small safety net, never an
advantage, and mon can't be bought with money.

### R1. Mon
- [ ] Mon are earned by training, worked out from the learner's history
      (test-first): 10 per lesson or game, 10 per duel and 20 more for a
      win, 50 per belt exam passed, 20 per day trained
- [ ] Purchases are saved (and merged across devices); the balance is what
      was earned less what was spent
- [ ] Nothing can be bought without enough mon

### R2. Gear
- [ ] A gear list in `src/core/gear.ts`: nine items to buy and five
      unlockables earned by achievements (dungeon floor 10, 5 duels won, a
      30-day streak, 10 row belts, 100 words read)
- [ ] One item per slot (head, face, body, neck, hand), equipped or taken
      off freely once owned; saved in settings
- [ ] Karasu wears his equipped gear everywhere he appears

### R3. The shed
- [ ] The Supply shed screen from the mock: the mon balance, supplies, and
      Karasu's gear with a preview of each
- [ ] A rest day costs 50 mon and can be bought while fewer than 2 are held;
      the streak uses it
- [ ] Mon show on the Games tab (tap to open the shed) and on Profile; a
      passed belt exam shows "+50 mon"
- Notes: the mock's Double XP waits for leagues, since XP doesn't do
  anything yet.

---

## Epic S — Taiko drill

From the mock: kana ride down a track to a festival drumbeat, and the
learner hits the right sound as each reaches the ring. Timing pressure
pushes reading toward automatic.

### S1. Taiko rules
- [ ] Pure functions in `src/core/taiko.ts`, test-first
- [ ] The song's chart: 40 notes at 80 BPM, one a bar for the first 12,
      then every other beat (1.5 s apart, time to read each), after 4 beats
      to count in
- [ ] A hit is judged by how far from the note's beat it lands: Perfect,
      Good or OK; a wrong sound, or a note let past the ring, is a miss.
      A tap far too early does nothing
- [ ] Score: more for Perfect than Good than OK, plus a bonus for the combo;
      a miss breaks the combo
- [ ] Three sound buttons: the next note's answer and two others (its
      lookalikes first), in kana-chart order

### S2. The taiko screen
- [ ] Choose hiragana or katakana; each opens once its た row is open
- [ ] The track from the mock: notes riding down to the ring, beat lines,
      the song's name, score and combo, the judgement, Karasu
- [ ] A synthesized festival drum song plays along (with sound on)
- [ ] Every note goes through `recordAnswer()`: a hit is right; a wrong
      sound logs the mix-up; a note let past is wrong with nothing picked
- [ ] The end shows the score, hits and best combo; the best is kept per
      script and shown on the Games card
- Notes: the mock colours each note to match its button, which would give
  the answer away, so notes stay neutral.

---

## Epic T — Calligraphy

From the mock: trace each kana stroke by stroke with a finger. A faint
guide shows where strokes go and numbered dots show the order. Writing
locks in recognition.

### T1. Strokes and judging them
- [ ] Stroke data for the 142 single-character kana (basic, dakuten and
      handakuten) from KanjiVG (CC BY-SA 3.0), fetched by
      `scripts/fetch-strokes.mjs` into `src/constants/strokes.ts`: each
      stroke's path, and points along it
- [ ] `judgeStroke` in `src/core/calligraphy.ts`, test-first: a drawn stroke
      is clean, okay, off, or drawn backwards, by how far it strays from
      the real one, point by point from start to end

### T2. The calligraphy screen
- [ ] Choose hiragana or katakana; a round is 5 met kana, weaker first
- [ ] The frame from the mock: centre guides, the faint kana, numbered start
      dots, finished strokes in green, the stroke being drawn, "Stroke 2 of
      3", and a note on each stroke; Undo and Show order
- [ ] Each kana is spoken when it's written
- [ ] A round counts toward the streak and daily goal; tracing over a guide
      is copying, not reading, so it doesn't move kana up
- Notes: yōon and extended katakana (two characters) aren't written yet.

---

## Epic U — Daily kata

From the mock: one short, fixed challenge a day. 20 kana, one attempt,
timed. The result is a grid of fast, slow and missed squares that doesn't
give the answers away, so it's safe to share.

### U1. Kata rules
- [ ] `seededRng(seed)` in `src/core/random.ts`, test-first: the same seed
      always gives the same numbers, and different seeds give different ones
- [ ] Pure functions in `src/core/kata.ts`, test-first
- [ ] The day's order: every kana, shuffled by a seed made from the date.
      A learner's kata is the first 20 in that order they've met (either
      script), so learners who know the same kana get the same kata. It
      opens once 20 kana are met
- [ ] Each question's choices come from the same seed, so the kata is fixed
      for the day
- [ ] Kata numbers count days: #1 is 1 January 2026
- [ ] Each answer is fast (right, under 4s), slow (right, slower) or missed
- [ ] One attempt a day: the result is kept with the day's finished games
      (the marks and the time), so it survives restarts and syncs
- [ ] The share text: the kata number, the score, the time, and the grid as
      coloured squares, with no kana in it

### U2. The kata screens
- [ ] The dark Daily kata card at the top of the Games tab: its number, and
      "20 kana, one attempt. Resets in 6h", or today's score once it's done,
      or how many more kana open it
- [ ] The kata: a kana, four tapped answers, a progress bar and a running
      clock; no feedback sheet, just a brief right/wrong flash
- [ ] Every answer goes through `recordAnswer()`. The kata counts toward
      the streak, the daily goal and mon, like any game
- [ ] Leaving part-way uses up the day's attempt: the rest count as missed
- [ ] The result from the mock: Karasu, "18 / 20 in 41.2 seconds", the grid
      with its legend, the streak, Share result and Back to the hall.
      Opening the card later shows the same result
- Notes: the mock's "Faster than 72% today" needs everyone's results, so it
  waits for the weekly league.

---

## Epic V — Assignments

From the mock: three small tasks a day that point the learner at useful
practice, and a monthly challenge on top. Like mon, nothing about them is
stored: each day's assignments, and whether they're done, are worked out
from the finished lessons and games, so they sync with everything else.

### V1. Assignment rules
- [ ] Pure functions in `src/core/assignments.ts`, test-first
- [ ] Kinds, each with a target: finish 3 lessons; earn 200 XP in lessons;
      play 2 games; and, once the learner has played it before, a task for
      each game (Kana Rain twice, floor 3 in the dungeon, a memory board, a
      Taiko drill, a round of calligraphy, 10 words in Word Forge, the daily
      kata), and settling 2 mix-ups (drills or duels)
- [ ] Three a day: one of the first three kinds and two of the rest,
      chosen by a seed made from the date, so they stay put all day. What
      counts as "played before" only looks at days before, so finishing
      something doesn't change today's list
- [ ] Each shows its progress from the day's finished lessons and games.
      A finished lesson keeps the XP it earned
- [ ] Each assignment done earns 15 mon. They start on 28 September 2026,
      so older history doesn't pay out
- [ ] The monthly challenge: 30 assignments in a calendar month earns that
      month's moon

### V2. The assignments screen
- [ ] On the Ranks tab, from the mock: the title with the hours left today,
      the month's challenge card, and Today's three, each with its icon, a
      progress bar and its count, or a check and "+15 mon" once done
- [ ] "Settle 2 mix-ups" names the learner's worst pair ("Like ぬ and め")
- [ ] Tapping an assignment goes where it's done: the Learn tab, a game, the
      daily kata or the scrolls
- [ ] The division card from before stays below
- [ ] A Moon badge on Profile: moons earned, levels at 1, 3 and 12
- [ ] A guide question about assignments
- Notes: the mock's "Ten clean hits in a row" needs each answer's time of
  day, which isn't kept, and the partner assignment ("You and Kenji")
  needs friends. Both wait.

---

## Epic W — Your dojo

From the mock: a room that fills with what the learner has earned. It's a
picture of progress that already exists, so nothing new is stored.

### W1. What the room holds
- [ ] Pure functions in `src/core/dojo.ts`, test-first
- [ ] Plaques: one per row with a belt earned by exam, in either script,
      showing the row's kana and its belt
- [ ] The hanging scroll: the most recently won duel's pair, and how many
      scrolls are won
- [ ] The weapon rack: records from Kana Rain (best score), the dungeon
      (deepest floor), the Taiko drill (best score) and memory match
      (fewest moves); an empty slot for a game not played yet
- [ ] The bonsai grows with the streak: a bare pot, then a sprout (1 day),
      a young tree (7), a full tree (30) and one in blossom (100)
- [ ] A paper lantern for each moon from the monthly challenge

### W2. The dojo screen
- [ ] "Your dojo" on Profile opens it (later made its own tab; see Built
      outside the stories)
- [ ] The room from the mock: a wooden beam, plaques on a rail (with a
      "+" for the next), the scroll with its 勝 seal, the weapon rack, the
      lanterns, and on the floor the bonsai, a cushion, a training dummy
      and Karasu in his gear
- [ ] Empty things are drawn dashed, with a hint of what fills them
- [ ] Under the room: plaques, scrolls and day streak
- Notes: "Visit a friend" needs friends, so it waits.

---

## Epic X — Live duels

Duel a friend in real time. One phone opens a room and gets a code, the
other types it in, and the same kana appear on both screens. The first
right answer takes the point. There's no game server: the phones talk
through a Supabase Realtime channel named after the room. No account is
needed.

### X1. Live duel rules
- [ ] Pure functions in `src/core/live-duel.ts`, test-first
- [ ] Room codes: 4 letters, without ones that are easy to confuse (I, O)
- [ ] The kana: only ones both learners have met, at least 5. Both phones
      work out the same questions from the room code (`seededRng`), so the
      questions never need sending
- [ ] Each round, each player gets one tap. The point goes to the right
      answer with the quicker time, each measured on its own phone from
      when the kana appeared, so a slow connection doesn't cost the point.
      Equal times both score; two wrong answers score nothing
- [ ] Nobody waits long: a round ends at 6 s, and a phone whose player
      can't beat the other's right answer any more gives up the round
- [ ] First to 7 wins; both reaching it in the same round is a draw
- [ ] Messages between the phones (hello, answer, leave) are checked
      before they're trusted, like saved progress

### X2. The live duel screens
- [ ] A "Duel a friend" card on the Games tab (only when Supabase is set
      up), opening a screen to start a room or join one by code
- [ ] Waiting for a friend with the code shown large, then a 3-2-1
      countdown once both are in. A third phone is told the room is full
- [ ] The duel from the mock's duel screen: the kana, four answers, both
      scores, and who took each point
- [ ] Every answer goes through `recordAnswer()`; the duel counts as a
      game (streak, daily goal, mon)
- [ ] The end: won, lost or drawn, and Rematch (a new room, same friend)
- [ ] If the other phone leaves or drops out for 10 s, the duel ends with
      no result

---

## Epic Y — Friends

The foundation for visiting dojos and partner assignments. Friends are
added by a short code; nobody can be searched for. Needs an account.

### Y1. Names, codes and summaries
- [ ] SQL in `supabase/migrations/` for the tables and their row-level
      security: each learner's profile (name, friend code, summary), and
      friend links, which the other person must accept
- [ ] Pure functions in `src/core/friends.ts`, test-first: name rules
      (1 to 20 characters), friend codes, and the summary a friend can
      see (name, rank, streak, today's XP, and the dojo room's contents),
      worked out from progress
- [ ] Only accepted friends can read a summary
- [ ] The summary is updated with each cloud sync

### Y2. The friends screen
- [ ] Choose your name the first time, change it later
- [ ] Your friend code to share, and a box to add someone's
- [ ] Requests to accept or decline, and your friends with their rank and
      streak; remove a friend
- [ ] Opened from the Dojo tab's header

---

### Y3. Friends, live

**As a** learner, **I want** to see requests and acceptances as they happen, **so that** I
don't have to reload the screen or keep checking.

The friends list lives above every screen and updates as the server says things changed
(Supabase Realtime, over the same row-level security), when the app comes back to the
front, and when Friends opens. A request waiting shows as a count on the friends icon and a
dot on the Dojo tab. A banner slides down anywhere in the app when someone asks to be your
friend or accepts your request. Needs `supabase/migrations/20261002000000_friends_live.sql`
run once. Push notifications (with the app closed) need a paid Apple developer account, so
they wait.

Done when:
- [ ] Accepting on one phone shows on the other without reloading
- [ ] A waiting request shows as a count on the friends icon and a dot on the Dojo tab
- [ ] A banner shows for a new request or an acceptance, and not on the Friends screen
- [ ] What you did yourself isn't news

## Epic Z — Visiting a dojo

### Z1. A friend's room
- [ ] Tapping a friend opens their dojo, read-only, drawn from their
      summary: plaques, scroll, weapon rack, lanterns, bonsai, and their
      Karasu in his gear
- [ ] Their rank and streak underneath
- Notes: a summary can be days old, and rest days mean an old streak can still be alive,
  so it's shown as shared, with when they were last seen ("Seen 2 days ago"), in the
  friends list too.

### Z2. Bowing
- [ ] A Bow (礼) button in a friend's dojo, once a day per friend
- [ ] Your dojo shows who bowed since you last looked
- Notes: needs `supabase/migrations/20261003000000_bows.sql` run once. One row per bow;
  its key (bower, friend, day) makes it once a day, and the rules only take bows from
  yourself, to accepted friends, dated about today. "Since you last looked" is a seen flag,
  set when you leave the Dojo tab after the bows showed, so it's the same on every device.

---

## Epic AA — Partner assignments

### AA1. Partner rules
- [ ] Pure functions, test-first: a daily goal shared with one friend
      (combined XP, lessons between you, or both playing the daily kata),
      picked by a seed from the date and the pair, so both see the same one
- [ ] Progress adds your day and your partner's (from their summary)
- [ ] Done earns both of you mon, recorded once on each side so it counts
      after the day ends

### AA2. On the Ranks tab
- [ ] The fourth assignment from the mock: both avatars, "You and Kenji:
      500 XP", one shared bar
- [ ] Choose which friend to partner with; the choice holds for the day
- Notes: the choice and the finish are kept in their own list in progress (`partners`),
  saved and merged like purchases, not as finished lessons: a partner can finish a shared
  goal alone, and that mustn't count as your training day. Targets: 500 XP, 6 lessons, or
  both play the kata; 30 mon each. Choosing is one-sided: if Kenji chose someone else, you
  still share your goal with his day, and he shares his with theirs.

---

## Epic AB — Motion

Karasu himself hangs a new belt plaque, and every animation moves to Reanimated (already
installed): animations run on the UI thread, with springs instead of fixed curves.

### AB1. Karasu hangs the plaque

After a belt exam, back on the Learn tab, the wall scrolls to the row and its peg waits
empty. Karasu, the one standing on the floor, crouches, leaps and flaps up the wall with the
plaque hanging from his feet, hooks it on the peg (it swings, the phone thunks), does a
flip for joy, and glides back down to his spot, landing with a squash. Then he cheers.

Done when:
- [ ] The floor Karasu leaves the floor and comes back; no second Karasu
- [ ] The plaque ends on its peg, wherever the peg is on the wall
- [ ] Leaving the tab mid-flight leaves nothing stuck; coming back plays it again
- [ ] Reduce Motion: the plaque is simply there

### AB2. Everything on Reanimated

Every animation drawn with React Native's `Animated` moves to Reanimated, and gets better on
the way: springs for pops and swings, real 3D flips for cards (turning edge-on, then showing
the other side), and confetti that flutters like paper.

Done when:
- [ ] No `Animated` from `react-native` is left
- [ ] Plaque tap swings like a pendulum; seals stamp with a spring
- [ ] The mnemonic card and memory cards turn over in 3D
- [ ] Reduce Motion still turns motion off everywhere

## Epic AC — Reading room

From kana to reading: Japanese as it's written in the world. Word Forge reads single words
aloud (kana to romaji); the reading room reads for meaning, in places, and in short phrases,
where a few kana are read differently. Everything in it uses only kana the learner has met.

### AC1. Signs in places
**As a** learner, **I want** to find my way by reading real signs, **so that** kana start to
mean something.

- [ ] Pure rules in `src/core/reading.ts`, test-first; the signs themselves in
      `src/content/signs.ts`, each with its text, meaning and romaji (checked by a test)
- [ ] Places with their signs: the station (でぐち exit, いりぐち entrance, きっぷ ticket,
      トイレ toilet…), a café (コーヒー, ケーキ, メニュー, みず…), a shop, and the street
      (とまれ stop…)
- [ ] A question: "Find: exit", with four signs from the same place; tap the one that says it
- [ ] A sign is ready once all its kana have been met; a place opens with 4 ready signs
- [ ] A wrong tap shows what both signs say, and how they're read

### AC2. Phrases, and the kana read differently
**As a** learner, **I want** to read short everyday phrases, **so that** I can read more than
single words.

- [ ] Phrases and short sentences, with spaces between words as in beginners' books:
      こんにちは, ありがとう, いただきます, みずを ください…
- [ ] A question: read the phrase, choose what it means from four
- [ ] Particles: は read "wa", へ read "e", を read "o" when they mark a word's role. After an
      answer, the phrase's romaji shows them picked out, with a one-line note
- Notes: nothing in the kana shows which は is a particle (はな is "hana"), so the phrase list
  marks them in brackets: みず[を] ください. In romaji a particle is its own word ("mizu o
  kudasai"), except in a one-word phrase ("konnichiwa").

### AC3. The reading room
**As a** learner, **I want** a place for all of this, **so that** reading is something I can
practise any day.

- [ ] A "Reading room" card on the Games tab, once the first place opens
- [ ] Its screen: the places and Phrases, each with how many of its signs you've read right,
      locked ones saying what opens them
- [ ] A round is 8 questions from one place (or Phrases); the end shows what was read, and
      counts as a game (`game:reading`) for mon and assignments
- [ ] A guide topic, including the particles
- Notes: like the other game cards, the reading room's card is always there, saying what
  opens it. Each set shows its signs ready and its best round (from the round's record), not
  a count of each sign read right, which would need storing per sign.

## The learning track: vocabulary and grammar

After kana: the 2,500 most frequent words, studied with spaced repetition like Anki, and
grammar lessons in the order beginners usually meet it (the order of textbooks like Genki I).
Decided with the learner:

- Words are written as they really are, in kanji, with furigana (the reading in small kana
  above). Furigana can be hidden per card once a word's kanji are known.
- Grammar lessons are our own: explanations and example sentences written for this app,
  following a Genki-like order. Nothing is copied from Genki (it's copyrighted).
- The words come from open data, built into the app by a script: a frequency list for which
  words and in what order, JMdict for readings and meanings, JmdictFurigana for which
  reading goes over which kanji, and Tatoeba for example sentences. Each source's licence is
  checked when it's chosen, and credited in the app.

Vocabulary comes first: grammar lessons build their examples from the deck's words.

## Epic AD — The word deck

### AD1. Building the deck
**As a** learner, **I want** the most useful words in the app, **so that** I learn the ones
I'll meet most.

- [ ] `scripts/build-vocab.mjs` downloads the sources, joins them, and writes
      `src/content/vocab.json`; the raw downloads aren't committed, the result is
- [ ] Each word: its rank, how it's written, its reading, its meanings, its part of speech,
      which kana of the reading sit over which kanji, and an example sentence with a
      translation where there is one
- [ ] 2,500 words, most frequent first, leaving out what isn't a word to study on its own
      (particles like の, and names)
- [ ] Tests on the result: every reading uses kana the app teaches, no duplicates, every word
      has a meaning, the furigana covers the word exactly
- [ ] The sources and their licences in Settings, under About
- Notes: the frequency list is Jiten's global list (anime, drama, films, novels and more;
  CC BY-SA 4.0). Spellings of one word (分かる, わかる) are one entry, ranked by its most
  frequent spelling and shown that way. A kana word that could be several entries (いる is
  居る or 要る) is the one Tatoeba's sentences use most. Left out: particles, auxiliaries,
  suffixes and prefixes, kana-only expressions (んだ, という), single kana and cut-off
  sounds (あっ), and vulgar or insulting words. An example sentence is Tatoeba's shortest
  checked one (28 characters at most) whose every kanji can be given its reading. Because
  of the share-alike licences, vocab.json is CC BY-SA 4.0; the app's code isn't affected.

### AD2. Furigana
- [ ] A `Furigana` component: kanji with their readings above, drawn from the deck's
      alignment; kana on their own get none
- [ ] It works in words and in whole example sentences, on iOS, Android and web

### AD3. Topics
**As a** learner, **I want** to study words by topic, like food or travel, **so that** I can
learn what I need for a situation.

- [ ] Twelve topics (food, places, people, time, body, feelings, nature, animals, home, work,
      numbers, talking), tagged when the deck is built; a word can be in several, or none
- [ ] The deck list filters by topic
- [ ] New words can come from one topic ("Any topic" by default); reviews always cover all
- Notes: a word is in a topic when its main meaning (first sense) uses one of the topic's
  keywords, as a whole word; numbers and counters by their part of speech. Keyword matching
  makes some mistakes ("grounds" put 理由, reason, in nature), so the script has a list of
  exceptions (`NOT_IN`) and additions (`ALSO_IN`); tagging is approximate and easy to fix.

### AD4. A better voice, now
**As a** learner, **I want** words spoken clearly, **so that** I learn to say them right.

- [ ] The app speaks with the best Japanese voice on the device: an Enhanced or Premium one
      if it's installed, the default otherwise
- [ ] Settings says which voice it's using, with a button to hear it, and how to download a
      better one (on iOS: Settings, Accessibility, Spoken Content, Voices, Japanese)
- [ ] Any Japanese voice on the device can be chosen instead, in Settings; the choice is kept,
      and if that voice is removed, the best one is used again
- Notes: the app speaks with a voice it names itself, so the voice picked in iOS's own
  Spoken Content settings doesn't apply to it; hence the app's own choice.

### AD5. Recorded voices from VOICEVOX (set aside)
Set aside: with a downloaded Enhanced or Premium voice chosen in Settings, the phone's voice
is good enough. Here if that changes.
**As a** learner, **I want** natural recordings of every word and example sentence, **so that**
pronunciation doesn't depend on my phone's voice.

- [ ] A script that asks VOICEVOX (a free Japanese speech engine, run once on the Mac) to say
      each word and example sentence, in one natural voice whose terms allow it, with its
      credit on the Sources screen
- [ ] Clips small enough to ship, or kept online and saved on the phone the first time
- [ ] The app plays a clip when there is one, and the phone's voice otherwise

### AD6. Context: politeness, and word families
**As a** learner, **I want** to know who says a word and when, **so that** I don't call my own
mother お母さん to a stranger, or a boss お前.

- [ ] Each word keeps JMdict's register labels (honorific, humble, polite, casual, familiar,
      mostly men or women, children's, slang…) and its usage note, shown on the card's back
- [ ] Word families, written for the app: mother, father, I, you, siblings, husband and wife,
      the respectful and humble verbs (eat, say, do, go/come/be, give and receive), yes and no,
      and person. A word in a family shows the whole family on its card, with when each is used
- [ ] Tests: each family has words from the deck, read as the deck reads them, and every label
      the deck uses has a name

## Epic AE — Spaced repetition

### AE1. The scheduler
**As a** learner, **I want** each word to come back just before I'd forget it, **so that**
2,500 words is possible in minutes a day.

- [ ] Pure rules, test-first: FSRS, the scheduler modern Anki uses (a small, tested library
      if a good one fits, pure TypeScript either way). Again, Hard, Good, Easy
- [ ] Each studied word's card kept in progress, saved, and merged across devices (the more
      recently reviewed copy wins)
- [ ] New words a day (10 to start, changeable), in deck order; reviews due come first
- [ ] What's due today, and what each button would schedule ("Good: 4 days")
- Notes: FSRS-5 is written here (`src/core/srs.ts`), from its published formulas and default
  parameters, rather than taken from a library: no dependency, and pure like the rest of
  core. One learning step: a word rated Again (new or forgotten) comes back in ten minutes,
  in the same session; everything else is in whole days, with Hard < Good < Easy.

### AE2. Reviewing
- [ ] The front: the word, with furigana (unless hidden for it). Tap to turn it over
- [ ] The back: reading, meanings, the example sentence with its translation, and the word
      spoken aloud
- [ ] Four buttons with their next intervals; a session ends when nothing's due, showing
      what was reviewed and learned
- [ ] A review session counts as training for the streak and daily goal, and earns mon
- Notes: furigana on the front goes by itself once a word is known well (three weeks'
  stability), so nothing is stored for it. A session is kept as `words:review`, its score the
  cards reviewed; it isn't a kana lesson for assignments, friends' summaries or partner goals.

### AE2b. Studying more
- [ ] Learn 10 more: the next new words past the day's number, once today's are done
- [ ] Practice recent words: the words studied today (or this week), as often as you like,
      with just Again and Got it. It never changes the schedule, so extra drilling can't make
      words come back later than they should

### AE3. Where words live
- [ ] The Kana tab becomes Study: Kana, Words and Grammar
- [ ] Words: due today, new today, words learned out of 2,500, and a list of the deck to
      browse and search
- [ ] Assignments can ask for reviews ("Review 20 words")

## Epic AF — Grammar

### AF1. Conjugation rules
**As a** learner, **I want** exercises that know how Japanese words change, **so that** my
answers can be checked properly.

- [ ] Pure rules, test-first: verb groups (る-verbs, う-verbs, the irregulars する and くる),
      and the forms a Genki I learner meets: ます, ません, ました, ませんでした, the
      dictionary form, て, ない, た, and adjectives (い and な) in present and past,
      positive and negative

### AF2. Lessons and exercises
- [ ] A lesson is data: short explanation sections, example sentences (with furigana and
      translations), then exercises
- [ ] Exercises: choose the particle, choose the right form, put the words in order, and
      choose the meaning; each checked by the rules, with the right answer explained
- [ ] Lessons only use words from the deck, and say which ones are new

### AF3. The grammar path
- [ ] Units in order, each opening when the one before is done, on the Study tab
- [ ] Finishing a lesson counts as training, like a kana lesson
- [ ] Grammar points reviewed later, by spaced repetition like words: each lesson gets an FSRS
      card when it's finished; a review asks three of its exercises, and how they went is the
      rating (all right: Good; most right: Hard; else Again). Lessons finished before reviews
      existed are due at once. The readiness card shows until the first lesson is done.
- Notes: lessons are written with readings in brackets after their kanji (私[わたし]は). Tests
  check every kanji has a reading, every answer is among its options, and every listed word is
  in the deck. Form exercises are checked by the conjugation rules, and their wrong options
  are the mistakes learners make (帰る taken as a る-verb: 帰ます). A finished lesson is kept as
  `grammar:<id>`, so it counts as a lesson for the streak, daily goal and mon.

### AF3c. Words for grammar
- [ ] "For grammar" beside the topics: new words from the grammar lessons' words, in lesson
      order (132 words for the six units)
- [ ] Each lesson says how many of its words are started, with a button to learn the rest
      first (a word session of just those)

### AF3b. When to start
- [ ] A card on the grammar path: what's needed first (all hiragana at green belt, basic and
      with ゛ ゜ and combined sounds) and what helps (50 words started, katakana basics), with
      how far along each is. Advice only: nothing is locked
- [ ] A guide topic: when should I start grammar?

### AF4 onwards. The lessons themselves
Written in batches, in a Genki-like order, each batch its own story:
- AF4: です and the basics (XはYです, questions with か, の, これ・それ・あれ)
- AF5: verbs (ます forms, を・に・で・へ, time words)
- AF6: あります・います, locations, and the past tense
- AF7: adjectives (い and な), and liking things (すき・きらい)
- AF8: the て-form (requests, ongoing actions, and permission)
- AF9: the short forms (ない, た) and casual speech
- Notes: all six units are written: 35 lessons. Lesson and section titles and explanations
  keep Japanese in kana (checked), since they're shown without furigana.

## Built outside the stories

- Profile tab: rank, training-since date, streak, kana learned, strike
  speed, accuracy, and two levelled badges (Unbroken: streak days 7/30/100;
  Graded: row belts earned 5/10/20). No name or XP total until accounts.
- Ranks tab: your division (named after your rank) and lessons this week.
  The weekly league itself needs accounts (Epic G).
- Learn screen laid out like the mock: a script picker chip (ひらがな ▾),
  streak and daily ring on top; the unit card; a scrolling wall of shoji
  paper under a wooden beam, four plaques to a rail (three on narrow
  phones, so most rows fit on one rail), bare pegs in a rail's empty spots,
  unit names on small wooden boards (locked ones in pale wood), opening at
  the current unit; and a floor at the bottom
  where Karasu stands and talks. Tapping his bubble does what he suggests
  (Begin, Take exam, Practice). Exams hang as gold plaques and ready duels
  as red ones. The mock's coins and chest wait for the Mon currency.
- Learn: Karasu says what opens the next row (how many kana still need
  green belt, and that 3 quick right answers make a kana green). The first
  locked row repeats the rule.
- Belts are speed-based, with no waiting (see PROJECT.md): 3 steps to a
  belt, each a quick right answer, under 4s for green, 2.5s for brown and
  1.5s for black. The first version waited 20 minutes to 21 days between
  steps above green; it felt too slow and was replaced. Saves from before
  (version 3) are upgraded, keeping each kana's belt.
- Typing mode: a Tap / Type ×2 switch in the lesson bar (and a Type
  answers switch on Profile). A typed right answer moves a kana 2 steps,
  with more time (6s, 4s, 3s). The answer is checked as soon as a whole
  spelling is typed; "n" waits for Enter or Check, since it may start
  na, ni... A wrong typed answer logs the kana it spells as the mix-up.
  The keyboard stays up for the whole lesson (one answer box, cleared
  between questions), since any time it closed and reopened, the screen
  jolted. So a wrong typed answer shows its correction in place of the
  kana card, and the box's Continue button (or return) moves on.
  Exams and duels stay tapped. Kana Rain answers count as typed.
- The Kana tab's detail sheet shows what the next belt takes ("To brown:
  2 more", and how quick) instead of a wait.
- Practice and plaque reviews only ask kana the learner has met (answered
  or placed). A newly opened row waits for its plaques. Drills still ask
  any kana it's been mixed up with.
- Answer tiles come in kana-chart order, not shuffled, so the eyes stay
  on the kana instead of hunting for the answer.
- Sound: each kana is spoken (the device's Japanese voice, `expo-speech`)
  right after it's answered, never before, since hearing it first would
  give the answer away. Karasu's bubble then shows the kana with a replay
  button. A speaker button in the lesson bar mutes it, and a Sound switch
  on the Profile tab does the same outside lessons (one saved setting);
  the kana detail sheet has a speaker button that always plays. Katakana is
  spoken even for hiragana, so は and へ aren't read as particles. All of it
  goes through `src/audio/pronounce.ts`. It's spoken at 0.6 speed with the
  long-vowel mark (アー), so the sound is held instead of clipped. On iOS
  nothing plays while the phone is on silent. Public-domain recordings of a
  native speaker were tried and set aside: the device voice sounded better.

- Feel: haptics (a tap for right, a buzz for a miss, a thunk when a lesson
  ends or a seal lands, a success buzz for big wins), with a Haptics switch
  on Profile. Karasu blinks and breathes, hops on a right answer and shakes
  his head on a miss, and says something when tapped on the Learn floor
  (`karasuSays`: often the learner's most mixed-up pair or trickiest kana).
  Confetti and a cheering Karasu for a belt, a duel win, a new row (the
  completion screen says which) and a Kana Rain record. On the Learn wall a
  new plaque's seal stamps down and a new row's plaques flip over, played
  when the wall comes back into view (`wall-news.ts`); tapped plaques swing.
  In lessons, a combo chip from 3 right in a row, growing at 5 and 10. All
  motion is skipped with the phone's Reduce Motion setting.
- Belt ceremony: the new belt falls onto Karasu's waist, wraps round him,
  he tugs the knot tight, and a gong rings as he cheers.
  Back on the Learn wall, the wall scrolls to that row and a small Karasu
  flies up from the floor carrying the new belt plaque by its cord, hooks it
  on its peg, and flies off while it swings.
- Sound effects: a taiko drum when a lesson, duel, failed exam or Kana Rain
  game ends, and a gong when a belt is tied on. Both are made from plain
  maths by `scripts/make-sounds.mjs` (no recordings, no licence), played
  with `expo-audio`, follow the same Sound switch as the spoken kana, and
  stay quiet when the phone is on silent.

- Guide: "How the dojo works", opened from Profile (`/guide`, or
  `/guide?topic=belts` to open one question). Every rule a learner might ask
  about, as questions that open to show their answers, with a belt ladder
  picture. The text lives in `src/content/guide.ts` and takes its numbers
  from the engine; `guide.test.ts` fails if a hand-written rule changes.

- Dojo tab: the Profile tab became the Dojo tab, so the room and the shed
  are part of the main app instead of rows in a settings list. The room is
  at the top, and the supply shed is through a doorway in it, a noren
  curtain marked 店 (the training dummy made way for it). Mon and a cog sit
  in the header. Rank, six numbers (with plaques and scrolls won) and
  badges are below. Daily goal, sound, haptics, typing, account and the
  guide moved to a Settings screen behind the cog.

## Later

Tournaments (the weekly league) and shadow match were set aside: not
wanted for now.

Each gets expanded into full stories when its epic comes up. Not before.
