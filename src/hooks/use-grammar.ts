import { useState } from 'react';

import { speakWord } from '@/audio/pronounce';
import { GRAMMAR_LESSONS } from '@/content/grammar';
import { completeLesson, setMyName } from '@/core/answers';
import { answerCard, currentCard, knownCards, markCard, nextRound, roundOver, startRound } from '@/core/flashcards';
import { DEFAULT_NAME, rubyText, sayCardIds, sayJapanese, sayRomaji, type GrammarLesson, type MyName, type SayCard } from '@/core/grammar';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';

export function lessonById(id: string): GrammarLesson | null {
  return GRAMMAR_LESSONS.find((l) => l.id === id) ?? null;
}

// Every lesson, with how many of its sentences you know.
export function useGrammarLessons() {
  const { progress } = useProgress();
  return GRAMMAR_LESSONS.map((lesson) => {
    const ids = sayCardIds(lesson);
    return { lesson, known: knownCards(progress, ids).length, total: ids.length };
  });
}

// The learner's name for sentences about themselves (GENKI's Mary until it's set), and setting it.
export function useMyName() {
  const { progress, updateProgress } = useProgress();
  return {
    name: progress.settings.myName ?? DEFAULT_NAME,
    set: progress.settings.myName !== null,
    save: (name: MyName) => updateProgress(setMyName(progress, name)),
  };
}

// A sentence card as shown: the English, the Japanese and its romaji, with the name filled in,
// and the grammar point it practises.
export type SaySentence = { id: string; en: string; ja: string; romaji: string; note: string | null; point: string };

function sentencesOf(lesson: GrammarLesson, name: MyName): Map<string, SaySentence> {
  const ids = sayCardIds(lesson);
  const cards = lesson.points.flatMap((point) => point.say.map((card) => ({ card, point: point.title })));
  return new Map(
    cards.map(({ card, point }, i): [string, SaySentence] => [
      ids[i]!,
      {
        id: ids[i]!,
        en: card.en.replaceAll('{name}', name.en),
        ja: sayJapanese(card.ja, name),
        romaji: sayRomaji(card.ja, name),
        note: (card as SayCard).note ?? null,
        point,
      },
    ]),
  );
}

// Practising a lesson's sentences (all, or just those still being learned), like the word
// flashcards: the English in front; say it in Japanese, turn it over to check it and hear it,
// and say whether you knew it. Round after round, as long as you like. Leaving keeps the
// session as training.
export function useSayCards(lesson: GrammarLesson, onlyLearning: boolean, shuffled: boolean) {
  const { progress, changeProgress } = useProgress();
  const haptics = useHaptics();
  const name = progress.settings.myName ?? DEFAULT_NAME;
  const [sentences] = useState(() => sentencesOf(lesson, name));
  const all = [...sentences.keys()];
  const [round, setRound] = useState(() => {
    const known = new Set(knownCards(progress, all));
    const learning = all.filter((id) => !known.has(id));
    return startRound(onlyLearning && learning.length > 0 ? learning : all, shuffled, Math.random);
  });
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const id = currentCard(round);
  const sentence = id ? (sentences.get(id) ?? null) : null;

  function speak() {
    if (sentence) speakWord(rubyText(sentence.ja));
  }

  function flip() {
    if (!sentence) return;
    const next = !flipped;
    setFlipped(next);
    // Turned over: hear it said.
    if (next && progress.settings.sound) speak();
  }

  function answer(know: boolean) {
    if (!id) return;
    changeProgress((p) => markCard(p, id, know, Date.now()));
    if (know) haptics.right();
    else haptics.miss();
    setAnswered(answered + 1);
    setRound(answerCard(round, know));
    setFlipped(false);
  }

  function again() {
    setRound(round.learning.length > 0 ? nextRound(round, shuffled, Math.random) : startRound(all, shuffled, Math.random));
    setFlipped(false);
  }

  // Keeps the session as training, once, if any sentences were answered.
  function finish() {
    if (answered === 0 || recorded) return;
    setRecorded(true);
    changeProgress((p) => completeLesson(p, `grammar:${lesson.id}`, Date.now(), answered));
  }

  return {
    sentence,
    flipped,
    at: round.at,
    total: round.cards.length,
    over: roundOver(round),
    known: round.known.length,
    learning: round.learning.length,
    lessonKnown: knownCards(progress, all).length,
    lessonTotal: all.length,
    answered,
    flip,
    answer,
    again,
    finish,
    speak,
  };
}
