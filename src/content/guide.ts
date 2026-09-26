import { FAST_MS } from '@/core/answers';
import { DUEL_LOSS, DUEL_READY_MIXUPS, DUEL_WIN } from '@/core/duel';
import { EXAM_LENGTH, EXAM_PASS, EXAM_TIME_MS } from '@/core/exam';
import { DAILY_GOALS } from '@/core/goal';
import { KANA } from '@/core/kana';
import { LESSON_LENGTH } from '@/core/lesson';
import { NAMED_PAIRS } from '@/core/pairs';
import { RAIN_LIVES } from '@/core/rain';

// The in-app guide: how the dojo works, as questions a learner might ask. Numbers come from
// the engine itself, so the guide stays right if a rule changes.

// A block of an answer: a paragraph, a bulleted list, or the belt ladder picture.
export type GuideBlock = string | { bullets: string[] } | { belts: true };

export type GuideTopic = { id: string; question: string; answer: GuideBlock[] };
export type GuideSection = { title: string; topics: GuideTopic[] };

const FAST = `${FAST_MS / 1000} seconds`;
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
          `A dojo for learning to read the Japanese kana: hiragana and katakana, ${KANA.length / 2} of each, counting the 46 basic kana and their dakuten and handakuten forms. The goal is to read each one at a glance, without having to stop and recall it.`,
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
        question: 'What are dakuten and handakuten?',
        answer: [
          'Two small marks that change a kana\'s sound. After the わ row, the wall has five more rows made with them:',
          {
            bullets: [
              'Dakuten ゛, two little strokes, voice the sound: か ka → が ga, さ sa → ざ za, た ta → だ da, は ha → ば ba.',
              'Handakuten ゜, a little circle, turns h into p: は ha → ぱ pa.',
              'ぢ and づ sound just like じ (ji) and ず (zu), so either spelling is right when you type them. They\'re rare; じ and ず are the usual way to write those sounds.',
            ],
          },
          'Combos like きゃ (kya), called yōon, are still to come.',
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
          'Switch with Tap / Type at the top of any lesson, or with Type answers on the Profile tab. You can type any common spelling, like shi or si.',
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
          'Lessons, exams, duels and Kana Rain games all count. Change your goal on the Profile tab.',
        ],
      },
      {
        id: 'streak',
        question: 'How does my streak work?',
        answer: [
          'Train on a day (finish any lesson, exam, duel or game) and your streak grows by one.',
          {
            bullets: [
              'You start with 1 rest day, and earn another for every 7 days in a row. You can hold 2.',
              'Miss a day and a rest day is used automatically, so your streak survives. A rest day keeps the streak but doesn\'t add to it.',
              'Miss a day with no rest days left and the streak starts again.',
            ],
          },
          'Tap the flame on the Learn screen to see your week.',
        ],
      },
      {
        id: 'profile',
        question: 'What do the numbers on my Profile mean?',
        answer: [
          {
            bullets: [
              `Kana learned: kana at green belt or higher, out of ${KANA.length}.`,
              'Strike speed: your typical time for a right answer. Half your right answers are faster than this.',
              'Accuracy: your share of right answers, over everything you have answered.',
              'Unbroken badge: streak days, levelling up at 7, 30 and 100.',
              'Graded badge: row belts earned by exam, levelling up at 5, 10 and 20.',
            ],
          },
        ],
      },
      {
        id: 'ranks',
        question: 'What is the Ranks tab?',
        answer: [
          'Your division, which follows your rank, and your lessons this week. Weekly leagues against other learners are coming later.',
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
          'On the Profile tab, use the Sound and Haptics switches. In a lesson, the speaker button at the top mutes sound too.',
          "Sound stays quiet while your phone is on silent. Even with Sound off, you can hear a kana from its page in the Kana tab.",
        ],
      },
      {
        id: 'saving',
        question: 'Where is my progress saved?',
        answer: [
          'On your phone, after every answer. You never need an account.',
          'If you want it on more than one device, sign in from the Profile tab with a code sent to your email. Your progress is then saved to your account too, and each device combines its progress with the account instead of replacing it.',
        ],
      },
    ],
  },
];
