import { useState } from 'react';

import { GRAMMAR_LESSONS, UNIT_NAMES } from '@/content/grammar';
import { completeLesson, type Progress } from '@/core/answers';
import { checkAnswer, exerciseAnswer, formOptions, grammarId, grammarPath, type Exercise, type GrammarLesson } from '@/core/grammar';
import { GRAMMAR_REVIEW_ID, grammarDue, ratingFromScore, reviewExercises, reviewGrammar } from '@/core/grammar-review';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { shuffle } from '@/core/random';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { dayBounds, useToday } from './use-today';

const LESSON_IDS = GRAMMAR_LESSONS.map((l) => l.id);

// The grammar path: each unit with its lessons, and whether each is done, current or locked.
export function useGrammarPath() {
  const { progress } = useProgress();
  const path = grammarPath(progress, GRAMMAR_LESSONS);
  const units = [...new Set(path.map((p) => p.lesson.unit))].map((unit) => ({
    unit,
    name: UNIT_NAMES[unit] ?? '',
    lessons: path.filter((p) => p.lesson.unit === unit),
  }));
  return { units, done: path.filter((p) => p.state === 'done').length, total: path.length };
}

export function lessonById(id: string): GrammarLesson | null {
  return GRAMMAR_LESSONS.find((l) => l.id === id) ?? null;
}

// Grammar points due for review today.
export function useGrammarDue(): number {
  const { progress } = useProgress();
  const today = useToday();
  return grammarDue(progress, LESSON_IDS, dayBounds(today).end).length;
}

// What an exercise shows to choose from: its options (or, for putting words in order, its
// pieces), shuffled once when it starts. Pieces are never shown already in order.
function choicesFor(exercise: Exercise): string[] {
  if (exercise.kind === 'order') {
    let pieces = shuffle(exercise.pieces, Math.random);
    for (let i = 0; i < 5 && pieces.every((p, j) => p === exercise.pieces[j]); i++) pieces = shuffle(exercise.pieces, Math.random);
    return pieces;
  }
  if (exercise.kind === 'form') return shuffle(formOptions(exercise.reading, exercise.pos, exercise.form), Math.random);
  return shuffle(exercise.options, Math.random);
}

// One exercise, and the lesson (grammar point) it's from.
type Item = { lesson: GrammarLesson; exercise: Exercise };

// Right and wrong answers for each lesson, from a run's answers.
function scoreByLesson(items: readonly Item[], answers: readonly LessonAnswer[]): Map<string, { right: number; total: number }> {
  const scores = new Map<string, { right: number; total: number }>();
  answers.forEach((answer, i) => {
    const id = items[i]?.lesson.id;
    if (!id) return;
    const score = scores.get(id) ?? { right: 0, total: 0 };
    scores.set(id, { right: score.right + (answer.correct ? 1 : 0), total: score.total + 1 });
  });
  return scores;
}

export type GrammarResult = { right: number; total: number; summary: LessonSummary };

// Going through exercises one at a time: each checked by the rules and explained. At the end,
// `finish` turns the answers into what's saved, and the result is shown.
function useExerciseRun(items: readonly Item[], finish: (progress: Progress, answers: readonly LessonAnswer[], now: number) => Progress) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [startProgress] = useState(progress);
  const [choices] = useState(() => items.map((item) => choicesFor(item.exercise)));
  const [index, setIndex] = useState(0);
  // The pieces put in order so far, for an order exercise.
  const [built, setBuilt] = useState<string[]>([]);
  // What was answered for this exercise, and whether it was right; null until it's answered.
  const [answered, setAnswered] = useState<{ answer: string | string[]; right: boolean } | null>(null);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [result, setResult] = useState<GrammarResult | null>(null);

  const item = items[index] ?? null;
  const exercise = item?.exercise ?? null;

  function answer(given: string | string[]) {
    if (!item || answered) return;
    const right = checkAnswer(item.exercise, given);
    if (right) haptics.right();
    else haptics.miss();
    setAnswered({ answer: given, right });
    setAnswers([...answers, { char: `${item.lesson.id}:${index}`, correct: right, ms: Date.now() - shownAt }]);
  }

  function next() {
    if (!answered) return;
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setAnswered(null);
      setBuilt([]);
      setShownAt(Date.now());
      return;
    }
    const now = Date.now();
    changeProgress((p) => finish(p, answers, now));
    haptics.thunk();
    sounds.play('taiko');
    const right = answers.filter((a) => a.correct).length;
    setResult({ right, total: items.length, summary: summarizeLesson(startProgress, currentProgress(), answers) });
  }

  return {
    lesson: item?.lesson ?? null,
    exercise,
    choices: choices[index] ?? [],
    rightAnswer: exercise ? exerciseAnswer(exercise) : null,
    built,
    // Order exercises: add a piece to the sentence, or take one back out.
    addPiece: (piece: string) => !answered && setBuilt([...built, piece]),
    removePiece: (at: number) => !answered && setBuilt(built.filter((_, i) => i !== at)),
    answered,
    answer,
    next,
    fraction: (index + (answered ? 1 : 0)) / Math.max(items.length, 1),
    result,
  };
}

export type ExerciseRun = ReturnType<typeof useExerciseRun>;

// A grammar lesson: first its explanations, then its exercises. Finishing it keeps it as a
// finished lesson, which opens the next, and starts (or reschedules) its review card.
export function useGrammarLesson(lesson: GrammarLesson) {
  const [phase, setPhase] = useState<'learn' | 'practice'>('learn');
  const [items] = useState(() => lesson.exercises.map((exercise) => ({ lesson, exercise })));
  const run = useExerciseRun(items, (progress, answers, now) => {
    const right = answers.filter((a) => a.correct).length;
    const done = completeLesson(progress, grammarId(lesson.id), now, right);
    return reviewGrammar(done, lesson.id, ratingFromScore(right, answers.length), now);
  });
  return { ...run, phase, startPractice: () => setPhase('practice') };
}

// Reviewing grammar: each point due today, a few of its exercises each, rated by how they
// went. The session is kept as training, like a lesson.
export function useGrammarReview() {
  const { progress } = useProgress();
  const today = useToday();
  const [items] = useState<Item[]>(() =>
    grammarDue(progress, LESSON_IDS, dayBounds(today).end).flatMap((id) => {
      const lesson = lessonById(id);
      return lesson ? reviewExercises(lesson.exercises, Math.random).map((exercise) => ({ lesson, exercise })) : [];
    }),
  );
  const run = useExerciseRun(items, (start, answers, now) => {
    let next = start;
    const scores = scoreByLesson(items, answers);
    for (const [id, { right, total }] of scores) next = reviewGrammar(next, id, ratingFromScore(right, total), now);
    return completeLesson(next, GRAMMAR_REVIEW_ID, now, scores.size);
  });
  return { ...run, points: new Set(items.map((i) => i.lesson.id)).size, ready: items.length > 0 };
}
