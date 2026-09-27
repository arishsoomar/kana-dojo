import { useEffect, useEffectEvent, useState } from 'react';

import { playTaikoSong } from '@/audio/effects';
import { bestScore, completeLesson, recordAnswer } from '@/core/answers';
import type { Kana, Script } from '@/core/kana';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { BEAT_MS, SONG_BEATS, startTaiko, sweepTaiko, taikoId, tapTaiko, type Judgement, type Note } from '@/core/taiko';
import { metKana } from '@/core/unlock';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { postWallNews } from './wall-news';

export type TaikoResult = { score: number; hits: number; bestCombo: number; best: number | null; summary: LessonSummary };

// Runs one play of the Taiko drill in a script: the song starts at once, and the notes are
// timed from that moment.
export function useTaiko(script: Script) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sound = progress.settings.sound;
  const [startProgress] = useState(progress);
  const [game, setGame] = useState(() => startTaiko(progress, metKana(progress, script), Math.random));
  const [startedAt] = useState(() => Date.now());
  const [time, setTime] = useState(0); // ms since the song started
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  // The last judgement, for the "Perfect!" pop. The id replays it for the same judgement twice.
  const [last, setLast] = useState<{ judgement: Judgement; id: number } | null>(null);
  const [result, setResult] = useState<TaikoResult | null>(null);

  // The song, while the game runs.
  useEffect(() => {
    if (!sound) return;
    return playTaikoSong();
  }, [sound]);

  // Records how a note went: a hit is a right answer (timed at one beat, the time it had to be
  // read on its way to the ring); a wrong sound logs the mix-up; a note let past has no guess.
  function record(note: Note, correct: boolean, guess: Kana | null) {
    const now = Date.now();
    changeProgress((current) => recordAnswer(current, { char: note.kana.char, guess: guess?.char ?? null, ms: BEAT_MS, now }));
    return { char: note.kana.char, correct, ms: BEAT_MS };
  }

  function finish(finalScore: number, hits: number, bestCombo: number, answersSoFar: LessonAnswer[]) {
    const best = bestScore(currentProgress(), taikoId(script));
    changeProgress((current) => completeLesson(current, taikoId(script), Date.now(), finalScore));
    haptics.thunk();
    const summary = summarizeLesson(startProgress, currentProgress(), answersSoFar);
    postWallNews({ opened: summary.rowsOpened });
    setResult({ score: finalScore, hits, bestCombo, best, summary });
  }

  // Each frame: move time on, and miss any notes let past the ring. The song's end finishes it.
  const onFrame = useEffectEvent(() => {
    if (result) return;
    const now = Date.now() - startedAt;
    setTime(now);
    const { state, missed } = sweepTaiko(game, now);
    if (missed.length === 0) {
      if (game.done && now > SONG_BEATS * BEAT_MS) finish(game.score, game.hits, game.bestCombo, answers);
      return;
    }
    haptics.miss();
    const recorded = missed.map((note) => record(note, false, null));
    setGame(state);
    setAnswers((a) => [...a, ...recorded]);
    setLast({ judgement: 'miss', id: missed[missed.length - 1]!.id });
  });

  useEffect(() => {
    let frame = requestAnimationFrame(function loop() {
      onFrame();
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function tap(kana: Kana) {
    if (result) return;
    const now = Date.now() - startedAt;
    const { state, judged } = tapTaiko(game, now, kana);
    if (!judged) return;
    if (judged.correct) haptics.right();
    else haptics.miss();
    const answer = record(judged.note, judged.correct, judged.correct ? null : judged.guess);
    setGame(state);
    setAnswers((a) => [...a, answer]);
    setLast({ judgement: judged.judgement, id: judged.note.id });
  }

  return { game, time, last, result, tap };
}
