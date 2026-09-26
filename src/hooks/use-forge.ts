import { useState } from 'react';

import { speakWord } from '@/audio/pronounce';
import { completeLesson, setSound, setTyping } from '@/core/answers';
import { pairTipFor } from '@/core/feedback';
import {
  FORGE_LESSON_ID,
  forgeOptions,
  forgeRound,
  readChosen,
  readTyped,
  readyWords,
  recordReading,
  wordRomaji,
  type ForgeOption,
  type ForgeWord,
  type Reading,
} from '@/core/forge';
import { metKana } from '@/core/unlock';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { kanaTip } from '@/core/tips';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { postWallNews } from './wall-news';

// The last word answered wrong, for its correction: the reading, and what was picked or typed.
export type ForgeMiss = { word: ForgeWord; reading: Reading; picked: ForgeOption | null; typed: string | null };

export type ForgeResult = { right: number; total: number; summary: LessonSummary };

// Runs a round of Word Forge: ten words from the Learn screen's script, each read by tapping
// its romaji or typing it. The words and options are chosen when the round starts.
export function useForge() {
  const { progress, updateProgress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const script = progress.settings.script;
  const typing = progress.settings.typing;
  const sound = progress.settings.sound;

  const [startProgress] = useState(progress);
  const [round] = useState(() => forgeRound(readyWords(progress, script), Math.random));
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState(() => optionsFor(round[0]));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [right, setRight] = useState(0);
  const [miss, setMiss] = useState<ForgeMiss | null>(null);
  // The word just answered, shown with its meaning (and spoken) until the next answer.
  const [heard, setHeard] = useState<ForgeWord | null>(null);
  const [reaction, setReaction] = useState<{ kind: 'hop' | 'shake'; id: number } | null>(null);
  const [result, setResult] = useState<ForgeResult | null>(null);

  const word = round[index] ?? null;

  // Wrong options are made from the kana the learner has met, so every misreading is plausible.
  function optionsFor(w: ForgeWord | undefined): ForgeOption[] {
    return w ? forgeOptions(w, metKana(progress, script), Math.random) : [];
  }

  function answer(reading: Reading, picked: ForgeOption | null, typed: string | null) {
    if (!word || miss || result) return;
    const now = Date.now();
    const { progress: next, answers: judged } = recordReading(currentProgress(), word, reading, now - shownAt, now, typed !== null);
    updateProgress(next);
    const nextAnswers = [...answers, ...judged];
    setAnswers(nextAnswers);
    setHeard(word);
    if (sound) speakWord(word.word.text);
    setReaction({ kind: reading.correct ? 'hop' : 'shake', id: index });
    if (reading.correct) {
      haptics.right();
      setRight(right + 1);
      advance(nextAnswers, right + 1);
    } else {
      haptics.miss();
      setMiss({ word, reading, picked, typed });
    }
  }

  function pick(option: ForgeOption) {
    if (word) answer(readChosen(word, option), option, null);
  }

  function type(text: string) {
    if (word) answer(readTyped(word, text), null, text.trim());
  }

  // The next word, or the end of the round. Takes the answers and words right so far, since
  // straight after a right answer the state holding them hasn't updated yet.
  function advance(answersSoFar: LessonAnswer[], rightSoFar: number) {
    const nextIndex = index + 1;
    setMiss(null);
    if (nextIndex >= round.length) {
      changeProgress((current) => completeLesson(current, FORGE_LESSON_ID, Date.now(), rightSoFar));
      haptics.thunk();
      sounds.play('taiko');
      const summary = summarizeLesson(startProgress, currentProgress(), answersSoFar);
      postWallNews({ opened: summary.rowsOpened });
      setResult({ right: rightSoFar, total: round.length, summary });
      return;
    }
    setIndex(nextIndex);
    setOptions(optionsFor(round[nextIndex]));
    setShownAt(Date.now());
  }

  return {
    ready: round.length > 0,
    word,
    options,
    miss,
    heard,
    reaction,
    result,
    fraction: index / Math.max(round.length, 1),
    // Changes with each new word, so the typing box knows to clear.
    questionKey: shownAt,
    typing,
    sound,
    pick,
    type,
    goToNext: () => advance(answers, right),
    toggleTyping: () => updateProgress(setTyping(currentProgress(), !typing)),
    toggleSound: () => updateProgress(setSound(currentProgress(), !sound)),
  };
}

// The word's romaji and the tip for its first misread kana: how to tell it from the kana
// read instead, or its own memory tip.
export function missDetails(miss: ForgeMiss): { romaji: string; tip: string | null; misread: string | null } {
  const wrong = miss.reading.units.find((u) => !u.correct);
  const tip = wrong ? (pairTipFor(wrong.kana.char, wrong.guess ? [wrong.guess.char] : []) ?? kanaTip(wrong.kana.char)) : null;
  const misread = wrong ? (wrong.guess ? `${wrong.kana.char} is ${wrong.kana.romaji[0]}, not ${wrong.guess.romaji[0]}.` : `${wrong.kana.char} is ${wrong.kana.romaji[0]}.`) : null;
  return { romaji: wordRomaji(miss.word.units), tip, misread };
}
