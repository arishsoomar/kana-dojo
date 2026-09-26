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

## Later

Yokai dungeon and charms, memory match, word forge,
calligraphy, taiko drill, daily kata, the dojo room, assignments,
tournaments, shadow match, supply shed.

Each gets expanded into full stories when its epic comes up. Not before.
