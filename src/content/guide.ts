import { FAST_MS } from '@/core/answers';
import { DUEL_LOSS, DUEL_READY_MIXUPS, DUEL_WIN } from '@/core/duel';
import { CHARMS, DUNGEON_MIN_KANA, MAX_HEARTS } from '@/core/dungeon';
import { EXAM_LENGTH, EXAM_PASS, EXAM_TIME_MS } from '@/core/exam';
import { FORGE_MIN_WORDS, FORGE_ROUND } from '@/core/forge';
import { DAILY_GOALS } from '@/core/goal';
import { KANA } from '@/core/kana';
import { LESSON_LENGTH } from '@/core/lesson';
import { GEAR, REST_DAY_PRICE } from '@/core/gear';
import { ASSIGNMENTS_PER_DAY, MONTH_GOAL } from '@/core/assignments';
import { KATA_LENGTH } from '@/core/kata';
import { LIVE_MIN_SHARED, LIVE_ROUND_MS, LIVE_WIN } from '@/core/live-duel';
import { MEMORY_PAIRS } from '@/core/memory';
import { MON } from '@/core/mon';
import { NAMED_PAIRS } from '@/core/pairs';
import { RAIN_LIVES } from '@/core/rain';
import { SONG_NAME, TAIKO_NOTES } from '@/core/taiko';

// The in-app guide: how the dojo works, as questions a learner might ask. Numbers come from
// the engine itself, so the guide stays right if a rule changes.

// A block of an answer: a paragraph, a bulleted list, or the belt ladder picture.
export type GuideBlock = string | { bullets: string[] } | { belts: true };

export type GuideTopic = { id: string; question: string; answer: GuideBlock[] };
export type GuideSection = { title: string; topics: GuideTopic[] };

const FAST = `${FAST_MS / 1000} seconds`;
const count = (script: 'hiragana' | 'katakana') => KANA.filter((k) => k.script === script).length;
const GOALS = DAILY_GOALS.map((g) => `${g.minutes} minutes (${g.lessons} ${g.lessons === 1 ? 'lesson' : 'lessons'})`);

// How each belt is reached, for the ladder picture: 3 steps each, and faster each time.
export const BELT_STEPS = [
  { belt: 'white', how: 'Every kana starts here.' },
  { belt: 'green', how: '3 right answers, each under 4s (typed: under 6s).' },
  { belt: 'brown', how: '3 more, each under 2.5s (typed: under 4s).' },
  { belt: 'black', how: '3 more, each under 1.5s (typed: under 3s).' },
] as const;

export const GUIDE: GuideSection[] = [
  {
    title: 'The basics',
    topics: [
      {
        id: 'what',
        question: 'What is Kana Dojo?',
        answer: [
          `A dojo for learning to read the Japanese kana: ${count('hiragana')} hiragana and ${count('katakana')} katakana. That's the 46 basic kana in each, their dakuten and handakuten forms, the yōon combos like きゃ, and katakana's extra combos like フォ. The goal is to read each one at a glance, without having to stop and recall it.`,
          'Karasu, the crow, is your sensei. He grows as you do.',
        ],
      },
      {
        id: 'lesson',
        question: 'How does a lesson work?',
        answer: [
          `Each lesson is ${LESSON_LENGTH} questions. You see a kana and give its sound: tap it from four answers, or type it.`,
          {
            bullets: [
              'The answers always sit in kana-chart order (a, i, u, e, o), so your eyes stay on the kana, not on hunting for the answer.',
              'Answer quickly: a quick right answer is what moves a kana up.',
              "After you answer, you hear the kana spoken, and Karasu hops (or shakes his head if you missed).",
              'Get one wrong and you see the right answer, with a tip for telling it apart from the one you picked.',
              'Tap the kana card to turn it over: the back has a picture and a memory tip that tie its shape to its sound. The first time you meet a kana, its card starts turned over.',
              "If you look at the back before answering, that question is practice: a right answer won't move the kana up. (A wrong one still counts.)",
            ],
          },
        ],
      },
      {
        id: 'wall',
        question: 'What are the plaques on the wall?',
        answer: [
          "Each row of the kana chart is a unit on the Learn wall. A unit's plaques are its lessons:",
          {
            bullets: [
              'Each plaque teaches 2 new kana. About 7 in 10 questions are its new kana; the rest review kana you already know.',
              'The last plaque in a row, Mixed, reviews the whole row.',
              'Plaques open one at a time, in order. The dark one is next. A red seal means done.',
            ],
          },
          'Gold plaques are belt exams, and red ones are duels. Both are explained below.',
        ],
      },
      {
        id: 'marks',
        question: 'What are dakuten, handakuten, yōon and extended katakana?',
        answer: [
          'After the basic rows, the wall goes on to the kana made from them:',
          {
            bullets: [
              'Dakuten ゛, two little strokes, voice the sound: か ka → が ga, さ sa → ざ za, た ta → だ da, は ha → ば ba.',
              'Handakuten ゜, a little circle, turns h into p: は ha → ぱ pa.',
              'ぢ and づ sound just like じ (ji) and ず (zu), so either spelling is right when you type them. They\'re rare; じ and ず are the usual way to write those sounds.',
              'Yōon join a kana to a small ゃ, ゅ or ょ, read as one sound: き ki + ゃ → きゃ kya, し shi + ょ → しょ sho. They\'re written with two characters but count as one kana.',
              'Extended katakana use a small ァ ィ ゥ ェ ォ for sounds from other languages: フォ fo in フォーク (fork), ティ ti in パーティー (party). Only katakana has them, at the end of its wall.',
            ],
          },
        ],
      },
      {
        id: 'small-tsu',
        question: 'What do small っ and ー do?',
        answer: [
          "They aren't sounds of their own; they change the kana beside them. You'll meet them in Word Forge.",
          {
            bullets: [
              'Small っ (ッ in katakana) doubles the sound after it, like a tiny pause before it: きって is kitte (stamp), ざっし is zasshi (magazine). Before ch it\'s written with a t: ちょっと is chotto.',
              'ー stretches the vowel before it, mostly in katakana: コーヒー is koohii (coffee), ゲーム is geemu (game). When typing, you can also type ー as a dash: ko-hi-.',
              'Leaving one out changes the word, so a reading without it counts as wrong: きて (kite) is a different word from きって (kitte).',
            ],
          },
        ],
      },
      {
        id: 'karasu',
        question: 'Who is Karasu, and what does he say?',
        answer: [
          'Karasu stands on the dojo floor and always tells you what to do next. Tap his bubble to do it.',
          'Tap Karasu himself and he says something: often a tip about the kana you mix up most, or the one you find trickiest.',
        ],
      },
    ],
  },
  {
    title: 'Levelling up',
    topics: [
      {
        id: 'belts',
        question: 'How do kana level up?',
        answer: [
          'Every kana has its own belt: white, green, brown, then black. Each belt is 3 steps, and each step is one quick right answer. Each belt asks for more speed, because the goal is reading at a glance.',
          { belts: true },
          "A right answer that's too slow keeps a kana where it is. A wrong answer drops it 2 steps. There's no waiting: you can climb as fast as you can read.",
          'To see what a kana needs next, tap it on the Kana tab.',
        ],
      },
      {
        id: 'rows',
        question: 'How do I open the next row?',
        answer: [
          "The next row opens once 4 in 5 of this row's kana are green belt. For the あ row, that's 4 of its 5 kana.",
          "Green only takes 3 quick right answers per kana (or 2 typed), so one good session can open a row. Karasu says how many more are needed, and the next row's board says it too.",
          "A new row's kana only come up once a plaque has taught them. Until then, practice sticks to kana you've met.",
          'Hiragana and katakana are separate paths. Switch between them with the picker at the top of the Learn screen.',
        ],
      },
      {
        id: 'exams',
        question: 'What are belt exams?',
        answer: [
          "When every kana in a row reaches a belt, that row's belt exam appears on the wall as a gold plaque.",
          {
            bullets: [
              `${EXAM_LENGTH} questions on the row, in ${EXAM_TIME_MS / 1000} seconds, with no hints.`,
              `You need ${EXAM_PASS} right to pass, so the exam ends as soon as you've missed ${EXAM_LENGTH - EXAM_PASS + 1}.`,
              'Pass and Karasu ties the belt on, and the row earns a belt plaque for the wall.',
              'Fail and you can try again whenever you like.',
            ],
          },
          "A row's belt never shows higher than its kana are now. If its kana slip back after wrong answers, practise them and the belt returns.",
        ],
      },
      {
        id: 'typing',
        question: 'Should I tap or type my answers?',
        answer: [
          'Typing is harder, since you have to recall the sound instead of recognising it, so it counts double: each quick right answer typed moves a kana up 2 steps instead of 1. Typing also gets more time, since typing takes longer than tapping.',
          'Switch with Tap / Type at the top of any lesson, or with Type answers in Settings (the cog on the Dojo tab). You can type any common spelling, like shi or si.',
          'Belt exams and duels are always tapped.',
        ],
      },
      {
        id: 'rank',
        question: 'What is my rank, and why does Karasu change?',
        answer: [
          'Your rank is your overall belt, and it sets what Karasu looks like. It comes only from belt exams you pass:',
          {
            bullets: [
              'Green belt: 3 rows with a green belt or higher.',
              'Brown belt: 10 rows with a brown belt or higher.',
              'Black belt: every row, in both hiragana and katakana, at black belt.',
            ],
          },
          'At white belt Karasu is a fledgling. He becomes a student at green, and a master with a staff at black.',
        ],
      },
      {
        id: 'xp',
        question: 'What is XP?',
        answer: [
          `Each right answer earns 10 XP, and one under ${FAST} earns 5 more. You see it at the end of a lesson.`,
          'XP only comes from right answers. Time spent never earns anything, so speed and accuracy are what count.',
        ],
      },
    ],
  },
  {
    title: 'Training',
    topics: [
      {
        id: 'practice',
        question: "What do I do once a row's plaques are done?",
        answer: [
          "Karasu suggests Practice: lessons on kana you've met, which pick the ones on lower belts more often.",
          'To work on a single kana, open the Kana tab, tap the kana, and tap Drill. A drill mixes it with the kana you confuse it with.',
        ],
      },
      {
        id: 'kana-tab',
        question: 'What does the Kana tab show?',
        answer: [
          'Every kana, coloured by its belt. Tap one to see:',
          {
            bullets: [
              'Its accuracy, and its strike speed (your typical time for a right answer).',
              'What its next belt takes: how many more quick right answers, and how quick.',
              'The kana you mix it up with, and a memory tip for its shape.',
              'A button to hear it, and one to drill it.',
            ],
          },
        ],
      },
      {
        id: 'placement',
        question: 'I already know some kana. Do I have to start from the beginning?',
        answer: [
          "No. When you start, choose \"I know some hiragana\" and take a short test. It goes row by row and stops at the first row you mostly miss. Kana you get right quickly start at green belt, so their rows are open and done.",
          'If you already know all the hiragana, you can start on katakana.',
        ],
      },
    ],
  },
  {
    title: 'Duels and games',
    topics: [
      {
        id: 'duels',
        question: 'What are duels?',
        answer: [
          `Every wrong answer notes which kana you mixed up. Once you've mixed up a lookalike pair (like シ and ツ) ${DUEL_READY_MIXUPS} times, and both kana are open, a duel with that pair appears as a red plaque on the wall.`,
          {
            bullets: [
              'Each point shows one of the two kana, and you pick which one it is.',
              `A right answer in under ${FAST} is your point. A wrong answer is the opponent's. A slow right answer is nobody's.`,
              `First to ${DUEL_WIN} wins. If the opponent reaches ${DUEL_LOSS}, you lose.`,
            ],
          },
        ],
      },
      {
        id: 'scrolls',
        question: 'What are scrolls?',
        answer: [
          `Win a duel and you earn that pair's scroll, which keeps its tip and your score. There are ${NAMED_PAIRS.length} to collect. See them in the Games tab, under Duels.`,
          'You can rematch any duel, even after you win.',
        ],
      },
      {
        id: 'forge',
        question: 'How does Word Forge work?',
        answer: [
          `Read real words, like ねこ (cat) or しゃしん (photo), made only of kana you've met. It opens once you know the kana for ${FORGE_MIN_WORDS} words, and more words join as you learn more kana.`,
          {
            bullets: [
              `A round is ${FORGE_ROUND} words, from the script the Learn screen is on.`,
              "Tap the word's romaji from four options, or type it. Each wrong option is the word with one kana misread, often as a lookalike.",
              'Each word comes with a picture and its meaning, and after you answer you hear it spoken.',
              "It counts as practice for every kana in the word: a word read right moves them all up (typed counts double, like lessons), and a misread kana is logged as a mix-up.",
            ],
          },
        ],
      },
      {
        id: 'dungeon',
        question: 'How does the Yokai dungeon work?',
        answer: [
          `Choose hiragana or katakana (you need ${DUNGEON_MIN_KANA} kana learned in it), then go down floor after floor. Each yokai has one of your kana on its belly, and your weaker kana come up most.`,
          {
            bullets: [
              "A right answer strikes the yokai. A quick one is a clean strike. Deeper yokai take more strikes.",
              `Answer too slowly, or wrong, and it attacks: you lose one of your ${MAX_HEARTS} hearts. Every floor, they attack sooner.`,
              'After each floor, take one of three charms. ' + Object.values(CHARMS).map((c) => `${c.name}: ${c.about}`).join(' '),
              'The run ends when your hearts run out. Your deepest floor in each script is saved, and every answer counts as practice.',
            ],
          },
        ],
      },
      {
        id: 'memory',
        question: 'How does memory match work?',
        answer: [
          `Sixteen cards lie face down: ${MEMORY_PAIRS} pairs, from kana you've learned. Turn over two at a time; a pair stays up, anything else turns back over. Find them all in as few moves as you can.`,
          {
            bullets: [
              'Choose what to pair: hiragana with romaji (あ and a), katakana with romaji (ア and a), or hiragana with katakana (あ and ア).',
              'Each pair you find counts as a right answer for its kana. A miss doesn\'t count against you: forgetting where a card was isn\'t misreading it.',
              'Your best (the fewest moves) is kept for each of the three.',
            ],
          },
        ],
      },
      {
        id: 'taiko',
        question: 'How does the Taiko drill work?',
        answer: [
          `Kana ride down a track to the beat of ${SONG_NAME}, a festival drum song. Tap each one's sound as it reaches the ring. Choose hiragana or katakana; each opens once its た row is.`,
          {
            bullets: [
              `There are ${TAIKO_NOTES} notes: one a bar to warm up, then one every other beat, slow enough to read each one.`,
              "The closer to the beat you hit, the more it scores: Perfect, Good or OK. Hits in a row build a combo, which adds to every hit; a wrong sound, or a note let past, breaks it.",
              'Every note counts as practice: a hit is a right answer, and a wrong sound is logged as a mix-up.',
              'Your best score is kept for each script.',
            ],
          },
        ],
      },
      {
        id: 'live',
        question: 'How do I duel a friend live?',
        answer: [
          `On the Games tab, tap Duel a friend and start a room. Send your friend the 4-letter code; they tap Join and type it. You both see the same kana, and the first right answer takes the point. First to ${LIVE_WIN} wins.`,
          {
            bullets: [
              'You each get one tap per kana. If you both get it right, the quicker one scores. Times are measured on each phone, so a slow connection never costs you a point.',
              `Each kana waits up to ${LIVE_ROUND_MS / 1000} seconds. Only kana you've both met come up, and you need at least ${LIVE_MIN_SHARED} in common.`,
              'Every answer counts as practice, and the duel counts as a game for your streak, daily goal and mon.',
              "You both need to be in the app with an internet connection. You don't need an account.",
            ],
          },
        ],
      },
      {
        id: 'kata',
        question: 'What is the daily kata?',
        answer: [
          `One short challenge a day, at the top of the Games tab: ${KATA_LENGTH} kana, one attempt. Everyone gets the day's kana in the same order, drawn from the ones they've met. It opens once you've met ${KATA_LENGTH} kana.`,
          {
            bullets: [
              `Each answer is fast (right, under ${FAST}), slow (right, but slower) or missed. The clock only runs while you answer.`,
              "Leaving part-way uses up the day's attempt: kana you didn't reach count as missed.",
              "Your result is a grid of coloured squares with no kana in it, so you can share it without giving today's kata away.",
              'Every answer counts as practice, and the kata counts for your streak, daily goal and mon. A new one starts at midnight.',
            ],
          },
        ],
      },
      {
        id: 'calligraphy',
        question: 'How does calligraphy work?',
        answer: [
          "Trace five of your kana, stroke by stroke, with your finger. A faint guide shows the kana, and numbered dots show where each stroke starts and in what order. Writing a kana helps fix its shape in your memory.",
          {
            bullets: [
              "Each stroke is checked against the real one: a clean stroke, a good one, or try again. It also notices a stroke drawn the wrong way round.",
              'Stuck? Show order plays the strokes in turn, and Undo takes back the last one.',
              "Tracing over a guide is copying, not reading, so it doesn't move kana up a belt. A round still counts for your streak and daily goal.",
              'Combined kana like きゃ are practised through their parts.',
            ],
          },
        ],
      },
      {
        id: 'rain',
        question: 'How does Kana Rain work?',
        answer: [
          'Kana fall from the sky. Type a kana\'s sound to clear it before it lands.',
          {
            bullets: [
              'Clearing one higher up scores more.',
              `You have ${RAIN_LIVES} lives. Each kana that lands costs one.`,
              'Every wave falls a little faster.',
              "It uses the hiragana you've opened, and it counts as typed practice: clearing a kana is a right answer. One that lands while you were typing it counts as a miss.",
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Keeping at it',
    topics: [
      {
        id: 'goal',
        question: 'How does the daily goal work?',
        answer: [
          `Choose ${GOALS.slice(0, -1).join(', ')} or ${GOALS[GOALS.length - 1]} a day. The ring at the top of the Learn screen shows today's progress.`,
          'Lessons, exams, duels (live ones too), the daily kata, and every game (Word Forge, the dungeon, memory match, the Taiko drill, calligraphy, Kana Rain) count. Change your goal in Settings, from the cog on the Dojo tab.',
        ],
      },
      {
        id: 'streak',
        question: 'How does my streak work?',
        answer: [
          'Train on a day (finish any lesson, exam, duel or game) and your streak grows by one.',
          {
            bullets: [
              'You start with 1 rest day, and earn another for every 7 days in a row. You can also buy one in the supply shed. You can hold 2.',
              'Miss a day and a rest day is used automatically, so your streak survives. A rest day keeps the streak but doesn\'t add to it.',
              'Miss a day with no rest days left and the streak starts again.',
            ],
          },
          'Tap the flame on the Learn screen to see your week.',
        ],
      },
      {
        id: 'assignments',
        question: 'What are assignments?',
        answer: [
          `${ASSIGNMENTS_PER_DAY} small tasks a day, on the Ranks tab, like "Finish 3 lessons" or "Settle 2 mix-ups". Tap one to go where it's done. New ones come at midnight.`,
          {
            bullets: [
              "Games you've played before get their own assignments, so you're pointed back at them.",
              `Each one done earns ${MON.assignment} mon. There's nothing to claim: they fill in as you train.`,
              `Finish ${MONTH_GOAL} in a calendar month for that month's moon. Each one hangs a lantern in your dojo and levels up the Moon-watcher badge.`,
            ],
          },
        ],
      },
      {
        id: 'mon',
        question: 'What are mon, and what is the supply shed?',
        answer: [
          `Mon are the old square-holed coins you earn by training: ${MON.lesson} for each lesson or game, ${MON.duel} for each duel (${MON.duel + MON.duelWin} if you win), ${MON.exam} for each belt exam passed, ${MON.assignment} for each assignment done, and ${MON.day} for each day you train. They can't be bought with money.`,
          `Spend them in the supply shed (through the curtained doorway in your dojo, or tap your mon on the Games or Dojo tab): a rest day for your streak is ${REST_DAY_PRICE} mon, and there's gear for Karasu, one piece for his head, face, body, neck and hand.`,
          'Some gear can only be earned: ' + GEAR.filter((g) => g.unlock).map((g) => `the ${g.name} (${g.unlock?.about.toLowerCase()})`).join(', ') + '.',
          "Gear is just for looks: nothing in the shed makes the training easier. Karasu wears what you've picked everywhere you see him.",
        ],
      },
      {
        id: 'profile',
        question: 'What do the numbers on the Dojo tab mean?',
        answer: [
          {
            bullets: [
              `Kana learned: kana at green belt or higher, out of ${KANA.length}.`,
              'Strike speed: your typical time for a right answer. Half your right answers are faster than this.',
              'Accuracy: your share of right answers, over everything you have answered.',
              'Unbroken badge: streak days, levelling up at 7, 30 and 100.',
              'Plaques: rows with a belt earned by exam, out of every row in both scripts. Scrolls won: duels won.',
              'Graded badge: row belts earned by exam, levelling up at 5, 10 and 20.',
              'Moon-watcher badge: monthly challenges met, levelling up at 1, 3 and 12.',
            ],
          },
        ],
      },
      {
        id: 'dojo',
        question: 'What is in my dojo?',
        answer: [
          'The Dojo tab is your room, and it fills up as you train. Anything not earned yet is drawn dashed, with a hint of what fills it.',
          {
            bullets: [
              'A plaque on the wall for each row with a belt earned by exam.',
              'A hanging scroll for the last duel you won.',
              'A practice sword on the weapon rack for each game record: Kana Rain, the dungeon, the Taiko drill and memory match.',
              'A lantern for each moon from the monthly challenge.',
              'A bonsai that grows with your streak: a sprout at 1 day, a young tree at 7, a full tree at 30, and blossom at 100.',
              'The curtained doorway leads to the supply shed.',
            ],
          },
        ],
      },
      {
        id: 'friends',
        question: 'How do friends work?',
        answer: [
          'Tap the two people at the top of the Dojo tab. Choose a name, then send someone your friend code, or type theirs to add them. Nobody can find you without your code.',
          {
            bullets: [
              "You're friends once they accept. Either of you can remove the other at any time.",
              "Friends see your name, rank, streak, today's training, and your dojo. Nothing else, and never your email.",
              'Friends need an account, so sign in from Settings first.',
            ],
          },
        ],
      },
      {
        id: 'ranks',
        question: 'What is the Ranks tab?',
        answer: [
          "Today's three assignments and the month's challenge, then your division, which follows your rank, with your lessons this week. Weekly leagues against other learners are coming later.",
        ],
      },
    ],
  },
  {
    title: 'Settings and your progress',
    topics: [
      {
        id: 'sound',
        question: 'How do I turn off sound or vibration?',
        answer: [
          'In Settings (the cog on the Dojo tab), use the Sound and Haptics switches. In a lesson, the speaker button at the top mutes sound too.',
          "Sound stays quiet while your phone is on silent. Even with Sound off, you can hear a kana from its page in the Kana tab.",
        ],
      },
      {
        id: 'saving',
        question: 'Where is my progress saved?',
        answer: [
          'On your phone, after every answer. You never need an account.',
          'If you want it on more than one device, sign in from Settings (the cog on the Dojo tab) with a code sent to your email. Your progress is then saved to your account too, and each device combines its progress with the account instead of replacing it.',
        ],
      },
    ],
  },
  {
    title: 'Credits',
    topics: [
      {
        id: 'strokes',
        question: 'Where does the stroke order come from?',
        answer: [
          'From KanjiVG (kanjivg.tagaini.net), by Ulrich Apel, shared under the Creative Commons Attribution-ShareAlike 3.0 licence (creativecommons.org/licenses/by-sa/3.0). The app keeps its copy of that data under the same licence.',
        ],
      },
      {
        id: 'credits',
        question: 'Where do the Word Forge pictures come from?',
        answer: [
          "They're Fluent Emoji, by Microsoft (github.com/microsoft/fluentui-emoji), shared under the MIT licence:",
          'Copyright (c) Microsoft Corporation.',
          "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:",
          "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.",
          "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE",
        ],
      },
    ],
  },
];
