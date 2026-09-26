import { useEffect, useState } from 'react';

import { completeLesson, recordAnswer } from '@/core/answers';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { dealMemory, fewestMoves, flipCard, hideMiss, memoryId, type MemoryMode } from '@/core/memory';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { postWallNews } from './wall-news';

// How long a missed two stay up before turning back over.
const MISS_MS = 900;

export type MemoryResult = { moves: number; seconds: number; best: number | null; summary: LessonSummary };

// Runs one game of memory match in a mode. The cards are dealt when it starts.
export function useMemory(mode: MemoryMode) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [startProgress] = useState(progress);
  const [game, setGame] = useState(() => dealMemory(progress, mode, Math.random));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [firstAt, setFirstAt] = useState(0); // when the first of two cards was turned
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  // What Karasu says: what was just found, or a nudge after a miss.
  const [said, setSaid] = useState('Find the pairs.');
  const [result, setResult] = useState<MemoryResult | null>(null);

  // The clock, once a second, until the game ends.
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [result]);

  function flip(id: number) {
    const time = Date.now();
    const { game: next, flip: what } = flipCard(game, id);
    if (what.kind === 'ignored') return;
    setGame(next);

    if (what.kind === 'first') {
      setFirstAt(time);
      return;
    }
    if (what.kind === 'miss') {
      haptics.miss();
      setSaid('Not a pair. Remember where they were.');
      setTimeout(() => setGame((current) => hideMiss(current)), MISS_MS);
      return;
    }

    // A pair: it counts as a right answer for its kana (both, when it's hiragana and katakana),
    // timed from the first card to the second.
    haptics.right();
    const cards = next.cards.filter((c) => c.pair === what.pair);
    const kana = [...new Set(cards.map((c) => c.kana))];
    const ms = time - firstAt;
    changeProgress((current) =>
      kana.reduce((p, k) => recordAnswer(p, { char: k.char, guess: k.char, ms, now: time }), current),
    );
    const answersSoFar = [...answers, ...kana.map((k) => ({ char: k.char, correct: true, ms }))];
    setAnswers(answersSoFar);
    setSaid(`${cards.map((c) => c.face).join(' and ')}. That's a pair.`);

    if (next.done) {
      const best = fewestMoves(currentProgress(), mode);
      changeProgress((current) => completeLesson(current, memoryId(mode), time, next.moves));
      haptics.thunk();
      sounds.play('taiko');
      const summary = summarizeLesson(startProgress, currentProgress(), answersSoFar);
      postWallNews({ opened: summary.rowsOpened });
      setResult({ moves: next.moves, seconds: Math.round((time - startedAt) / 1000), best, summary });
    }
  }

  return {
    game,
    said,
    result,
    seconds: Math.round((now - startedAt) / 1000),
    flip,
  };
}
