import { useMemo, useState } from 'react';

import { speakWord } from '@/audio/pronounce';
import { PHRASES } from '@/content/phrases';
import { PLACES } from '@/content/signs';
import { bestScore, completeLesson } from '@/core/answers';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import {
  phraseRound,
  phraseText,
  placeOpen,
  READING_ROUND,
  readingId,
  readyPhrases,
  readySigns,
  signRound,
  SIGNS_TO_OPEN,
  type Phrase,
  type PhraseQuestion,
  type ReadingSet,
  type Sign,
  type SignQuestion,
} from '@/core/reading';
import { metKana } from '@/core/unlock';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';

// The characters of every kana the learner has met, in both scripts: a sign or phrase can be
// read once all of its kana are among them.
export function useKnownKana(): ReadonlySet<string> {
  const { progress } = useProgress();
  return useMemo(
    () => new Set([...metKana(progress, 'hiragana'), ...metKana(progress, 'katakana')].map((k) => k.char)),
    [progress],
  );
}

export type RoomSet = {
  id: ReadingSet;
  name: string; // "The station"
  kana: string; // えき
  ready: number; // signs or phrases that can be read now
  total: number;
  open: boolean;
  best: number | null; // the best round, in questions read right
};

// The reading room's list: each place, then the phrases, with what's ready in them.
export function useReadingRoom(): RoomSet[] {
  const { progress } = useProgress();
  const known = useKnownKana();
  const places = PLACES.map((place): RoomSet => {
    const ready = readySigns(place, known).length;
    return {
      id: place.id,
      name: place.name,
      kana: place.kana,
      ready,
      total: place.signs.length,
      open: placeOpen(place, known),
      best: bestScore(progress, readingId(place.id)),
    };
  });
  const phrases = readyPhrases(PHRASES, known).length;
  return [
    ...places,
    {
      id: 'phrases',
      name: 'Phrases',
      kana: 'こんにちは',
      ready: phrases,
      total: PHRASES.length,
      open: phrases >= SIGNS_TO_OPEN,
      best: bestScore(progress, readingId('phrases')),
    },
  ];
}

// A question in the reading room: find a sign, or say what a phrase means.
export type ReadingQuestion = { kind: 'sign'; question: SignQuestion } | { kind: 'phrase'; question: PhraseQuestion };

export type ReadingResult = { right: number; total: number; summary: LessonSummary };

// A round of the reading room from one set: its questions are chosen when it starts. Each
// answer shows how the right one reads before moving on.
export function useReadingRound(set: ReadingSet) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const known = useKnownKana();
  const sound = progress.settings.sound;

  const [startProgress] = useState(progress);
  const [questions] = useState((): ReadingQuestion[] => {
    if (set === 'phrases') {
      return phraseRound(PHRASES, known, Math.random, READING_ROUND).map((question) => ({ kind: 'phrase', question }));
    }
    const place = PLACES.find((p) => p.id === set);
    return place ? signRound(place, known, Math.random, READING_ROUND).map((question) => ({ kind: 'sign', question })) : [];
  });
  const [index, setIndex] = useState(0);
  // The option tapped for this question, once it's answered.
  const [picked, setPicked] = useState<Sign | Phrase | null>(null);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [reaction, setReaction] = useState<{ kind: 'hop' | 'shake'; id: number } | null>(null);
  const [result, setResult] = useState<ReadingResult | null>(null);

  const current = questions[index] ?? null;
  const answer = current?.question.answer ?? null;

  function pick(option: Sign | Phrase) {
    if (!current || !answer || picked || result) return;
    const correct = option === answer;
    setPicked(option);
    setAnswers([...answers, { char: answer.text, correct, ms: Date.now() - shownAt }]);
    setReaction({ kind: correct ? 'hop' : 'shake', id: index });
    if (correct) haptics.right();
    else haptics.miss();
    // Hear the right one read aloud.
    if (sound) speakWord(current.kind === 'phrase' ? phraseText(current.question.answer) : answer.text);
  }

  function next() {
    if (!picked) return;
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      setShownAt(Date.now());
      return;
    }
    const right = answers.filter((a) => a.correct).length;
    changeProgress((p) => completeLesson(p, readingId(set), Date.now(), right));
    haptics.thunk();
    sounds.play('taiko');
    setResult({ right, total: questions.length, summary: summarizeLesson(startProgress, currentProgress(), answers) });
  }

  return {
    ready: questions.length > 0,
    current,
    picked,
    correct: picked !== null && picked === answer,
    reaction,
    result,
    fraction: (index + (picked ? 1 : 0)) / Math.max(questions.length, 1),
    pick,
    next,
  };
}
