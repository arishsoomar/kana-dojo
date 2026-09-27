import { useState } from 'react';

import { pronounce } from '@/audio/pronounce';
import { STROKES } from '@/constants/strokes';
import { completeLesson } from '@/core/answers';
import { CALLIGRAPHY_LESSON_ID, calligraphyKana, judgeStroke, type Point } from '@/core/calligraphy';
import type { Script } from '@/core/kana';
import { metKana } from '@/core/unlock';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';

// How long a finished kana stays on screen before the next.
const WRITTEN_MS = 1100;

// A note under the frame about the last stroke: good news, or something to fix.
export type StrokeNote = { text: string; good: boolean };

export type CalligraphyResult = { kana: number; clean: number; strokes: number };

// The kana a script can be written in: met, and a single character (so there's stroke data).
export function writableKana(progress: ReturnType<typeof useProgress>['progress'], script: Script) {
  return metKana(progress, script).filter((k) => STROKES[k.char] !== undefined);
}

// Runs a round of calligraphy in a script: five of the learner's kana to trace, stroke by stroke.
// Tracing over a guide is copying, not reading, so strokes aren't recorded as answers; the
// finished round counts toward the streak and daily goal.
export function useCalligraphy(script: Script) {
  const { progress, changeProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [round] = useState(() => calligraphyKana(progress, writableKana(progress, script), Math.random));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0); // strokes of this kana written
  const [note, setNote] = useState<StrokeNote | null>(null);
  const [written, setWritten] = useState(false); // this kana is finished, and shows for a moment
  const [clean, setClean] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<CalligraphyResult | null>(null);

  const kana = round[index] ?? null;
  const strokes = kana ? (STROKES[kana.char] ?? []) : [];

  function draw(points: Point[]) {
    const target = strokes[done];
    if (!kana || !target || written) return;
    const judgement = judgeStroke(points, target.points);
    const n = done + 1;
    if (judgement === 'off' || judgement === 'backwards') {
      haptics.miss();
      setNote({ text: judgement === 'backwards' ? `Stroke ${n} goes the other way` : `Try stroke ${n} again`, good: false });
      return;
    }
    haptics.right();
    const wasClean = judgement === 'clean';
    const cleanSoFar = clean + (wasClean ? 1 : 0);
    setClean(cleanSoFar);
    setTotal(total + 1);
    setDone(n);
    if (n < strokes.length) {
      setNote({ text: wasClean ? `Stroke ${n} was clean` : `Stroke ${n} is good`, good: true });
      return;
    }
    // The whole kana is written: say it, then on to the next, or the end of the round.
    setNote({ text: `${kana.char} written: ${kana.romaji[0]}`, good: true });
    setWritten(true);
    if (progress.settings.sound) pronounce(kana);
    setTimeout(() => {
      if (index + 1 < round.length) {
        setIndex(index + 1);
        setDone(0);
        setNote(null);
        setWritten(false);
        return;
      }
      changeProgress((current) => completeLesson(current, CALLIGRAPHY_LESSON_ID, Date.now(), cleanSoFar));
      haptics.thunk();
      sounds.play('taiko');
      setResult({ kana: round.length, clean: cleanSoFar, strokes: total + 1 });
    }, WRITTEN_MS);
  }

  // Takes back the last stroke of this kana.
  function undo() {
    if (done === 0 || written) return;
    setDone(done - 1);
    setNote(null);
  }

  return { round, index, kana, strokes, done, note, written, result, draw, undo };
}
