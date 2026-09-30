import { useState } from 'react';

import { GRAMMAR_LESSONS, UNIT_NAMES } from '@/content/grammar';
import { completeLesson } from '@/core/answers';
import { checkAnswer, exerciseAnswer, formOptions, grammarId, grammarPath, type Exercise, type GrammarLesson } from '@/core/grammar';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { shuffle } from '@/core/random';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';

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

// What an exercise shows to choose from: its options (or, for putting words in order, its
// pieces), shuffled once when the lesson starts. Pieces are never shown already in order.
function choicesFor(exercise: Exercise): string[] {
  if (exercise.kind === 'order') {
    let pieces = shuffle(exercise.pieces, Math.random);
    for (let i = 0; i < 5 && pieces.every((p, j) => p === exercise.pieces[j]); i++) pieces = shuffle(exercise.pieces, Math.random);
    return pieces;
  }
  if (exercise.kind === 'form') return shuffle(formOptions(exercise.word, exercise.pos, exercise.form), Math.random);
  return shuffle(exercise.options, Math.random);
}

export type GrammarResult = { right: number; total: number; summary: LessonSummary };

// A grammar lesson: first its explanations, then its exercises one at a time, each checked by
// the rules and explained. Finishing it keeps it as a finished lesson, which opens the next.
export function useGrammarLesson(lesson: GrammarLesson) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [startProgress] = useState(progress);
  const [phase, setPhase] = useState<'learn' | 'practice'>('learn');
  const [choices] = useState(() => lesson.exercises.map(choicesFor));
  const [index, setIndex] = useState(0);
  // The pieces put in order so far, for an order exercise.
  const [built, setBuilt] = useState<string[]>([]);
  // What was answered for this exercise, and whether it was right; null until it's answered.
  const [answered, setAnswered] = useState<{ answer: string | string[]; right: boolean } | null>(null);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [result, setResult] = useState<GrammarResult | null>(null);

  const exercise = lesson.exercises[index] ?? null;

  function answer(given: string | string[]) {
    if (!exercise || answered) return;
    const right = checkAnswer(exercise, given);
    if (right) haptics.right();
    else haptics.miss();
    setAnswered({ answer: given, right });
    setAnswers([...answers, { char: `${lesson.id}:${index}`, correct: right, ms: Date.now() - shownAt }]);
  }

  function next() {
    if (!answered) return;
    if (index + 1 < lesson.exercises.length) {
      setIndex(index + 1);
      setAnswered(null);
      setBuilt([]);
      setShownAt(Date.now());
      return;
    }
    const right = answers.filter((a) => a.correct).length;
    changeProgress((p) => completeLesson(p, grammarId(lesson.id), Date.now(), right));
    haptics.thunk();
    sounds.play('taiko');
    setResult({ right, total: lesson.exercises.length, summary: summarizeLesson(startProgress, currentProgress(), answers) });
  }

  return {
    phase,
    startPractice: () => {
      setPhase('practice');
      setShownAt(Date.now());
    },
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
    fraction: (index + (answered ? 1 : 0)) / Math.max(lesson.exercises.length, 1),
    result,
  };
}
